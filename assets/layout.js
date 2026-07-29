/* ------------------------------------------------------------------
   Diagram layout — Visio-style geometry.

   Content lives in data.js. This file only says WHERE things sit and
   WHAT connects to what, so the narrative and the drawing stay separable.

   rows  : node number -> row index within its swimlane (lane comes from node.p)
   edges : [from, to] or [from, to, 'dashed']
   groups: dashed containers drawn behind a set of nodes
   ------------------------------------------------------------------ */

const LAYOUT = {

  soc: {
    current: {
      rows:  { 1:0, 2:1, 3:0, 4:1, 5:2, 6:1, 7:2, 8:1, 9:2, 10:1, 11:2 },
      edges: [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]]
    },
    future: {
      rows:  { 1:1, 2:0, 3:1, 4:0, 5:1, 6:2, 7:3, 8:1, 9:2, 10:1, 11:2 },
      edges: [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]]
    }
  },

  vm: {
    current: {
      rows:  { 1:1, 2:0, 3:1, 4:2, 5:1, 6:0, 7:1, 8:2, 9:1 },
      edges: [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]]
    },
    future: {
      rows:  { 1:1, 2:0, 3:1, 4:0, 5:1, 6:0, 7:1, 8:2, 9:1 },
      edges: [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]]
    }
  },

  appsec: {
    current: {
      rows:  { 1:0, 2:0, 3:1, 4:2, 5:0, 6:1, 12:3, 7:0, 8:1, 9:0, 10:1, 11:2 },
      edges: [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],
              [6,12,'dashed']],
      groups: [{ label:'AI-assisted — parallel / experimental', nodes:[12] }]
    },
    future: {
      rows:  { 1:0, 2:1, 3:0, 4:1, 5:0, 6:1, 7:2, 8:3, 9:0, 10:1, 11:2, 12:3, 13:4 },
      edges: [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],
              [11,12],[12,13]],
      groups: [{ label:'Scanning telemetry', nodes:[5,6,7,8] }]
    }
  }
};

/* ---- geometry constants ---------------------------------------- */
const GEO = {
  canvasW:  1680,
  padX:     22,
  laneGap:  26,
  headY:    0,
  headH:    44,
  rowTop:   80,
  rowH:     156,
  nodeH:    114,
  diamondW: 236,
  diamondH: 144,
  padBottom:32,
  foundH:   66
};
