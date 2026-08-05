/* ------------------------------------------------------------------
   Diagram layout — geometry, connectors and bands.

   Content lives in data.js. This file only says WHERE things sit and
   WHAT connects to what, so the narrative and the drawing stay separable.

   rows  : node number -> row index within its swimlane (lane comes from node.p)
   edges : [from, to] | [from, to, 'dashed'] | [from, to, { dash, label }]
   band  : bottom track — { label, nodes:[...] } or auto from flow.foundation
   groups: dashed containers drawn behind a set of nodes
   ------------------------------------------------------------------ */

const LAYOUT = {

  soc: {
    current: {
      rows:  { 1:0, 2:1, 3:0, 4:1, 5:2, 6:1, 7:2, 8:1, 9:2, 10:1, 11:2 },
      edges: [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],
              [8,9],[9,10,{ label:'approved' }],[10,11]]
    },
    future: {
      rows:  { 1:1, 2:0, 3:1, 4:0, 5:1, 6:2, 7:3, 8:1, 9:2, 10:1, 11:2 },
      edges: [[1,2],[2,3],[3,4],[4,5],[5,6,{ label:'escalate' }],[6,7],
              [7,8],[8,9,{ label:'approved' }],[9,10],[10,11]]
    }
  },

  vm: {
    current: {
      rows:  { 1:1, 2:0, 3:1, 4:2, 5:1, 6:0, 7:1, 8:2, 9:1 },
      edges: [[1,2],[2,3],[3,4],[4,5],[5,6,{ label:'ranked' }],[6,7],[7,8],[8,9]]
    },
    future: {
      rows:  { 1:1, 2:0, 3:1, 4:0, 5:1, 6:0, 7:1, 8:2, 9:1 },
      edges: [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],
              [7,8,{ label:'approved' }],[8,9]]
    }
  },

  appsec: {
    current: {
      rows:  { 1:0, 2:0, 3:1, 4:2, 5:0, 6:1, 7:0, 8:1, 9:0, 10:1, 11:2 },
      edges: [[1,2],[2,3],[3,4],[4,5,{ label:'Yes' }],
              [4,2,{ dash:true, label:'No', route:'around', chip:true }],
              [5,6],[6,7],[7,8],[8,9],[9,10],[10,11],
              [6,12,{ dash:true, label:'AI-assisted review' }]],
      band:  { label:'AI / Parallel Track', nodes:[12] }
    },
    future: {
      rows:  { 1:0, 2:1, 3:0, 4:1, 5:0, 6:1, 7:2, 8:3, 9:0, 10:1, 11:2, 12:3, 13:4 },
      edges: [[1,2],[2,3],[3,4],[4,5,{ label:'pass' }],
              [4,3,{ dash:true, label:'fail', route:'around', chip:true }],
              [5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13]],
      groups: [{ label:'Scanning telemetry', nodes:[5,6,7,8] }]
    }
  }
};

/* ---- geometry constants ---------------------------------------- */
const GEO = {
  canvasW:  1720,
  padX:     24,
  laneGap:  46,
  headH:    54,
  rowTop:   96,
  rowH:     172,
  nodeH:    132,
  diamondW: 224,
  diamondH: 158,
  padBottom:28,
  bandH:    118,
  bandGap:  18
};

/* Swimlane header ramps. The traditional flow renders in graphite and the
   frontier flow in the PwC spectrum, so switching between them is legible
   from across a room, before anyone reads a word. */
const LANE_RAMP = {
  current: ['#3A3A3E', '#45454A', '#505057', '#5B5B63', '#66666F'],
  future:  ['#A32020', '#C13A0F', '#D04A02', '#E07600', '#EB8C00']
};

function laneColor(i, total, view){
  const ramp = LANE_RAMP[view] || LANE_RAMP.current;
  if (total < 2) return ramp[0];
  return ramp[Math.round(i / (total - 1) * (ramp.length - 1))];
}

/* ---- badge wording per node kind -------------------------------- */
const KIND_BADGE = {
  process:  'Manual',
  tool:     'Tool-driven',
  ai:       'AI-automated',
  decision: 'Gate',
  sor:      'System of record'
};

/* ---- icons: keyword match on the title, falling back to kind ----- */
const ICON_RULES = [
  [/inventory|cmdb|asset|discovery|graph of|application is created|app is created/i, 'box'],
  [/telemetry|data layer|data foundation|ingest|normaliz/i,                          'database'],
  [/detection|correlation|rule/i,                                                    'radar'],
  [/queue|alert/i,                                                                   'bell'],
  [/triage|enrich/i,                                                                 'filter'],
  [/escalat|owner|stakeholder|notification|champion|team needs/i,                    'users'],
  [/hunt|quer|copilot|investigat|analys|exposure analysis/i,                         'search'],
  [/runbook|playbook|containment|remediat|patch/i,                                   'wrench'],
  [/approval|gate|validation|change control|auto-close/i,                            'shield-check'],
  [/report|dashboard|metric|performance|record|compliance/i,                         'chart'],
  [/scan|sast|sca|dast|dynamic|static|dependency/i,                                  'scan'],
  [/red team|penetration|pen test|adversar/i,                                        'target'],
  [/architecture|design|review/i,                                                    'blueprint'],
  [/pipeline|build|repositor|code|development|pathway/i,                             'git'],
  [/exception|risk|severity|prioriti/i,                                              'alert'],
  [/agent|frontier|model|ai /i,                                                      'sparkle']
];

const KIND_ICON = {
  process:  'box',
  tool:     'wrench',
  ai:       'sparkle',
  decision: 'alert',
  sor:      'database'
};

const ICONS = {
  box:        '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M3.5 9h17"/>',
  database:   '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.66 3.6 3 8 3s8-1.34 8-3v-13"/><path d="M4 12c0 1.66 3.6 3 8 3s8-1.34 8-3"/>',
  radar:      '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><path d="M12 12l6-4"/>',
  bell:       '<path d="M18 9a6 6 0 10-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9z"/><path d="M10.5 20a2 2 0 003 0"/>',
  filter:     '<path d="M3.5 4.5h17l-6.6 8v6l-3.8 2v-8z"/>',
  users:      '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 5.2a3.4 3.4 0 010 5.6"/><path d="M17.6 14.4A6.5 6.5 0 0121.5 20"/>',
  search:     '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L21 21"/>',
  wrench:     '<path d="M15.5 3.5a5.5 5.5 0 00-6.8 7.1L3 16.3 6.7 20l5.7-5.7a5.5 5.5 0 007.1-6.8l-3.2 3.2-3-3z"/>',
  'shield-check':'<path d="M12 2.7l7.5 3v6c0 4.6-3.1 8.4-7.5 9.6-4.4-1.2-7.5-5-7.5-9.6v-6z"/><path d="M9 11.8l2.2 2.2 4-4.2"/>',
  chart:      '<path d="M3.5 20.5h17"/><rect x="5" y="11" width="3.4" height="7" rx="1"/><rect x="10.3" y="6.5" width="3.4" height="11.5" rx="1"/><rect x="15.6" y="9" width="3.4" height="9" rx="1"/>',
  scan:       '<path d="M3.5 8V5.5a2 2 0 012-2H8"/><path d="M16 3.5h2.5a2 2 0 012 2V8"/><path d="M20.5 16v2.5a2 2 0 01-2 2H16"/><path d="M8 20.5H5.5a2 2 0 01-2-2V16"/><path d="M3.5 12h17"/>',
  target:     '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2"/>',
  blueprint:  '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M3.5 9.5h17M9.5 9.5v11"/>',
  git:        '<circle cx="6.5" cy="6" r="2.6"/><circle cx="6.5" cy="18" r="2.6"/><circle cx="17.5" cy="12" r="2.6"/><path d="M6.5 8.6v6.8"/><path d="M9.1 6.6c4 .6 5.8 2.4 6.1 5"/>',
  alert:      '<path d="M12 3.6l9 15.9H3z"/><path d="M12 9.5v4.2M12 16.6v.1"/>',
  sparkle:    '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>'
};

function iconFor(node){
  for (const [re, name] of ICON_RULES){
    if (re.test(node.t)) return ICONS[name] || ICONS.box;
  }
  return ICONS[KIND_ICON[node.k]] || ICONS.box;
}
