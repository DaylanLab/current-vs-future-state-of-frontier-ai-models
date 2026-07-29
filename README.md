# Current vs. Future State of Frontier AI Models

**Live:** https://daylanlab.github.io/current-vs-future-state-of-frontier-ai-models/

An interactive process-flow navigator covering three security capability areas:

- **Security Operations (SOC)**
- **Vulnerability Management**
- **Application Security (AppSec)**

Each area has a **current state** and a **future state** flow, showing what has to change for the
capability to be ready to use frontier AI models.

---

## Using it

| Action | What it does |
| --- | --- |
| Capability area tabs | Switch between SOC, Vulnerability Management and AppSec |
| Current vs. Future switch | Swap the flow for the selected area |
| Hover a step | Floating preview with the summary and the first few points |
| Click a step | Full deep dive in the right-hand panel |
| Click a swimlane header | Opens the first step in that lane |
| Click the data foundation band | Explains what sits underneath, and which steps depend on it |
| Arrow keys | Move between steps once one is selected |
| Deep dive (top bar) | Observations, where they apply, and the what-to-build matrix |
| Observation chips | Jump straight from an observation to the step it refers to |
| Legend | Node types and connector conventions |
| Zoom / Pan | Scale the canvas; it scrolls once larger than the viewport |
| Copy as markdown | Puts a single step, or a whole area, on the clipboard |

Deep links are supported: `#/appsec/future/7` opens AppSec future state with step 7's deep dive
already open, and `#/soc/future/foundation` opens the data foundation.

Steps carry an internal number (`n`) used for deep links and cross-references, but it is not shown
on the diagram. The same number means different things in the current and future flows, so putting
it on the cards made the two views look falsely comparable. Sequence is carried by the connectors.

## Diagram conventions

| | |
| --- | --- |
| White card | A step, badged `Manual`, `Tool-Driven`, `AI-Automated` or `System of Record` |
| Rose diamond | Decision or gate, with labelled branches |
| Solid arrow | Primary flow |
| Dashed purple arrow | AI / parallel flow |
| `NEW` ribbon | New or changed in the future state |
| Purple band | Parallel AI track, or the shared data foundation |

---

## Running it

No build step, no dependencies. Open `index.html` in a browser, or serve the folder:

```bash
npx http-server . -p 4321
```

### GitHub Pages

Settings → Pages → Deploy from branch → `main` / root.

---

## Editing the content

> **After changing any file in `assets/`, bump the `?v=` number on all four asset links in
> `index.html`.** GitHub Pages serves assets with a ten minute `max-age`, so without a new version
> string returning visitors keep the cached copy and will not see the change.

| File | Contains |
| --- | --- |
| `assets/data.js` | All narrative content — steps, deep dives, observations, recommendations |
| `assets/layout.js` | Diagram geometry — rows, connectors, bands, icons, badge wording |
| `assets/app.js` | Rendering and interaction |
| `assets/styles.css` | Theme |
| `index.html` | Page shell |

To reword a step or a deep dive, edit `assets/data.js` only. To move a box or re-route an arrow,
edit `assets/layout.js` only. The two are deliberately kept separate.

Each step in `data.js` looks like:

```js
{ n:7, p:2, k:'ai', isNew:true, t:'Title', badge:'optional chip',
  s:'One-line summary shown on the card.',
  d:{
    'Section heading': ['bullet', 'bullet'],
    'Another heading': ['bullet']
  }}
```

`n` = step number, `p` = swimlane index, `k` = `process` / `tool` / `ai` / `decision` / `sor`.

In `layout.js`, `rows` places each step vertically within its lane and `edges` connects them:

```js
edges: [[1,2], [4,5,{ label:'pass' }],
        [4,3,{ dash:true, label:'fail', route:'around', chip:true }]]
```

`route:'around'` sends a reject path out through the lane gutter, which keeps its label clear of
the cramped gap between rows. Connector labels are collision-checked against every node box at
render time and shifted to the first free offset, so small layout changes will not overlap text.

---

## A note on tooling names

The flows use generic, industry-standard tool categories (SIEM, EDR, SAST, SCA, DAST, CMDB,
detection-as-code, exposure analysis) rather than named products. Swap in the client's actual stack
before delivery — the placeholders are deliberate, not an oversight.

There is deliberately **no maturity score**. Scoring would imply an assessment that has not been
carried out.
