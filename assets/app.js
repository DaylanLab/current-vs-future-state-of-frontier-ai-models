/* ------------------------------------------------------------------
   Current vs. Future State — Frontier AI Readiness
   Vanilla JS. No build step, no dependencies.
   ------------------------------------------------------------------ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const state = {
  domain: 'soc',
  view:   'current',   // 'current' | 'future'
  node:   null         // node number, or null
};

/* ---------------------------------------------------------------- utils */
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
  $('#tabs').innerHTML = DOMAIN_ORDER.map(k => {
    const d = DATA[k];
    return `<button class="tab" role="tab" data-domain="${k}" aria-selected="${k === state.domain}">
      <span class="tab-dot"></span>${esc(d.name)}
    </button>`;
  }).join('');
}

/* ---------------------------------------------------------------- hero */
function renderHero(){
  const d = domain(), f = flow(), r = d.readiness;
  const vals   = state.view === 'current' ? r.current : r.future;
  const avg    = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  const curAvg = (r.current.reduce((a, b) => a + b, 0) / r.current.length).toFixed(1);
  const futAvg = (r.future.reduce((a, b) => a + b, 0) / r.future.length).toFixed(1);

  const newCount = f.nodes.filter(n => n.isNew).length;
  const aiCount  = f.nodes.filter(n => n.k === 'ai').length;

  $('#hero').innerHTML = `
    <div class="hero-card">
      <div class="hero-eyebrow">${esc(d.short)} &middot; ${esc(f.label)}</div>
      <h2>${esc(d.name)}</h2>
      <p>${esc(d.tagline)}</p>
      <div class="hero-meta">
        <div class="hero-stat"><div class="v">${f.nodes.length}</div><div class="l">Process steps</div></div>
        <div class="hero-stat"><div class="v" style="color:var(--k-ai)">${aiCount}</div><div class="l">AI-enabled steps</div></div>
        <div class="hero-stat"><div class="v" style="color:var(--cox-teal)">${state.view === 'future' ? newCount : '&mdash;'}</div><div class="l">New or changed</div></div>
        <div class="hero-stat"><div class="v">${curAvg} &rarr; <span style="color:var(--cox-teal)">${futAvg}</span></div><div class="l">AI readiness (of 5)</div></div>
      </div>
    </div>

    <div class="hero-card">
      <div class="meter-head">
        <h3>Frontier AI readiness</h3>
        <div class="meter-score">${esc(f.label)} &nbsp;<b>${avg}</b> <span style="color:var(--faint)">/ 5</span></div>
      </div>
      ${r.dims.map((dim, i) => `
        <div class="meter-row">
          <div class="lbl"><span>${esc(dim)}</span><span>${vals[i]} / 5</span></div>
          <div class="meter-track">
            <div class="meter-fill" style="width:${vals[i] / 5 * 100}%"></div>
            ${state.view === 'future' ? `<div class="meter-ghost" style="left:${r.current[i] / 5 * 100}%"></div>` : ''}
          </div>
        </div>`).join('')}
      ${state.view === 'future'
        ? `<div class="meter-foot"><i></i> Marker shows today&rsquo;s position on each dimension.</div>` : ''}
    </div>`;
}

/* ================================================================
   DIAGRAM
   ================================================================ */

function laneGeom(count){
  const inner = GEO.canvasW - GEO.padX * 2 - GEO.laneGap * (count - 1);
  const laneW = inner / count;
  return { laneW, x: i => GEO.padX + i * (laneW + GEO.laneGap) };
}

function buildBoxes(f, lay){
  const g = laneGeom(f.phases.length);
  const boxes = {};
  f.nodes.forEach(n => {
    const row  = lay.rows[n.n] ?? 0;
    const isD  = n.k === 'decision';
    const w    = isD ? Math.min(GEO.diamondW, g.laneW - 18) : g.laneW - 18;
    const h    = isD ? GEO.diamondH : GEO.nodeH;
    const x    = g.x(n.p) + (g.laneW - w) / 2;
    const y    = GEO.rowTop + row * GEO.rowH + (GEO.nodeH - h) / 2;
    boxes[n.n] = { x, y, w, h, row, node: n };
  });
  return { boxes, g };
}

/* orthogonal connector routing, Visio style */
function edgePath(A, B){
  const aCx = A.x + A.w / 2, aCy = A.y + A.h / 2;
  const bCx = B.x + B.w / 2, bCy = B.y + B.h / 2;

  if (B.x > A.x + A.w - 2){                       // to the right
    const sx = A.x + A.w, ex = B.x;
    if (Math.abs(aCy - bCy) < 3) return `M${sx},${aCy} L${ex},${bCy}`;
    const mx = sx + (ex - sx) / 2;
    return `M${sx},${aCy} L${mx},${aCy} L${mx},${bCy} L${ex},${bCy}`;
  }
  if (B.y > A.y + A.h - 2){                       // below
    const sy = A.y + A.h, ey = B.y;
    if (Math.abs(aCx - bCx) < 3) return `M${aCx},${sy} L${bCx},${ey}`;
    const my = sy + (ey - sy) / 2;
    return `M${aCx},${sy} L${aCx},${my} L${bCx},${my} L${bCx},${ey}`;
  }
  if (B.y + B.h < A.y + 2){                       // above
    const sy = A.y, ey = B.y + B.h;
    const my = sy + (ey - sy) / 2;
    return `M${aCx},${sy} L${aCx},${my} L${bCx},${my} L${bCx},${ey}`;
  }
  return `M${aCx},${aCy} L${bCx},${bCy}`;
}

function renderFlow(){
  const f   = flow();
  const lay = layout();
  const { boxes, g } = buildBoxes(f, lay);

  const maxRow  = Math.max(...Object.values(lay.rows));
  let bodyH     = GEO.rowTop + maxRow * GEO.rowH + GEO.nodeH + GEO.padBottom;
  const foundY  = bodyH;
  const totalH  = bodyH + (f.foundation ? GEO.foundH + 12 : 0);

  const heads = f.phases.map((p, i) => `
    <div class="lane-head" style="left:${g.x(i)}px;top:${GEO.headY}px;width:${g.laneW}px;height:${GEO.headH}px">
      ${esc(p)}
    </div>`).join('');

  const cols = f.phases.map((p, i) => `
    <div class="lane-col" style="left:${g.x(i)}px;top:${GEO.headH + 12}px;width:${g.laneW}px;height:${bodyH - GEO.headH - 20}px"></div>`).join('');

  const groups = (lay.groups || []).map(gr => {
    const bs = gr.nodes.map(n => boxes[n]).filter(Boolean);
    if (!bs.length) return '';
    const x0 = Math.min(...bs.map(b => b.x)) - 15;
    const y0 = Math.min(...bs.map(b => b.y)) - 32;
    const x1 = Math.max(...bs.map(b => b.x + b.w)) + 15;
    const y1 = Math.max(...bs.map(b => b.y + b.h)) + 15;
    return `<div class="vgroup" style="left:${x0}px;top:${y0}px;width:${x1 - x0}px;height:${y1 - y0}px">
      <span>${esc(gr.label)}</span></div>`;
  }).join('');

  const paths = lay.edges.map(([a, b, type]) => {
    const A = boxes[a], B = boxes[b];
    if (!A || !B) return '';
    const dash = type === 'dashed';
    return `<path d="${edgePath(A, B)}" class="edge${dash ? ' edge-dashed' : ''}"
              marker-end="url(#arw${dash ? 'd' : ''})"/>`;
  }).join('');

  const nodes = f.nodes.map((n, i) => nodeHTML(n, boxes[n.n], i * 22)).join('');

  $('#flow').innerHTML = `
    <div class="canvas-wrap" id="canvas-wrap">
      <div class="canvas" id="canvas" data-h="${totalH}"
           style="width:${GEO.canvasW}px;height:${totalH}px">
        ${cols}
        <svg class="edges" width="${GEO.canvasW}" height="${totalH}">
          <defs>
            <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9 z" fill="var(--edge)"/>
            </marker>
            <marker id="arwd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9 z" fill="var(--k-ai)"/>
            </marker>
          </defs>
          ${paths}
        </svg>
        ${groups}
        ${heads}
        ${nodes}
        ${f.foundation ? `
          <div class="foundation" style="left:${GEO.padX}px;top:${foundY}px;
               width:${GEO.canvasW - GEO.padX * 2}px;height:${GEO.foundH}px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <ellipse cx="12" cy="5.5" rx="8" ry="3"/>
              <path d="M4 5.5v13c0 1.66 3.58 3 8 3s8-1.34 8-3v-13"/>
              <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>
            </svg>
            <span>${esc(f.foundation)}</span>
          </div>` : ''}
      </div>
    </div>`;

  fitCanvas();
}

function nodeHTML(n, b, delay){
  const kind = KINDS[n.k] || KINDS.process;
  const isD  = n.k === 'decision';
  const pos  = `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;animation-delay:${delay}ms`;

  if (isD){
    return `<button class="vnode vdecision ${kind.cls} ${state.node === n.n ? 'is-active' : ''}"
        data-node="${n.n}" style="${pos}">
      <span class="vnum">${n.n}</span>
      <span class="vdec-text">${esc(n.t)}</span>
      ${n.isNew ? `<span class="vnew">NEW</span>` : ''}
    </button>`;
  }

  const tags = [];
  if (n.isNew)  tags.push(`<span class="tag tag-new">New</span>`);
  if (n.badge)  tags.push(`<span class="tag">${esc(n.badge)}</span>`);

  return `<button class="vnode ${kind.cls} ${state.node === n.n ? 'is-active' : ''}"
      data-node="${n.n}" style="${pos}">
    <span class="vnum">${n.n}</span>
    <span class="vtitle">${esc(n.t)}</span>
    <span class="vsub">${esc(n.s)}</span>
    ${tags.length ? `<span class="vtags">${tags.join('')}</span>` : ''}
  </button>`;
}

/* scale the fixed-width canvas to fit the viewport */
function fitCanvas(){
  const wrap = $('#canvas-wrap'), cv = $('#canvas');
  if (!wrap || !cv) return;
  const avail = wrap.clientWidth;
  const s = Math.max(0.5, Math.min(1, avail / GEO.canvasW));
  cv.style.transform = `scale(${s})`;
  wrap.style.height  = (+cv.dataset.h * s) + 'px';
  wrap.classList.toggle('overflowing', s <= 0.5 && avail < GEO.canvasW * 0.5);
}
window.addEventListener('resize', fitCanvas);

/* ---------------------------------------------------------------- hover popover */
let popTimer = null;

function showPop(num, el){
  const n = nodeBy(num);
  if (!n) return;
  const pop  = $('#pop');
  const kind = KINDS[n.k] || KINDS.process;
  const firstKey = Object.keys(n.d)[0];
  const bullets  = n.d[firstKey].slice(0, 3);

  pop.innerHTML = `
    <div class="pop-top">
      <span class="pop-kind ${kind.cls}">${esc(kind.label)}</span>
      ${n.isNew ? `<span class="tag tag-new">New</span>` : ''}
      ${n.badge ? `<span class="tag">${esc(n.badge)}</span>` : ''}
    </div>
    <h4>${n.n}. ${esc(n.t)}</h4>
    <p class="pop-sum">${esc(n.s)}</p>
    <div class="pop-head">${esc(firstKey)}</div>
    <ul>${bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    <div class="pop-cta">Click for the full deep dive &rarr;</div>`;

  pop.classList.add('open');

  // position: prefer right of the node, flip left near the edge
  const r  = el.getBoundingClientRect();
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  const gap = 12;
  let x = r.right + gap;
  if (x + pw > window.innerWidth - 12) x = r.left - pw - gap;
  if (x < 12) x = Math.max(12, (window.innerWidth - pw) / 2);
  let y = r.top + r.height / 2 - ph / 2;
  y = Math.max(12, Math.min(y, window.innerHeight - ph - 12));

  pop.style.left = x + 'px';
  pop.style.top  = y + 'px';
}

function hidePop(){
  clearTimeout(popTimer);
  $('#pop').classList.remove('open');
}

/* ---------------------------------------------------------------- observations */
function renderObs(){
  const f = flow();
  $('#obs-title').textContent = state.view === 'current'
    ? 'Current state observations'
    : 'Recommendations: where they apply';

  $('#obs').innerHTML = f.observations.map((o, i) => `
    <div class="obs" style="animation-delay:${i * 40}ms">
      <div class="obs-top">
        <span class="obs-tag">${esc(o.tag)}</span>
        ${o.ref ? `<span class="obs-refs">${o.ref.split(' ')
          .map(r => `<span class="obs-ref">${esc(r)}</span>`).join('')}</span>` : ''}
      </div>
      <h4>${esc(o.t)}</h4>
      <p>${esc(o.b)}</p>
    </div>`).join('');
}

/* ---------------------------------------------------------------- drawer */
function openNode(num){
  const f = flow(), n = nodeBy(num);
  if (!n) return;
  hidePop();

  state.node = num;
  $$('.vnode').forEach(el => el.classList.toggle('is-active', +el.dataset.node === num));

  const kind  = KINDS[n.k] || KINDS.process;
  const phase = f.phases[n.p];
  const tags  = [];
  if (n.isNew) tags.push(`<span class="tag tag-new">New or changed</span>`);
  if (n.badge) tags.push(`<span class="tag">${esc(n.badge)}</span>`);
  tags.push(`<span class="tag">${esc(kind.label)}</span>`);

  $('#drawer-head').innerHTML = `
    <button class="drawer-close" id="drawer-close" aria-label="Close">&times;</button>
    <div class="drawer-crumb">${esc(domain().short)} &nbsp;/&nbsp; <b>${esc(f.label)}</b> &nbsp;/&nbsp; ${esc(phase)}</div>
    <div class="drawer-title">
      <span class="vnum" style="position:static;width:26px;height:26px;font-size:12px;flex:none">${n.n}</span>
      <h2>${esc(n.t)}</h2>
    </div>
    <p class="drawer-summary">${esc(n.s)}</p>
    <div class="drawer-tags">${tags.join('')}</div>`;

  $('#drawer-body').innerHTML = Object.entries(n.d).map(([heading, items]) => `
    <div class="dd-section">
      <h4>${esc(heading)}</h4>
      <ul class="dd-list">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>`).join('');

  const ordered = [...f.nodes].sort((a, b) => a.n - b.n);
  const idx = ordered.findIndex(x => x.n === num);
  $('#drawer-nav').innerHTML = `
    <button class="btn" id="prev-node" ${idx === 0 ? 'disabled style="opacity:.4"' : ''}>&larr; Previous</button>
    <button class="btn" id="next-node" ${idx === ordered.length - 1 ? 'disabled style="opacity:.4"' : ''}>Next &rarr;</button>
    <button class="btn" id="copy-node">Copy</button>
    <span class="pos">Step ${idx + 1} of ${ordered.length}</span>`;

  $('#prev-node').onclick   = () => { if (idx > 0) openNode(ordered[idx - 1].n); };
  $('#next-node').onclick   = () => { if (idx < ordered.length - 1) openNode(ordered[idx + 1].n); };
  $('#copy-node').onclick   = e => copy(nodeMarkdown(n), e.target);
  $('#drawer-close').onclick = closeDrawer;

  $('#drawer').classList.add('open');
  $('#scrim').classList.add('open');
  $('#drawer-body').scrollTop = 0;
  syncHash();
}

function closeDrawer(){
  state.node = null;
  $('#drawer').classList.remove('open');
  $('#scrim').classList.remove('open');
  $$('.vnode').forEach(el => el.classList.remove('is-active'));
  syncHash();
}

/* ---------------------------------------------------------------- domain deep dive */
function openModal(){
  const d = domain();
  $('#modal-head').innerHTML = `
    <div>
      <h2>${esc(d.name)} &mdash; recommendations deep dive</h2>
      <p>The gap, what to build, the tooling and how to measure it. Five workstreams to move from current to future state.</p>
    </div>
    <div class="modal-actions">
      <button class="btn" id="copy-dd">Copy as markdown</button>
      <button class="btn" onclick="window.print()">Print</button>
      <button class="btn btn-primary" id="modal-close">Close</button>
    </div>`;

  $('#modal-body').innerHTML = `<div class="rec-grid">${d.recommendations.map(r => `
    <div class="rec c-${r.color}">
      <div class="rec-head"><span class="own">${esc(r.owner)}</span><h3>${esc(r.t)}</h3></div>
      <div class="rec-block"><div class="k">The gap</div><p>${esc(r.gap)}</p></div>
      <div class="rec-block grow"><div class="k">What to build</div>
        <ul>${r.build.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>
      <div class="rec-block"><div class="k">Tools</div>
        <div class="rec-tools">${r.tools.map(t => `<span class="rec-tool">${esc(t)}</span>`).join('')}</div></div>
      <div class="rec-block rec-metrics"><div class="k">Metrics</div>
        <ul>${r.metrics.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>
    </div>`).join('')}</div>`;

  $('#modal-close').onclick = closeModal;
  $('#copy-dd').onclick = e => copy(domainMarkdown(d), e.target);
  $('#modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(){
  $('#modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------------------------------------------------------------- markdown export */
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
  ['current', 'future'].forEach(v => {
    const f = d[v];
    md += `## ${f.label}\n\n`;
    f.phases.forEach((p, pi) => {
      md += `### ${p}\n`;
      f.nodes.filter(n => n.p === pi).sort((a, b) => a.n - b.n)
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
    md += `### ${i + 1}. ${r.t} (${r.owner})\n\n**The gap** — ${r.gap}\n\n**What to build**\n`;
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
  } else {
    fallback(text, done);
  }
}

function fallback(text, done){
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { /* no-op */ }
  document.body.removeChild(ta);
}

/* ---------------------------------------------------------------- routing */
function syncHash(){
  const h = `#/${state.domain}/${state.view}${state.node ? '/' + state.node : ''}`;
  if (location.hash !== h) history.replaceState(null, '', h);
}

function readHash(){
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] && DATA[parts[0]]) state.domain = parts[0];
  if (parts[1] === 'current' || parts[1] === 'future') state.view = parts[1];
  if (parts[2] && !isNaN(+parts[2])) state.node = +parts[2];
}

/* ---------------------------------------------------------------- render */
function render(){
  document.body.dataset.state = state.view;
  $('#toggle').dataset.state = state.view;
  $('#btn-current').setAttribute('aria-pressed', state.view === 'current');
  $('#btn-future').setAttribute('aria-pressed', state.view === 'future');
  $('#dd-btn').lastChild.textContent = ' ' + domain().short + ' deep dive';

  renderTabs();
  renderHero();
  renderFlow();
  renderObs();
  syncHash();
}

function setDomain(k){
  if (k === state.domain) return;
  state.domain = k;
  closeDrawer();
  render();
}

function setView(v){
  if (v === state.view) return;
  state.view = v;
  closeDrawer();
  render();
}

/* ---------------------------------------------------------------- events */
document.addEventListener('click', e => {
  const tab = e.target.closest('[data-domain]');
  if (tab){ setDomain(tab.dataset.domain); return; }
  const node = e.target.closest('[data-node]');
  if (node){ openNode(+node.dataset.node); return; }
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
  if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.vnode') === el) return;
  hidePop();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){
    if ($('#modal').classList.contains('open')) closeModal();
    else { hidePop(); closeDrawer(); }
  }
  if (!$('#drawer').classList.contains('open')) return;
  if (e.key === 'ArrowRight') $('#next-node')?.click();
  if (e.key === 'ArrowLeft')  $('#prev-node')?.click();
});

window.addEventListener('DOMContentLoaded', () => {
  readHash();
  render();

  $('#btn-current').onclick = () => setView('current');
  $('#btn-future').onclick  = () => setView('future');
  $('#scrim').onclick       = closeDrawer;
  $('#dd-btn').onclick      = openModal;
  $('#modal').onclick       = e => { if (e.target.id === 'modal') closeModal(); };

  if (state.node) openNode(state.node);
});
