# Current vs. Future State of Frontier AI Models

An interactive process-flow diagram for **Cox Communications** covering three security capability areas:

- **Security Operations (SOC)**
- **Vulnerability Management**
- **Application Security (AppSec)**

Each area has a **current state** and a **future state** flow, showing what has to change for the
capability to be ready to use frontier AI models.

**Status: DRAFT — for discussion, not for external distribution.**

---

## Using it

| Action | What it does |
| --- | --- |
| Capability area tabs | Switch between SOC, Vulnerability Management and AppSec |
| Current / Future toggle | Swap the flow, the readiness meter and the observations |
| Hover a step | Floating preview with the summary and the first few points |
| Click a step | Full deep dive in the side panel |
| Arrow keys | Move between steps while the panel is open |
| Deep dive button | Five-workstream recommendations table for the current area |
| Copy as markdown | Puts the whole area (or a single step) on the clipboard |
| Print | Prints the recommendations table |

Deep links are supported: `#/appsec/future/7` opens AppSec future state, step 7.

## Diagram conventions

| | |
| --- | --- |
| Blue box | Process step |
| Green box | Tool-driven step |
| Purple box | AI or agentic step |
| Amber diamond | Decision or gate |
| Solid arrow | Primary flow |
| Dashed arrow | AI / parallel flow |
| `NEW` chip | New or changed in the future state |

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

| File | Contains |
| --- | --- |
| `assets/data.js` | All narrative content — steps, deep dives, observations, recommendations, readiness scores |
| `assets/layout.js` | Diagram geometry — which row each step sits in, connectors, dashed groups |
| `assets/app.js` | Rendering and interaction |
| `assets/styles.css` | Theme |
| `index.html` | Page shell |

To reword a step or a deep dive, edit `assets/data.js` only. To move a box or re-route an arrow,
edit `assets/layout.js` only. The two are deliberately kept separate.

Each step in `data.js` looks like:

```js
{ n:7, p:2, k:'ai', isNew:true, t:'Title', badge:'optional chip',
  s:'One-line summary shown on the box.',
  d:{
    'Section heading': ['bullet', 'bullet'],
    'Another heading': ['bullet']
  }}
```

`n` = step number, `p` = swimlane index, `k` = `process` / `tool` / `ai` / `decision` / `sor`.

---

## A note on tooling names

The flows use generic, industry-standard tool categories (SIEM, EDR, SAST, SCA, DAST, CMDB,
detection-as-code, exposure analysis) rather than named products. Swap in Cox's actual stack
before this goes in front of the client — the placeholders are deliberate, not an oversight.
