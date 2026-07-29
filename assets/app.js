/* ------------------------------------------------------------------
   Frontier AI Readiness Navigator
   Vanilla JS. No build step, no dependencies.
   ------------------------------------------------------------------ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const state = {
  domain: 'soc',
  view:   'current',
  node:   null,
  zoom:   1
};

function esc(str){
  return String(str).replace(/[&<>"']/g, c => (
    { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
  ));
}
const domain = () => DATA[state.domain];
const flow   = () => domain()[state.view];
const layout = () => LAYOUT[state.domain][state.view];
const nodeBy = num => flow().nodes.find(n => n.n === num);

/* ---------------------------------------------------------------- tabs */
function renderTabs(){
  $('#tabs').innerHTML = DOMAIN_ORDER.map(k => `
    <button role="tab" data-domain="${k}" aria-selected="${k === state.domain}">${esc(DATA[k].name)}</button>
  `).join('');
}

/* ================================================================
   GEOMETRY
   ================================================================ */
function laneGeom(count){
  const inner = GEO.canvasW - GEO.padX * 2 - GEO.laneGap * (count - 1);
  const laneW = inner / count;
  return { laneW, x: i => GEO.padX + i * (laneW + GEO.laneGap) };
}

function buildLayout(){
  const f = flow(), lay = layout();
  const g = laneGeom(f.phases.length);
  const bandNodes = (lay.band && lay.band.nodes) || [];

  const rowVals = Object.values(lay.rows);
  const maxRow  = rowVals.length ? Math.max(...rowVals) : 0;
  const bodyH   = GEO.rowTop + maxRow * GEO.rowH + GEO.nodeH + GEO.padBottom;

  const hasBand = !!lay.band || !!f.foundation;
  const bandY   = bodyH + GEO.bandGap;
  const totalH  = hasBand ? bandY + GEO.bandH + GEO.padBottom : bodyH;

  const boxes = {};
  f.nodes.forEach(n => {
    if (bandNodes.includes(n.n)){
      const i = bandNodes.indexOf(n.n);
      boxes[n.n] = { x: GEO.padX + 54 + i * 288, y: bandY + 14, w: 262, h: GEO.bandH - 28, node:n, inBand:true };
      return;
    }
    const row = lay.rows[n.n];
    if (row === undefined) return;
    const isD = n.k === 'decision';
    const w   = isD ? Math.min(GEO.diamondW, g.laneW - 16) : g.laneW - 16;
    const h   = isD ? GEO.diamondH : GEO.nodeH;
    boxes[n.n] = {
      x: g.x(n.p) + (g.laneW - w) / 2,
      y: GEO.rowTop + row * GEO.rowH + (GEO.nodeH - h) / 2,
      w, h, node:n
    };
  });

  return { boxes, g, bodyH, bandY, totalH, hasBand };
}

/* orthogonal connector routing, with a label anchor */
function edgePath(A, B, route){
  const aCx = A.x + A.w / 2, aCy = A.y + A.h / 2;
  const bCx = B.x + B.w / 2, bCy = B.y + B.h / 2;

  /* reject / loop-back path: out of the left edge, up the lane gutter,
     back in. Keeps the label out of the cramped row gap. */
  if (route === 'around'){
    const mx = Math.min(A.x, B.x) - 23;
    return {
      d:  `M${A.x},${aCy} L${mx},${aCy} L${mx},${bCy} L${B.x},${bCy}`,
      lx: mx, ly: (aCy + bCy) / 2
    };
  }

  if (B.x > A.x + A.w - 2){                                  // right
    const sx = A.x + A.w, ex = B.x, mx = sx + (ex - sx) / 2;
    if (Math.abs(aCy - bCy) < 3)
      return { d:`M${sx},${aCy} L${ex},${bCy}`, lx:mx, ly:aCy - 11 };
    return { d:`M${sx},${aCy} L${mx},${aCy} L${mx},${bCy} L${ex},${bCy}`, lx:mx, ly:(aCy + bCy) / 2 };
  }
  if (B.x + B.w < A.x + 2){                                  // left
    const sx = A.x, ex = B.x + B.w, mx = ex + (sx - ex) / 2;
    if (Math.abs(aCy - bCy) < 3)
      return { d:`M${sx},${aCy} L${ex},${bCy}`, lx:mx, ly:aCy - 11 };
    return { d:`M${sx},${aCy} L${mx},${aCy} L${mx},${bCy} L${ex},${bCy}`, lx:mx, ly:(aCy + bCy) / 2 };
  }
  if (B.y > A.y + A.h - 2){                                  // below
    const sy = A.y + A.h, ey = B.y, my = sy + (ey - sy) / 2;
    if (Math.abs(aCx - bCx) < 3)
      return { d:`M${aCx},${sy} L${bCx},${ey}`, lx:aCx, ly:my };
    return { d:`M${aCx},${sy} L${aCx},${my} L${bCx},${my} L${bCx},${ey}`, lx:(aCx + bCx) / 2, ly:my };
  }
  if (B.y + B.h < A.y + 2){                                  // above
    const sy = A.y, ey = B.y + B.h, my = sy + (ey - sy) / 2;
    return { d:`M${aCx},${sy} L${aCx},${my} L${bCx},${my} L${bCx},${ey}`, lx:(aCx + bCx) / 2, ly:my };
  }
  return { d:`M${aCx},${aCy} L${bCx},${bCy}`, lx:(aCx + bCx) / 2, ly:(aCy + bCy) / 2 };
}

/* Nudge a connector label clear of any node it would sit on top of.
   Labels are centred on (cx, cy); candidates are tried in order and the
   first one that hits nothing wins. */
function placeLabel(cx, cy, w, h, obstacles){
  const OFFSETS = [[0,0],[0,-40],[0,40],[0,-74],[0,74],[0,-110],[0,110],
                   [-96,0],[96,0],[-96,-52],[96,-52],[-96,52],[96,52]];
  const hits = (x, y) => obstacles.some(o =>
    x - w/2 < o.x + o.w + 4 && x + w/2 > o.x - 4 &&
    y - h/2 < o.y + o.h + 4 && y + h/2 > o.y - 4);

  for (const [dx, dy] of OFFSETS){
    if (!hits(cx + dx, cy + dy)) return { x: cx + dx, y: cy + dy };
  }
  return { x: cx, y: cy };
}

/* ================================================================
   RENDER: DIAGRAM
   ================================================================ */
function renderFlow(){
  const f = flow(), lay = layout();
  const { boxes, g, bodyH, bandY, totalH, hasBand } = buildLayout();

  const cols = f.phases.map((p, i) => `
    <div class="lane-col" style="left:${g.x(i)}px;top:${GEO.headH + 8}px;width:${g.laneW}px;height:${bodyH - GEO.headH - 16}px"></div>`).join('');

  const heads = f.phases.map((p, i) => `
    <div class="lane-head" style="left:${g.x(i)}px;top:8px;width:${g.laneW}px;height:${GEO.headH - 12}px">${esc(p)}</div>`).join('');

  const groups = (lay.groups || []).map(gr => {
    const bs = gr.nodes.map(n => boxes[n]).filter(Boolean);
    if (!bs.length) return '';
    const x0 = Math.min(...bs.map(b => b.x)) - 13, y0 = Math.min(...bs.map(b => b.y)) - 30;
    const x1 = Math.max(...bs.map(b => b.x + b.w)) + 13, y1 = Math.max(...bs.map(b => b.y + b.h)) + 13;
    return `<div class="vgroup" style="left:${x0}px;top:${y0}px;width:${x1-x0}px;height:${y1-y0}px"><span>${esc(gr.label)}</span></div>`;
  }).join('');

  const obstacles = Object.values(boxes);
  let paths = '', chips = '';
  lay.edges.forEach(([a, b, opt]) => {
    const A = boxes[a], B = boxes[b];
    if (!A || !B) return;
    const o = typeof opt === 'string' ? { dash: opt === 'dashed' } : (opt || {});
    const p = edgePath(A, B, o.route);
    paths += `<path d="${p.d}" class="edge${o.dash ? ' edge-dashed' : ''}" marker-end="url(#arw${o.dash ? 'd' : ''})"/>`;
    if (o.label){
      const asPill = o.dash && !o.chip;
      const lw = o.label.length * (asPill ? 6.6 : 6.2) + (asPill ? 26 : 14);
      const lh = asPill ? 24 : 20;
      const { x, y } = placeLabel(p.lx, p.ly, lw, lh, obstacles);
      chips += asPill
        ? `<div class="pill" style="left:${x}px;top:${y}px">${esc(o.label)}</div>`
        : `<div class="edge-chip${o.dash ? ' on-ai' : ''}" style="left:${x}px;top:${y}px">${esc(o.label)}</div>`;
    }
  });

  const nodes = f.nodes.filter(n => boxes[n.n]).map((n, i) => nodeHTML(n, boxes[n.n], i * 20)).join('');

  let band = '';
  if (hasBand){
    const label = (lay.band && lay.band.label) || 'Data Foundation';
    const note  = (lay.band && lay.band.nodes) ? '' : `
      <div class="band-note" style="left:60px;top:0;bottom:0">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
          <ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.66 3.6 3 8 3s8-1.34 8-3v-13"/>
          <path d="M4 12c0 1.66 3.6 3 8 3s8-1.34 8-3"/></svg>
        <span>${esc(f.foundation || '')}</span>
      </div>`;
    band = `<div class="band" style="left:${GEO.padX}px;top:${bandY}px;width:${GEO.canvasW - GEO.padX*2}px;height:${GEO.bandH}px">
      <div class="band-label"><span>${esc(label)}</span></div>${note}
    </div>`;
  }

  $('#canvas').innerHTML = `
    ${cols}${band}
    <svg class="edges" width="${GEO.canvasW}" height="${totalH}">
      <defs>
        <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,1 L9,5 L0,9 z" fill="var(--edge)"/></marker>
        <marker id="arwd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,1 L9,5 L0,9 z" fill="var(--purple-2)"/></marker>
      </defs>
      ${paths}
    </svg>
    ${groups}${heads}${nodes}${chips}`;

  const cv = $('#canvas');
  cv.style.width  = GEO.canvasW + 'px';
  cv.style.height = totalH + 'px';
  cv.dataset.h    = totalH;
  fitCanvas();
}

function nodeHTML(n, b, delay){
  const cls = 'k-' + n.k;
  const pos = `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;animation-delay:${delay}ms`;
  const act = state.node === n.n ? ' is-active' : '';

  if (n.k === 'decision'){
    return `<button class="vnode vdecision ${cls}${act}" data-node="${n.n}" style="${pos}">
      <svg class="vdia" viewBox="0 0 ${b.w} ${b.h}" preserveAspectRatio="none">
        <path d="M${b.w/2},2 L${b.w-2},${b.h/2} L${b.w/2},${b.h-2} L2,${b.h/2} Z"/>
      </svg>
      <span class="vdec-text">${esc(n.t)}</span>
    </button>`;
  }

  return `<button class="vnode ${cls}${act}" data-node="${n.n}" style="${pos}">
    <span class="vtop">
      <span class="vicon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconFor(n)}</svg></span>
      <span class="vbadge${n.isNew ? ' is-new' : ''}"><i></i>${esc(n.isNew ? 'New' : KIND_BADGE[n.k])}</span>
    </span>
    <span class="vtitle"><em>${n.n}</em>${esc(n.t)}</span>
    <span class="vsub">${esc(n.s)}</span>
  </button>`;
}

/* scale to fit, times the user zoom.
   The sizer carries the *scaled* dimensions so scrolling works — a CSS
   transform leaves the layout box at full size, which otherwise leaves a
   phantom scroll region below the diagram. */
function fitCanvas(){
  const wrap = $('#canvas-wrap'), sizer = $('#canvas-sizer'), cv = $('#canvas');
  if (!wrap || !sizer || !cv) return;

  const totalH = +cv.dataset.h || 0;
  const base   = Math.min(1, (wrap.clientWidth - 2) / GEO.canvasW);
  const s      = base * state.zoom;

  cv.style.transform  = `scale(${s})`;
  sizer.style.width   = Math.round(GEO.canvasW * s) + 'px';
  sizer.style.height  = Math.round(totalH * s) + 'px';

  const cap = Math.max(380, Math.round(window.innerHeight * 0.74));
  wrap.style.height = Math.min(Math.round(totalH * s) + 2, cap) + 'px';
}
window.addEventListener('resize', fitCanvas);

function setZoom(delta){
  state.zoom = Math.max(0.6, Math.min(2.2, +(state.zoom + delta).toFixed(2)));
  fitCanvas();
}

/* ================================================================
   HOVER PREVIEW
   ================================================================ */
let popTimer = null;

function showPop(num, el){
  const n = nodeBy(num);
  if (!n) return;
  const pop = $('#pop');
  const firstKey = Object.keys(n.d)[0];

  pop.innerHTML = `
    <div class="pop-top ${'k-' + n.k}">
      ${n.isNew ? `<span class="vbadge is-new"><i></i>New</span>` : ''}
      <span class="vbadge"><i></i>${esc(KIND_BADGE[n.k])}</span>
      ${n.badge ? `<span class="vbadge" style="color:var(--ink-4)">${esc(n.badge)}</span>` : ''}
    </div>
    <h4>${n.n}. ${esc(n.t)}</h4>
    <p class="pop-sum">${esc(n.s)}</p>
    <div class="pop-head">${esc(firstKey)}</div>
    <ul>${n.d[firstKey].slice(0, 3).map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    <div class="pop-cta">Click for the full deep dive &rarr;</div>`;

  pop.classList.add('open');

  const r = el.getBoundingClientRect();
  const pw = pop.offsetWidth, ph = pop.offsetHeight, gap = 12;
  let x = r.right + gap;
  if (x + pw > window.innerWidth - 12) x = r.left - pw - gap;
  if (x < 12) x = Math.max(12, (window.innerWidth - pw) / 2);
  let y = Math.max(12, Math.min(r.top + r.height / 2 - ph / 2, window.innerHeight - ph - 12));

  pop.style.left = x + 'px';
  pop.style.top  = y + 'px';
}

function hidePop(){
  clearTimeout(popTimer);
  $('#pop')?.classList.remove('open');
}

/* ================================================================
   RENDER: SIDE PANEL
   ================================================================ */
function renderSide(){
  const d = domain(), f = flow();

  if (state.node === null){
    const phases = f.phases.map((p, i) => {
      const count = f.nodes.filter(n => n.p === i).length;
      return `<li><span>${esc(p)}</span><b>${count}</b></li>`;
    }).join('');

    $('#side-eyebrow').textContent = f.label;
    $('#side-body').innerHTML = `
      <h2>${esc(d.name)}</h2>
      <p class="sd-sum">${esc(d.tagline)}</p>
      <div class="dd-section">
        <h4>${esc(f.label)} &mdash; ${f.nodes.length} steps</h4>
        <ul class="phase-list">${phases}</ul>
      </div>
      ${f.foundation ? `<div class="dd-section">
        <h4>Underpinned by</h4>
        <p class="sd-sum" style="margin:0">${esc(f.foundation)}</p>
      </div>` : ''}
      <div class="side-empty">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
          <circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></svg>
        <div>Select any step in the diagram for the full deep dive: what happens today, where AI fits,
        what has to be true first, and how to measure it.</div>
      </div>`;
    $('#side-foot').innerHTML = `
      <button class="btn btn-primary" id="dd-btn">Recommendations deep dive</button>
      <button class="btn" id="copy-domain">Copy area as markdown</button>`;
    $('#dd-btn').onclick     = openModal;
    $('#copy-domain').onclick = e => copy(domainMarkdown(d), e.target);
    return;
  }

  const n = nodeBy(state.node);
  if (!n){ state.node = null; return renderSide(); }

  const badges = [];
  if (n.isNew) badges.push(`<span class="vbadge is-new"><i></i>New</span>`);
  badges.push(`<span class="vbadge"><i></i>${esc(KIND_BADGE[n.k])}</span>`);
  if (n.badge) badges.push(`<span class="vbadge" style="color:var(--ink-4)">${esc(n.badge)}</span>`);

  $('#side-eyebrow').textContent = f.phases[n.p] || f.label;
  $('#side-body').innerHTML = `
    <div class="sd-crumb">${esc(d.short)} / ${esc(f.label)} / step ${n.n}</div>
    <h2>${esc(n.t)}</h2>
    <div class="sd-badges ${'k-' + n.k}">${badges.join('')}</div>
    <p class="sd-sum">${esc(n.s)}</p>
    ${Object.entries(n.d).map(([h, items]) => `
      <div class="dd-section">
        <h4>${esc(h)}</h4>
        <ul class="dd-list">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      </div>`).join('')}`;

  const ordered = [...f.nodes].sort((a, b) => a.n - b.n);
  const idx = ordered.findIndex(x => x.n === state.node);
  $('#side-foot').innerHTML = `
    <div class="side-nav">
      <button class="btn" id="prev-node" ${idx === 0 ? 'disabled style="opacity:.45"' : ''}>&larr; Prev</button>
      <button class="btn" id="next-node" ${idx === ordered.length - 1 ? 'disabled style="opacity:.45"' : ''}>Next &rarr;</button>
      <button class="btn" id="copy-node">Copy</button>
    </div>
    <button class="btn" id="clear-node">Back to overview</button>`;

  $('#prev-node').onclick  = () => { if (idx > 0) selectNode(ordered[idx-1].n); };
  $('#next-node').onclick  = () => { if (idx < ordered.length-1) selectNode(ordered[idx+1].n); };
  $('#copy-node').onclick  = e => copy(nodeMarkdown(n), e.target);
  $('#clear-node').onclick = () => selectNode(null);
  $('#side-body').scrollTop = 0;
}

function selectNode(num){
  hidePop();
  state.node = num;
  $$('.vnode').forEach(el => el.classList.toggle('is-active', +el.dataset.node === num));
  document.body.classList.remove('side-collapsed');
  if (window.innerWidth <= 1000 && num !== null) document.body.classList.add('side-open');
  renderSide();
  syncHash();
}

/* ================================================================
   MODAL
   ================================================================ */
function obsGrid(list, future){
  return `<div class="obs-grid">${list.map(o => `
    <div class="obs${future ? ' obs-future' : ''}">
      <div class="obs-top">
        <span class="obs-tag">${esc(o.tag)}</span>
        ${o.ref ? `<span class="obs-refs">${o.ref.split(' ').map(r => `<span class="obs-ref">${esc(r)}</span>`).join('')}</span>` : ''}
      </div>
      <h4>${esc(o.t)}</h4>
      <p>${esc(o.b)}</p>
    </div>`).join('')}</div>`;
}

/* The recommendations table from the deck: workstreams across the top,
   the same four questions asked of each one down the left. */
function recMatrix(recs){
  const rows = [
    { label:'The gap',       cell:r => `<p>${esc(r.gap)}</p>` },
    { label:'What to build', cell:r => `<ul>${r.build.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` },
    { label:'Tools',         cell:r => `<div class="rm-tools">${r.tools.map(t => `<span class="rm-tool">${esc(t)}</span>`).join('')}</div>` },
    { label:'Metrics',       cell:r => `<ul>${r.metrics.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` }
  ];

  return `<div class="rec-matrix">
    <div class="rm-corner"></div>
    ${recs.map(r => `<div class="rm-head c-${r.color}">
      <h3>${esc(r.t)}</h3><span class="own">${esc(r.owner)} owned</span>
    </div>`).join('')}
    ${rows.map(row => `
      <div class="rm-label">${esc(row.label)}</div>
      ${recs.map(r => `<div class="rm-cell">${row.cell(r)}</div>`).join('')}
    `).join('')}
  </div>`;
}

function openModal(){
  const d = domain();
  $('#modal-head').innerHTML = `
    <div>
      <h2>${esc(d.name)} &mdash; deep dive</h2>
      <p>Where the gaps are today, where the recommendations apply, and what to build.</p>
    </div>
    <div class="modal-actions">
      <button class="btn" id="copy-dd">Copy as markdown</button>
      <button class="btn" onclick="window.print()">Print</button>
      <button class="btn btn-primary" id="modal-close">Close</button>
    </div>`;

  $('#modal-body').innerHTML = `
    <div class="section-head"><h3>Current state observations</h3><span class="rule"></span></div>
    ${obsGrid(d.current.observations, false)}

    <div class="section-head" style="margin-top:26px"><h3>Recommendations: where they apply</h3><span class="rule"></span></div>
    ${obsGrid(d.future.observations, true)}

    <div class="section-head" style="margin-top:28px"><h3>Recommendations deep dive</h3><span class="rule"></span></div>
    ${recMatrix(d.recommendations)}`;
  $('#modal-close').onclick = closeModal;
  $('#copy-dd').onclick = e => copy(domainMarkdown(d), e.target);
  $('#modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  $('#modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ================================================================
   MARKDOWN
   ================================================================ */
function nodeMarkdown(n){
  const f = flow();
  let md = `## ${n.t}\n\n**${domain().name} — ${f.label} — ${f.phases[n.p]} — step ${n.n}**\n\n${n.s}\n\n`;
  for (const [h, items] of Object.entries(n.d)){
    md += `### ${h}\n`;
    items.forEach(i => { md += `- ${i}\n`; });
    md += `\n`;
  }
  return md;
}

function domainMarkdown(d){
  let md = `# ${d.name} — Frontier AI Readiness\n\n${d.tagline}\n\n`;
  ['current','future'].forEach(v => {
    const f = d[v];
    md += `## ${f.label}\n\n`;
    f.phases.forEach((p, pi) => {
      md += `### ${p}\n`;
      f.nodes.filter(n => n.p === pi).sort((a,b) => a.n - b.n)
        .forEach(n => { md += `${n.n}. **${n.t}**${n.isNew ? ' _(new)_' : ''} — ${n.s}\n`; });
      md += `\n`;
    });
    if (f.foundation) md += `> ${f.foundation}\n\n`;
    md += `**${v === 'current' ? 'Observations' : 'Where recommendations apply'}**\n\n`;
    f.observations.forEach(o => { md += `- _${o.tag}_ — **${o.t}**: ${o.b}\n`; });
    md += `\n`;
  });
  md += `## Recommendations deep dive\n\n`;
  d.recommendations.forEach((r, i) => {
    md += `### ${i+1}. ${r.t} (${r.owner})\n\n**The gap** — ${r.gap}\n\n**What to build**\n`;
    r.build.forEach(b => { md += `- ${b}\n`; });
    md += `\n**Tools** — ${r.tools.join(', ')}\n\n**Metrics**\n`;
    r.metrics.forEach(m => { md += `- ${m}\n`; });
    md += `\n`;
  });
  return md;
}

function copy(text, btn){
  const done = () => {
    const old = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = old; }, 1400);
  };
  if (navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(text).then(done).catch(() => fallback(text, done));
  } else fallback(text, done);
}
function fallback(text, done){
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch (e) {}
  document.body.removeChild(ta);
}

/* ================================================================
   ROUTING + RENDER
   ================================================================ */
function syncHash(){
  const h = `#/${state.domain}/${state.view}${state.node ? '/' + state.node : ''}`;
  if (location.hash !== h) history.replaceState(null, '', h);
}
function readHash(){
  const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (p[0] && DATA[p[0]]) state.domain = p[0];
  if (p[1] === 'current' || p[1] === 'future') state.view = p[1];
  if (p[2] && !isNaN(+p[2])) state.node = +p[2];
}

function render(){
  document.body.dataset.state = state.view;
  $('#switch').setAttribute('aria-checked', state.view === 'future');
  renderTabs();
  renderFlow();
  renderSide();
  syncHash();
}

function setDomain(k){
  if (k === state.domain) return;
  state.domain = k; state.node = null;
  render();
}
function setView(v){
  if (v === state.view) return;
  state.view = v; state.node = null;
  render();
}

/* ================================================================
   EVENTS
   ================================================================ */
document.addEventListener('click', e => {
  const tab = e.target.closest('[data-domain]');
  if (tab){ setDomain(tab.dataset.domain); return; }
  const node = e.target.closest('[data-node]');
  if (node){ selectNode(+node.dataset.node); return; }
  if (!e.target.closest('#legend-pop') && !e.target.closest('#legend-btn'))
    $('#legend-pop').classList.remove('open');
});

document.addEventListener('mouseover', e => {
  const el = e.target.closest('.vnode');
  if (!el) return;
  clearTimeout(popTimer);
  popTimer = setTimeout(() => showPop(+el.dataset.node, el), 180);
});

document.addEventListener('mouseout', e => {
  const el = e.target.closest('.vnode');
  if (!el) return;
  if (e.relatedTarget?.closest?.('.vnode') === el) return;
  hidePop();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){
    if ($('#modal').classList.contains('open')) return closeModal();
    hidePop();
    $('#legend-pop').classList.remove('open');
    if (state.node !== null) selectNode(null);
    return;
  }
  if (state.node === null || $('#modal').classList.contains('open')) return;
  if (e.key === 'ArrowRight') $('#next-node')?.click();
  if (e.key === 'ArrowLeft')  $('#prev-node')?.click();
});

window.addEventListener('DOMContentLoaded', () => {
  readHash();
  render();

  $('#switch').onclick = () => setView(state.view === 'current' ? 'future' : 'current');
  $('#zoom-in').onclick  = () => setZoom(+0.15);
  $('#zoom-out').onclick = () => setZoom(-0.15);
  $('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };

  $('#side-toggle').onclick = () => {
    document.body.classList.remove('side-open');
    document.body.classList.toggle('side-collapsed');
    setTimeout(fitCanvas, 300);
  };
  $('#menu-btn').onclick = () => {
    document.body.classList.toggle('side-open');
    document.body.classList.remove('side-collapsed');
  };

  $('#legend-btn').onclick = e => {
    const pop = $('#legend-pop'), btn = e.currentTarget;
    pop.classList.toggle('open');
    const r = btn.getBoundingClientRect();
    pop.style.top  = (r.bottom + 8) + 'px';
    pop.style.left = Math.max(12, Math.min(r.left, window.innerWidth - 302)) + 'px';
  };
});
