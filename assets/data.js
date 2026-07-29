/* ------------------------------------------------------------------
   Current vs. Future State — Frontier AI Readiness
   Cox Communications  |  DRAFT

   All narrative content lives here so the diagram stays generic.
   Edit this file to retarget the deck; index.html needs no changes.
   ------------------------------------------------------------------ */

const DATA = {

/* ==================================================================
   SECURITY OPERATIONS CENTER
   ================================================================== */
soc: {
  key: 'soc',
  name: 'Security Operations',
  short: 'SOC',
  tagline: 'Detection, triage and response across the enterprise estate.',

  current: {
    label: 'Current State',
    phases: ['Detection', 'Triage', 'Investigation', 'Response', 'Reporting'],
    nodes: [
      { n:1, p:0, k:'process', t:'Telemetry lands in the SIEM',
        badge:'continuous',
        s:'Endpoint, network, cloud, identity and application logs forward into the SIEM plus a set of point tools.',
        d:{
          'What happens today':[
            'Log sources are onboarded one at a time, each with its own parser and its own field names.',
            'Some high-value sources sit outside the SIEM entirely because of licence cost or volume, and are queried directly in the vendor console when needed.',
            'Schema differences mean the same concept — a user, a host, a process — is named differently depending on which source it came from.'
          ],
          'Why it matters for AI':[
            'A frontier model reasoning over an incident is only as good as the context it can retrieve. Inconsistent schemas force every AI use case to rebuild its own translation layer.',
            'Sources that live outside the central store are invisible to any agent, which quietly caps how much of an investigation can be automated.'
          ],
          'Signals of maturity':[
            'A published source inventory with owner, retention and schema mapping.',
            'Coverage measured against a control framework rather than against licence spend.'
          ]
        }},

      { n:2, p:0, k:'tool', t:'Static correlation rules fire',
        badge:'rule-based',
        s:'Detections are hand-authored correlation rules, tuned reactively after false positives pile up.',
        d:{
          'What happens today':[
            'Rules are written by a small number of senior engineers and edited in the SIEM console rather than in version control.',
            'Tuning is reactive: a rule gets noisy, an analyst complains, a threshold is raised.',
            'Coverage against adversary technique frameworks is understood informally rather than tracked.'
          ],
          'Why it matters for AI':[
            'Detection logic that lives only in a vendor console cannot be tested, diffed, reviewed or generated. It is the single biggest blocker to AI-authored detection content.',
            'Without technique-level mapping there is no way to ask a model where the gaps are.'
          ],
          'Signals of maturity':[
            'Detections in source control with peer review and automated tests.',
            'Coverage tracked per technique, with owners for the gaps.'
          ]
        }},

      { n:3, p:1, k:'process', t:'Alert queue builds',
        s:'Every rule hit becomes a queue item, regardless of confidence or business impact.',
        d:{
          'What happens today':[
            'Alerts are worked broadly in arrival order, with severity as the only real sort.',
            'Duplicate alerts describing one underlying event are worked as separate items.',
            'Queue depth is a function of rule noise, not of threat volume.'
          ],
          'Why it matters for AI':[
            'Deduplication and clustering are exactly the kind of high-volume, low-judgement work frontier models handle well — and they are the fastest source of measurable analyst time back.',
            'A queue with no confidence score gives an agent nothing to threshold against.'
          ],
          'Signals of maturity':[
            'Alerts grouped into cases before a human sees them.',
            'Queue measured by unique incidents, not raw alert count.'
          ]
        }},

      { n:4, p:1, k:'process', t:'Tier 1 manual triage',
        s:'An analyst opens each alert, reads the raw event, and decides escalate or close.',
        d:{
          'What happens today':[
            'The analyst reconstructs context by hand: who is this user, is this host critical, has this fired before.',
            'Close decisions and their reasoning are captured inconsistently, often as a one-word disposition.',
            'Quality varies by shift, by tenure and by queue pressure.'
          ],
          'Why it matters for AI':[
            'Thin disposition notes are the reason most SOCs cannot train or evaluate a triage model — there is no labelled history of why things were closed.',
            'Structured dispositions captured now are the evaluation set later. This is worth fixing even before any AI is deployed.'
          ],
          'Signals of maturity':[
            'Mandatory structured disposition with reason codes.',
            'Sampled quality review of closures, not just of escalations.'
          ]
        }},

      { n:5, p:1, k:'process', t:'Manual enrichment across consoles',
        badge:'high friction',
        s:'Analysts pivot between EDR, identity, threat intel, cloud and ticketing to assemble context.',
        d:{
          'What happens today':[
            'A single triage decision commonly touches five or more separate consoles.',
            'Copy and paste between tools is the integration layer.',
            'Time spent gathering context substantially exceeds time spent making the judgement.'
          ],
          'Why it matters for AI':[
            'Enrichment is deterministic retrieval, not judgement. It is the highest-confidence automation target in the entire SOC and needs no model autonomy to deliver value.',
            'Every console without an API is a hard ceiling on how much an agent can assemble.'
          ],
          'Signals of maturity':[
            'Enrichment resolved automatically and attached before the analyst opens the case.',
            'API coverage tracked as a procurement requirement for new tooling.'
          ]
        }},

      { n:6, p:2, k:'process', t:'Escalate to Tier 2 and IR',
        s:'Anything not confidently closed moves to a smaller, more experienced team.',
        d:{
          'What happens today':[
            'Escalation is a handoff, so context is re-derived by the receiving analyst.',
            'The escalation threshold drifts with queue pressure and staffing.',
            'Senior capacity is the binding constraint on the whole pipeline.'
          ],
          'Why it matters for AI':[
            'If AI only speeds up Tier 1, the work simply arrives at the Tier 2 bottleneck faster. Value depends on lifting investigation capacity too.',
            'Handoff loss is a documentation problem, and documentation is a strong model capability.'
          ],
          'Signals of maturity':[
            'Escalation carries a complete, machine-generated case file.',
            'Escalation rate tracked as a tuning signal rather than a workload statistic.'
          ]
        }},

      { n:7, p:2, k:'tool', t:'Hand-written hunting and queries',
        badge:'ad hoc',
        s:'Investigation depth depends on how well the individual analyst knows the query language.',
        d:{
          'What happens today':[
            'Query skill is concentrated in a handful of people.',
            'Useful queries live in personal notes, chat history and saved searches rather than a shared library.',
            'Hunts are episodic and rarely converted into standing detections.'
          ],
          'Why it matters for AI':[
            'Natural-language-to-query is one of the most reliable and lowest-risk frontier model capabilities available today, and it directly widens the pool of people who can investigate.',
            'A shared, curated query library is both a productivity asset and grounding context for a copilot.'
          ],
          'Signals of maturity':[
            'A reviewed, versioned query library.',
            'Hunt findings routinely promoted into permanent detection content.'
          ]
        }},

      { n:8, p:3, k:'process', t:'Runbook-driven containment',
        s:'Response follows written runbooks, executed largely by hand.',
        d:{
          'What happens today':[
            'Runbooks exist for common scenarios but drift out of date as the estate changes.',
            'Execution is manual, so response time depends on who is on shift.',
            'Novel scenarios fall back to improvisation and tribal knowledge.'
          ],
          'Why it matters for AI':[
            'Stale runbooks are a serious hazard when automation is layered on top — automating an out-of-date procedure just makes the wrong action faster.',
            'Runbook currency should be verified before, not after, response automation is introduced.'
          ],
          'Signals of maturity':[
            'Runbooks version-controlled with review dates and named owners.',
            'Coverage of runbooks measured against actual incident categories seen.'
          ]
        }},

      { n:9, p:3, k:'decision', t:'Approval and change control',
        s:'Impactful actions require human approval, routed through existing change process.',
        d:{
          'What happens today':[
            'The approval path is often informal — a message to a manager or a service owner.',
            'Approvals are inconsistently recorded, so the audit trail is partial.',
            'Out-of-hours approval is a common source of delay.'
          ],
          'Why it matters for AI':[
            'This gate is the right control and should be kept. The problem is not that approval exists, it is that it is undocumented and slow.',
            'A well-defined approval gate is the precondition for letting agents act at all.'
          ],
          'Signals of maturity':[
            'Documented action classes with pre-agreed approvers and time bounds.',
            'Every approval and denial recorded against the case.'
          ]
        }},

      { n:10, p:4, k:'sor', t:'Case closed in the system of record',
        s:'The incident record is the durable artefact, but its quality varies widely.',
        d:{
          'What happens today':[
            'Closure notes range from a full narrative to a single line.',
            'Fields that drive reporting are frequently left at default values.',
            'The record is written for compliance rather than for reuse.'
          ],
          'Why it matters for AI':[
            'The case history is the corpus. Poor records today directly limit what can be retrieved, evaluated or learned from tomorrow.',
            'Narrative writing is a strong model capability, and it removes the main reason analysts write thin notes: it is tedious.'
          ],
          'Signals of maturity':[
            'A consistent case schema with required fields enforced at closure.',
            'Records that a new analyst could read and understand without asking anyone.'
          ]
        }},

      { n:11, p:4, k:'process', t:'Periodic metrics reporting',
        badge:'monthly',
        s:'Volume and mean-time metrics are assembled manually for leadership.',
        d:{
          'What happens today':[
            'Reporting is largely activity-based: alerts handled, tickets closed, mean time to respond.',
            'Assembly is manual, so the report is a lagging snapshot rather than a live view.',
            'There is no measurement of automation quality because there is little automation to measure.'
          ],
          'Why it matters for AI':[
            'Once AI is in the loop, activity metrics become actively misleading — fewer analyst touches can mean either efficiency or missed detections.',
            'The measurement model has to change before, not after, autonomy is granted.'
          ],
          'Signals of maturity':[
            'Live dashboards rather than assembled decks.',
            'Outcome and quality metrics alongside volume metrics.'
          ]
        }}
    ],

    observations: [
      { tag:'Organizational', ref:'', t:'No single connected view',
        b:'Telemetry, case data and asset context live in separate systems with different schemas, so no tool or person sees the whole picture at once.' },
      { tag:'Detection', ref:'2', t:'Detection content is hand-built',
        b:'Rules are authored and tuned manually inside the SIEM console, with coverage against adversary techniques understood informally rather than tracked.' },
      { tag:'Triage', ref:'4 5', t:'Analyst time goes to retrieval, not judgement',
        b:'Most of a triage decision is spent assembling context across consoles. The judgement itself is a small fraction of the elapsed time.' },
      { tag:'Response', ref:'8 9', t:'Response speed is a staffing function',
        b:'Containment quality and speed depend on who is on shift and whether the relevant runbook is current, rather than on the risk of the incident.' },
      { tag:'Organizational', ref:'11', t:'No measurement model for AI',
        b:'Reporting counts activity. There is no baseline for precision, false-positive rate or human override, so AI performance could not be proven today even if AI were deployed.' }
    ]
  },

  future: {
    label: 'Future State',
    phases: ['Unified Data', 'AI Detection', 'Agentic Triage', 'Governed Response', 'Assurance'],
    foundation: 'Centralized, normalized security data foundation — telemetry, asset and identity context, case history, control library',
    nodes: [
      { n:1, p:0, k:'ai', isNew:true, t:'Normalized security data layer',
        s:'One schema across telemetry, assets, identity and case history, built on an open event model.',
        d:{
          'What changes':[
            'Sources are normalized once into a shared schema instead of each consumer building its own translation.',
            'Asset, identity and business context are joined to events at ingest rather than looked up later.',
            'Case history becomes queryable data rather than free text in a ticketing tool.'
          ],
          'Where AI fits':[
            'This is the prerequisite, not the AI. Every downstream agent retrieves from here, and retrieval quality sets the ceiling on every other capability.',
            'Models can assist the migration itself — mapping legacy fields to the target schema is well-suited to model-assisted work with human review.'
          ],
          'Prerequisites':[
            'An agreed target schema and a source-by-source migration plan with owners.',
            'Retention and access decisions made deliberately rather than inherited from licence limits.'
          ],
          'How to measure it':[
            'Percentage of priority sources normalized.',
            'Retrieval latency and completeness for a standard context query.'
          ]
        }},

      { n:2, p:1, k:'ai', isNew:true, t:'Detection-as-code library',
        s:'Detections move into version control with peer review, automated tests and technique mapping.',
        d:{
          'What changes':[
            'Detection logic is a reviewed artefact with history, tests and a named owner.',
            'Every detection is mapped to an adversary technique so coverage is measurable.',
            'Changes ship through a pipeline rather than being edited live in a console.'
          ],
          'Where AI fits':[
            'Once detections are code, a model can draft new ones, propose tuning against historical data, and flag redundant or dead rules.',
            'Coverage gaps become a question you can ask in natural language and get a grounded answer to.'
          ],
          'Prerequisites':[
            'A repository, a test harness and a deployment pipeline for detection content.',
            'Agreement that console-side edits are no longer permitted.'
          ],
          'How to measure it':[
            'Technique coverage percentage and rate of change.',
            'Share of detections with passing automated tests.'
          ]
        }},

      { n:3, p:1, k:'ai', isNew:true, t:'AI-assisted detection authoring and tuning',
        badge:'human approved',
        s:'Models draft and tune detection content; engineers review and approve before it ships.',
        d:{
          'What changes':[
            'New detection content starts from a model-generated draft grounded in the data layer and the existing library.',
            'Tuning proposals are backed by replay against historical telemetry rather than intuition.',
            'Redundant and low-yield rules are surfaced for retirement.'
          ],
          'Where AI fits':[
            'Drafting and back-testing, with a human engineer as the approver. Autonomy is deliberately not granted here — bad detection content is expensive in both directions.',
            'The value is throughput of reviewed content, not removal of the reviewer.'
          ],
          'Prerequisites':[
            'Detection-as-code in place, with a replay corpus of historical telemetry.'
          ],
          'How to measure it':[
            'Detections shipped per engineer per month.',
            'Precision of new content in its first 30 days.'
          ]
        }},

      { n:4, p:2, k:'ai', isNew:true, t:'AI triage agent: enrich, dedupe, score',
        badge:'per alert',
        s:'Every alert is automatically enriched, clustered into a case and given a confidence and impact score.',
        d:{
          'What changes':[
            'Context assembly happens before a human is involved, not during the human step.',
            'Related alerts are clustered into one case with a single narrative.',
            'Each case carries an explicit confidence score and the evidence behind it.'
          ],
          'Where AI fits':[
            'This is the highest-value, lowest-risk deployment in the SOC. Enrichment is retrieval; clustering and scoring are pattern work. Neither takes an action.',
            'Start here. It produces measurable time savings without granting the model any authority.'
          ],
          'Prerequisites':[
            'Normalized data layer and API access to enrichment sources.',
            'A defined case schema for the agent to populate.'
          ],
          'How to measure it':[
            'Analyst minutes per case before and after.',
            'Clustering accuracy and enrichment completeness.'
          ]
        }},

      { n:5, p:2, k:'decision', isNew:true, t:'Confidence-thresholded auto-close',
        badge:'sampled',
        s:'Cases below an agreed confidence and impact threshold close automatically, with a sampled human audit.',
        d:{
          'What changes':[
            'Benign high-volume categories stop consuming analyst attention.',
            'The threshold is an explicit, governed number that starts conservative and moves on evidence.',
            'A fixed percentage of auto-closed cases is re-opened and reviewed by a human every cycle.'
          ],
          'Where AI fits':[
            'This is the first point where the model is trusted to conclude rather than to assist. It should be introduced one alert category at a time.',
            'Run it in shadow mode first: let the agent recommend closure while humans still decide, and compare.'
          ],
          'Prerequisites':[
            'A shadow-mode period with measured agreement rate.',
            'A named owner for the threshold and a documented change process.'
          ],
          'How to measure it':[
            'Auto-close rate and the false-negative rate found by sampling.',
            'Agreement rate between agent and human in shadow mode.'
          ]
        }},

      { n:6, p:2, k:'ai', isNew:true, t:'Analyst copilot in the console',
        s:'Natural language investigation over the data layer, with generated queries the analyst can inspect.',
        d:{
          'What changes':[
            'Analysts ask questions in plain language and get grounded answers with the underlying query shown.',
            'Query language expertise stops being the limit on who can investigate.',
            'The curated query library becomes the copilot grounding context.'
          ],
          'Where AI fits':[
            'Assistive, never autonomous. The generated query is always visible so the analyst can verify the logic rather than trust the answer.',
            'This is the capability that most visibly lifts junior analyst effectiveness.'
          ],
          'Prerequisites':[
            'Normalized data layer and a reviewed query library.'
          ],
          'How to measure it':[
            'Time to first meaningful finding during an investigation.',
            'Adoption and repeat use by tenure band.'
          ]
        }},

      { n:7, p:2, k:'ai', isNew:true, t:'Agentic investigation with evidence chain',
        badge:'read only',
        s:'For escalated cases, an agent runs a multi-step investigation and produces a reviewable evidence chain.',
        d:{
          'What changes':[
            'The agent pursues hypotheses across sources, gathering supporting and contradicting evidence.',
            'Output is a structured chain — each conclusion linked to the data that supports it — not a summary paragraph.',
            'The analyst reviews and directs rather than starting from a blank page.'
          ],
          'Where AI fits':[
            'This is genuine frontier model territory: multi-step reasoning, tool use and synthesis. It is also where hallucination risk is highest, which is why the evidence chain matters more than the conclusion.',
            'Keep the agent strictly read-only. Investigation and action stay separate.'
          ],
          'Prerequisites':[
            'Reliable tool APIs and the triage agent already operating well.',
            'An evidence-chain format the team has agreed to review against.'
          ],
          'How to measure it':[
            'Investigation cycle time and reviewer correction rate.',
            'Share of conclusions traceable to cited evidence.'
          ]
        }},

      { n:8, p:3, k:'decision', isNew:true, t:'Governed action gate',
        badge:'human in the loop',
        s:'Every response action passes a gate defining what may be automatic, what needs approval and what is never automated.',
        d:{
          'What changes':[
            'Actions are classified in advance into automatic, approval-required and human-only tiers.',
            'Approvers, time bounds and rollback are defined per class rather than negotiated per incident.',
            'Every decision, including denials, is recorded against the case.'
          ],
          'Where AI fits':[
            'The AI proposes; the gate decides what it is allowed to do. This is the control that makes everything upstream safe to deploy.',
            'Build this before granting any action autonomy, not alongside it.'
          ],
          'Prerequisites':[
            'An agreed action taxonomy signed off by service owners and risk.',
            'Tested rollback for every automated action class.'
          ],
          'How to measure it':[
            'Percentage of actions taken within their defined class.',
            'Override rate and time spent waiting at the gate.'
          ]
        }},

      { n:9, p:3, k:'tool', t:'Automated containment playbooks',
        s:'Approved action classes execute automatically through orchestration, with full logging and rollback.',
        d:{
          'What changes':[
            'Low-risk, high-frequency containment happens in seconds rather than waiting for a shift.',
            'Playbooks are version-controlled and tested like any other code.',
            'Rollback is a designed feature, not an improvisation.'
          ],
          'Where AI fits':[
            'The model selects and parameterizes the playbook; the orchestration layer executes it deterministically. Keep those two things separate — never let the model improvise the action itself.'
          ],
          'Prerequisites':[
            'Current, tested runbooks and a working action gate.'
          ],
          'How to measure it':[
            'Mean time to contain by action class.',
            'Failed and rolled-back action rate.'
          ]
        }},

      { n:10, p:4, k:'ai', isNew:true, t:'AI-drafted incident narrative',
        s:'The case record is drafted automatically from the evidence chain and confirmed by the analyst.',
        d:{
          'What changes':[
            'Documentation stops being the tax paid at the end of an incident.',
            'Records become consistent enough to be genuinely searchable and reusable.',
            'Lessons learned are extractable across incidents rather than trapped in prose.'
          ],
          'Where AI fits':[
            'Drafting with mandatory human confirmation. The analyst edits and signs; the model does the typing.',
            'This quietly compounds — better records make every future retrieval and evaluation better.'
          ],
          'Prerequisites':[
            'A defined case schema and the evidence chain from investigation.'
          ],
          'How to measure it':[
            'Documentation completeness score and time spent per case.',
            'Edit distance between draft and final as a quality signal.'
          ]
        }},

      { n:11, p:4, k:'ai', isNew:true, t:'AI performance and assurance dashboard',
        badge:'executive',
        s:'Standing visibility into how the AI is performing: precision, autonomy rate, override rate and drift.',
        d:{
          'What changes':[
            'AI becomes a measured control rather than an experiment nobody can report on.',
            'Thresholds move on evidence, through a documented change process.',
            'Regulators, auditors and executives see the same numbers the team does.'
          ],
          'Where AI fits':[
            'This is governance of the AI rather than more AI. It is the artefact that lets you defend expanding autonomy — and the one most programs skip.',
            'Without it, the honest answer to "is the AI working" is that nobody knows.'
          ],
          'Prerequisites':[
            'An agreed metric set with baselines captured before deployment.',
            'Sampled human review feeding the quality numbers.'
          ],
          'How to measure it':[
            'Precision, recall and false-negative rate by use case.',
            'Autonomy rate and human override rate, trended.'
          ]
        }}
    ],

    observations: [
      { tag:'Foundation', ref:'1', t:'Normalize before you automate',
        b:'A shared schema across telemetry, assets, identity and case history is the prerequisite for every capability downstream. Sequencing this first is the single highest-leverage decision.' },
      { tag:'Detection', ref:'2 3', t:'Detection becomes code',
        b:'Version control, tests and technique mapping turn detection content into something a model can safely draft, tune and audit — and something you can prove coverage on.' },
      { tag:'Triage', ref:'4 5', t:'Automate retrieval first, judgement later',
        b:'Enrichment and clustering deliver most of the time savings and require no autonomy. Auto-close is introduced afterward, per category, behind a measured confidence threshold.' },
      { tag:'Response', ref:'8', t:'The gate is the control',
        b:'A documented action taxonomy with defined approvers and tested rollback is what makes agentic capability safe to deploy. Build it before granting autonomy, not after.' },
      { tag:'Organizational', ref:'11', t:'Measure the AI as a control',
        b:'Precision, autonomy rate and override rate, baselined before deployment and reviewed on a standing cadence, are what let you expand autonomy defensibly.' }
    ]
  },

  recommendations: [
    { owner:'Org', color:'navy', t:'Build the normalized data foundation',
      gap:'Telemetry, asset, identity and case data live in separate systems with different schemas, and some high-value sources sit outside the central store entirely.',
      build:[
        'Normalize priority sources into one open event schema with asset and identity context joined at ingest.',
        'Make case history queryable data rather than free text.',
        'Publish a source inventory with owner, retention and coverage against the control framework.'
      ],
      tools:['Security data lake','Open event schema','Ingest pipeline','Asset and identity context'],
      metrics:['Priority sources normalized','Context query completeness','Retrieval latency'] },

    { owner:'SOC', color:'navy2', t:'Move detection content into code',
      gap:'Rules are hand-authored and tuned inside the SIEM console, with no version history, no tests and only informal technique coverage.',
      build:[
        'Repository, peer review, automated tests and a deployment pipeline for detection content.',
        'Map every detection to an adversary technique so coverage is measurable.',
        'Retire console-side editing as a permitted path.'
      ],
      tools:['Detection-as-code repo','Test harness','CI pipeline','Technique framework mapping'],
      metrics:['Technique coverage','Detections with passing tests','New-content precision at 30 days'] },

    { owner:'SOC', color:'green', t:'Automate retrieval before judgement',
      gap:'Most triage time is spent assembling context across five or more consoles, not making the actual decision.',
      build:[
        'Enrichment and clustering agent that populates the case before a human opens it.',
        'Confidence and impact scoring on every case.',
        'Auto-close introduced one category at a time, behind a measured threshold with sampled audit.'
      ],
      tools:['Triage agent','Enrichment APIs','Case schema','Shadow-mode harness'],
      metrics:['Analyst minutes per case','Clustering accuracy','Auto-close rate and sampled false negatives'] },

    { owner:'SOC', color:'green2', t:'Give analysts an agentic investigation layer',
      gap:'Investigation depth depends on individual query skill, and senior analyst capacity is the binding constraint on the pipeline.',
      build:[
        'Natural language copilot over the data layer with generated queries always visible.',
        'Read-only investigation agent producing a reviewable evidence chain.',
        'A curated, versioned query library as grounding context.'
      ],
      tools:['Analyst copilot','Investigation agent','Query library','Evidence-chain format'],
      metrics:['Time to first meaningful finding','Reviewer correction rate','Adoption by tenure band'] },

    { owner:'SOC + Org', color:'teal', t:'Govern and measure the AI',
      gap:'There is no action taxonomy defining what may be automated, and no baseline for precision or override rate, so AI performance cannot be proven or defended.',
      build:[
        'Action classes with named approvers, time bounds and tested rollback.',
        'Standing AI performance dashboard with baselines captured before deployment.',
        'Documented change process for moving autonomy thresholds.'
      ],
      tools:['Action gate','Orchestration with rollback','AI assurance dashboard','Sampled review process'],
      metrics:['Actions within defined class','Human override rate','Precision and false-negative rate by use case'] }
  ]
},

/* ==================================================================
   VULNERABILITY MANAGEMENT
   ================================================================== */
vm: {
  key: 'vm',
  name: 'Vulnerability Management',
  short: 'Vuln Mgmt',
  tagline: 'Finding, prioritizing and closing exposure across the estate.',

  current: {
    label: 'Current State',
    phases: ['Discovery', 'Assessment', 'Prioritization', 'Remediation', 'Reporting'],
    nodes: [
      { n:1, p:0, k:'process', t:'Asset discovery via CMDB and sweeps',
        badge:'partial',
        s:'The asset picture is assembled from a CMDB plus periodic network discovery, and both are incomplete.',
        d:{
          'What happens today':[
            'The CMDB is authoritative on paper but lags reality, particularly in cloud and ephemeral workloads.',
            'Ownership fields are frequently stale, pointing at people or teams that have moved on.',
            'Anything not discovered is silently excluded from every downstream step.'
          ],
          'Why it matters for AI':[
            'Incomplete inventory is the hardest ceiling in the whole program. No amount of AI prioritization helps for assets nobody knows exist.',
            'Stale ownership is why remediation stalls, and it is a reconciliation problem models are genuinely good at.'
          ],
          'Signals of maturity':[
            'Coverage measured against independent sources rather than self-reported.',
            'Ownership resolved to an accountable team with a verified escalation path.'
          ]
        }},

      { n:2, p:1, k:'tool', t:'Scheduled infrastructure scans',
        badge:'periodic',
        s:'Authenticated and unauthenticated scans run on a fixed calendar cadence.',
        d:{
          'What happens today':[
            'Scan windows are negotiated around change freezes and business hours.',
            'Authenticated coverage is inconsistent, so results vary in depth by segment.',
            'Between windows, the exposure picture is simply out of date.'
          ],
          'Why it matters for AI':[
            'Point-in-time data means an AI prioritization layer is reasoning over a stale snapshot. Freshness is a data problem, not a model problem.',
            'Cadence should be driven by rate of change, which is itself something worth measuring first.'
          ],
          'Signals of maturity':[
            'Authenticated scan coverage tracked as a first-class metric.',
            'Cadence tied to asset criticality and change rate rather than the calendar.'
          ]
        }},

      { n:3, p:1, k:'tool', t:'Cloud and container scanning in separate tools',
        s:'Cloud posture, container images and infrastructure findings live in different consoles with different severity models.',
        d:{
          'What happens today':[
            'Each tool has its own identifiers, its own severity scale and its own idea of what an asset is.',
            'The same underlying issue can appear three times with three different scores.',
            'Nobody can produce a single ranked list across all sources without manual work.'
          ],
          'Why it matters for AI':[
            'Deduplication and normalization across scanners is well-suited to model-assisted work, but it needs a target schema to normalize into.',
            'Without unification, an AI prioritization layer inherits three contradictory truths.'
          ],
          'Signals of maturity':[
            'One finding identity across all sources.',
            'A single ranked queue regardless of which tool found the issue.'
          ]
        }},

      { n:4, p:1, k:'process', t:'Findings merged by hand',
        badge:'high friction',
        s:'Analysts export, deduplicate and reconcile findings across tools, often in spreadsheets.',
        d:{
          'What happens today':[
            'Export, merge, deduplicate and reformat consumes a meaningful share of the team week.',
            'The merged view is a snapshot that begins decaying the moment it is produced.',
            'Errors introduced during the merge are difficult to detect and rarely audited.'
          ],
          'Why it matters for AI':[
            'This is pure toil with a deterministic definition of correct — it should be a pipeline, not a person, and certainly not a spreadsheet.',
            'Every hour here is an hour not spent on the exposure decisions that actually reduce risk.'
          ],
          'Signals of maturity':[
            'No human step between scanner output and the ranked queue.',
            'Reconciliation logic version-controlled and tested.'
          ]
        }},

      { n:5, p:2, k:'decision', t:'Severity-based prioritization',
        badge:'CVSS only',
        s:'Findings are ranked by vendor severity score, with limited exploitability or business context.',
        d:{
          'What happens today':[
            'A critical on an isolated internal test host outranks a high on an internet-facing revenue system.',
            'Exploit availability and active exploitation are considered informally, if at all.',
            'The result is a queue that is technically accurate and operationally misleading.'
          ],
          'Why it matters for AI':[
            'Severity-only ranking is the clearest, most defensible place AI adds value — but it needs reachability, exposure and business context to reason over.',
            'The model is not the missing piece here. The context is.'
          ],
          'Signals of maturity':[
            'Known-exploited and exploit-prediction signals in the ranking.',
            'Business criticality applied consistently rather than argued per finding.'
          ]
        }},

      { n:6, p:3, k:'process', t:'SLA clock starts, ticket routed to owner',
        s:'Findings become tickets with a severity-derived due date and are routed to the mapped owner.',
        d:{
          'What happens today':[
            'Routing depends on ownership data that is frequently wrong, so tickets bounce.',
            'The SLA is derived from severity, which means it inherits the prioritization problem.',
            'Owning teams receive volume rather than a prioritized short list.'
          ],
          'Why it matters for AI':[
            'Owner resolution is a graph problem across CMDB, code repositories, cloud tags and directory data — a strong fit for model-assisted reconciliation.',
            'Sending an owner a ranked list of five things beats sending them four hundred.'
          ],
          'Signals of maturity':[
            'First-time routing accuracy measured and improving.',
            'Owners receive a risk-ranked short list rather than a raw dump.'
          ]
        }},

      { n:7, p:3, k:'process', t:'Owner patches, mitigates or requests exception',
        s:'The remediation path varies by team, tooling and appetite.',
        d:{
          'What happens today':[
            'Some teams have mature patch automation; others patch manually during change windows.',
            'Compensating controls are applied inconsistently and often not recorded as such.',
            'The security team has limited visibility into what was actually done.'
          ],
          'Why it matters for AI':[
            'Remediation guidance is a strong model capability — proposing the specific fix, config change or compensating control for this asset in this environment.',
            'Consistency across teams is the gap, and guidance is how you close it.'
          ],
          'Signals of maturity':[
            'A recorded, verifiable remediation action for every closed finding.',
            'Compensating controls tracked as controls, not as closures.'
          ]
        }},

      { n:8, p:3, k:'process', t:'Exception backlog grows',
        badge:'pressure valve',
        s:'Findings that cannot be fixed in the SLA window become exceptions, and exceptions accumulate.',
        d:{
          'What happens today':[
            'Exceptions are granted under deadline pressure rather than as a considered risk decision.',
            'Expiry dates pass without review and renewals are close to automatic.',
            'The backlog becomes the real risk picture, and nobody owns it as a whole.'
          ],
          'Why it matters for AI':[
            'The exception backlog is the most honest measure of unresolved risk in most programs, and it is almost never analysed as a portfolio.',
            'Clustering exceptions to find systemic root causes is a natural model task.'
          ],
          'Signals of maturity':[
            'Every exception has an expiry, an owner and a compensating control.',
            'Backlog reviewed as a portfolio with trend, not case by case.'
          ]
        }},

      { n:9, p:4, k:'sor', t:'Compliance and audit reporting',
        badge:'monthly',
        s:'Reporting focuses on counts, SLA attainment and audit evidence.',
        d:{
          'What happens today':[
            'Metrics are volume-based: findings open, findings closed, percentage within SLA.',
            'Reporting answers whether the process ran, not whether exposure went down.',
            'Assembly is manual and lags the actual state of the estate.'
          ],
          'Why it matters for AI':[
            'Count-based metrics will not survive contact with AI-driven prioritization — closing fewer, better-chosen findings looks like regression on this dashboard.',
            'Moving to residual-exposure measurement is a prerequisite, not a follow-on.'
          ],
          'Signals of maturity':[
            'Residual exposure trend reported alongside SLA attainment.',
            'Live dashboards rather than assembled monthly decks.'
          ]
        }}
    ],

    observations: [
      { tag:'Organizational', ref:'1', t:'Inventory is the binding constraint',
        b:'Asset and ownership data is incomplete and stale, particularly in cloud and ephemeral workloads. Anything not discovered is excluded from every downstream step.' },
      { tag:'Assessment', ref:'2 3', t:'Point-in-time and fragmented',
        b:'Scans run on a calendar cadence and cloud, container and infrastructure findings live in separate tools with incompatible severity models.' },
      { tag:'Prioritization', ref:'5', t:'Severity is not risk',
        b:'Ranking by vendor severity alone ignores exploitability, reachability and business criticality, producing a queue that is technically accurate and operationally misleading.' },
      { tag:'Remediation', ref:'7 8', t:'Inconsistent paths, growing exceptions',
        b:'Remediation quality varies by team, compensating controls are recorded inconsistently, and the exception backlog accumulates without portfolio-level ownership.' },
      { tag:'Organizational', ref:'9', t:'Counting activity, not exposure',
        b:'Reporting measures findings closed and SLA attainment rather than whether residual exposure is actually falling.' }
    ]
  },

  future: {
    label: 'Future State',
    phases: ['Asset Intelligence', 'Unified Exposure', 'AI Prioritization', 'AI Remediation', 'Assurance'],
    foundation: 'Centralized, normalized data foundation — asset graph, exposure data, threat intelligence, business and risk context',
    nodes: [
      { n:1, p:0, k:'ai', isNew:true, t:'Continuous asset and ownership graph',
        s:'Assets, ownership and business context reconciled continuously from CMDB, agents, cloud APIs and code repositories.',
        d:{
          'What changes':[
            'Inventory becomes a continuously reconciled graph rather than a periodically refreshed table.',
            'Ownership is derived from multiple corroborating sources and flagged when they disagree.',
            'Cloud and ephemeral workloads are captured as they appear, not at the next sweep.'
          ],
          'Where AI fits':[
            'Reconciling conflicting sources and resolving ownership is graph reasoning over messy data — a strong model fit, with humans confirming disputed cases.',
            'This is unglamorous and it is the highest-value item in the domain. Everything downstream depends on it.'
          ],
          'Prerequisites':[
            'API access to cloud providers, endpoint agents and code repositories.',
            'An agreed definition of what constitutes an asset and who counts as its owner.'
          ],
          'How to measure it':[
            'Coverage against independent sources.',
            'Ownership resolution rate and first-time routing accuracy.'
          ]
        }},

      { n:2, p:1, k:'tool', t:'Unified exposure ingestion',
        s:'Infrastructure, cloud, container, application and identity findings normalize into one model.',
        d:{
          'What changes':[
            'One finding identity across every source, so the same issue is not counted three times.',
            'A single ranked queue regardless of which scanner produced the finding.',
            'Reconciliation logic is version-controlled and tested rather than performed by hand.'
          ],
          'Where AI fits':[
            'Model-assisted mapping of vendor-specific findings into the common schema, with deterministic rules taking over once the mapping is established.',
            'The goal is to eliminate the manual merge step entirely.'
          ],
          'Prerequisites':[
            'A target finding schema and API access to every scanning source.'
          ],
          'How to measure it':[
            'Sources ingested and deduplication accuracy.',
            'Manual merge hours eliminated.'
          ]
        }},

      { n:3, p:1, k:'tool', t:'Continuous assessment with threat context',
        badge:'near real time',
        s:'Assessment cadence follows change rate, with known-exploited and exploit-prediction signals fused in.',
        d:{
          'What changes':[
            'High-criticality and fast-changing assets are assessed continuously rather than on a calendar.',
            'Active exploitation and exploit-prediction signals are attached to findings automatically.',
            'The exposure picture stops being a snapshot.'
          ],
          'Where AI fits':[
            'Less about model capability and more about pipeline design. AI helps interpret and summarize threat context, but freshness is an engineering outcome.'
          ],
          'Prerequisites':[
            'Agent or API-based assessment coverage and threat intelligence feeds.'
          ],
          'How to measure it':[
            'Assessment freshness by asset criticality tier.',
            'Time from disclosure to organizational awareness.'
          ]
        }},

      { n:4, p:2, k:'ai', isNew:true, t:'AI exposure analysis',
        badge:'reachability',
        s:'Reachability, blast radius, existing compensating controls and business criticality are analysed together.',
        d:{
          'What changes':[
            'A finding is assessed in the context of whether it is actually reachable and what it would cost if exploited.',
            'Existing compensating controls are recognized rather than ignored.',
            'The output is an explained risk position, not just a number.'
          ],
          'Where AI fits':[
            'This is the flagship use case for the domain. It requires reasoning across asset topology, control coverage and business context simultaneously — exactly what frontier models are good at.',
            'Insist on explanations. An unexplained risk score will not survive its first argument with an application owner.'
          ],
          'Prerequisites':[
            'Asset graph, unified exposure data, control library and business criticality ratings.'
          ],
          'How to measure it':[
            'Agreement between AI ranking and expert review.',
            'Share of findings with a traceable explanation.'
          ]
        }},

      { n:5, p:2, k:'ai', isNew:true, t:'Risk-ranked queue replaces severity queue',
        s:'Owners receive a short, risk-ranked list with the reasoning attached.',
        d:{
          'What changes':[
            'Teams get five things that matter instead of four hundred sorted by severity.',
            'Ranking rules are explicit, versioned and auditable.',
            'SLA is driven by risk rather than by vendor severity score.'
          ],
          'Where AI fits':[
            'The model produces the ranking; the rules governing it stay human-owned and reviewable. Never let ranking logic become a black box.',
            'Expect to defend the first few rankings in detail. That is a healthy sign.'
          ],
          'Prerequisites':[
            'Exposure analysis in place and agreement from risk owners on the ranking model.'
          ],
          'How to measure it':[
            'Time to remediate the top decile of risk.',
            'Queue size per owner and completion rate.'
          ]
        }},

      { n:6, p:3, k:'ai', isNew:true, t:'AI remediation agent proposes the fix',
        s:'For each finding the agent proposes a specific patch, configuration change or compensating control.',
        d:{
          'What changes':[
            'Owners receive a proposed fix specific to their asset and environment, not a generic advisory link.',
            'Where a patch is not viable the agent proposes a compensating control instead.',
            'Remediation consistency stops depending on individual team maturity.'
          ],
          'Where AI fits':[
            'Proposal only. The agent never applies anything at this step — separating proposal from execution is what makes the capability safe to introduce.',
            'This is where the productivity gain for application teams is most visible.'
          ],
          'Prerequisites':[
            'Control library, environment context and a reviewed proposal format.'
          ],
          'How to measure it':[
            'Proposal acceptance rate and time to remediate.',
            'Consistency of remediation approach across teams.'
          ]
        }},

      { n:7, p:3, k:'decision', isNew:true, t:'Validation and approval gate',
        badge:'human in the loop',
        s:'Proposals are validated automatically and approved by a human before anything is applied.',
        d:{
          'What changes':[
            'Automated validation checks the proposal against policy, change control and dependency impact.',
            'A human owner approves, with the reasoning and the evidence in front of them.',
            'Rollback is defined before the action, not after it fails.'
          ],
          'Where AI fits':[
            'The gate constrains the AI rather than extending it. It is what makes the auto-remediation step downstream acceptable to change management.',
            'Get change management into the design of this gate early. Retrofitting their approval is much harder.'
          ],
          'Prerequisites':[
            'Agreement with change management on classes and approvers.',
            'Tested rollback per action class.'
          ],
          'How to measure it':[
            'Approval turnaround time and rejection rate.',
            'Failed change rate for AI-proposed actions.'
          ]
        }},

      { n:8, p:3, k:'ai', isNew:true, t:'Approved auto-remediation',
        badge:'bounded',
        s:'Pre-approved low-risk classes are applied automatically, with logging and tested rollback.',
        d:{
          'What changes':[
            'Routine, well-understood fixes stop consuming approval cycles.',
            'The set of auto-remediable classes starts small and expands on evidence.',
            'Every automated action is logged, reversible and attributable.'
          ],
          'Where AI fits':[
            'This is the point of highest operational risk in the domain. Start with a narrow, boring class of changes and expand only on demonstrated reliability.',
            'The measure of success is not how much is automated, but that nothing automated has caused an incident.'
          ],
          'Prerequisites':[
            'A sustained track record from the proposal and approval steps.',
            'Change management sign-off on each auto-remediable class.'
          ],
          'How to measure it':[
            'Auto-remediation rate by class.',
            'Failed and rolled-back change rate, which should stay near zero.'
          ]
        }},

      { n:9, p:4, k:'ai', isNew:true, t:'Residual exposure and AI performance dashboard',
        badge:'executive',
        s:'Reporting shifts from findings closed to exposure remaining, alongside AI performance metrics.',
        d:{
          'What changes':[
            'Leadership sees whether risk is actually falling, not just whether tickets are closing.',
            'The exception backlog is reported as a portfolio with trend and root-cause clustering.',
            'AI ranking accuracy and remediation acceptance are tracked as controls.'
          ],
          'Where AI fits':[
            'Governance of the AI plus model-assisted clustering of the exception backlog to find systemic causes.',
            'Change this reporting model before the prioritization goes live, or the new approach will look like a regression on the old dashboard.'
          ],
          'Prerequisites':[
            'Agreed residual exposure definition and pre-deployment baselines.'
          ],
          'How to measure it':[
            'Residual exposure trend by business unit.',
            'AI ranking agreement rate and override rate.'
          ]
        }}
    ],

    observations: [
      { tag:'Foundation', ref:'1', t:'Fix inventory first',
        b:'A continuously reconciled asset and ownership graph is the prerequisite for everything else. Model-assisted reconciliation across CMDB, cloud, agents and repositories is the fastest route there.' },
      { tag:'Assessment', ref:'2 3', t:'One exposure model, continuous cadence',
        b:'Normalize infrastructure, cloud, container, application and identity findings into a single identity and drive cadence from change rate rather than the calendar.' },
      { tag:'Prioritization', ref:'4 5', t:'Rank by exposure, not severity',
        b:'Reachability, blast radius, compensating controls and business criticality reasoned over together — with an explanation attached to every ranking.' },
      { tag:'Remediation', ref:'6 7 8', t:'Propose, approve, then automate',
        b:'The agent proposes a specific fix; a human approves; only pre-agreed low-risk classes apply automatically. Keeping proposal and execution separate is what makes this safe.' },
      { tag:'Organizational', ref:'9', t:'Report residual exposure',
        b:'Move the executive metric from findings closed to exposure remaining before the new prioritization goes live, or better decisions will read as worse numbers.' }
    ]
  },

  recommendations: [
    { owner:'Org', color:'navy', t:'Build a continuous asset and ownership graph',
      gap:'Asset inventory is incomplete and ownership data is stale, particularly in cloud and ephemeral workloads. Anything undiscovered is excluded from every downstream step.',
      build:[
        'Continuously reconcile CMDB, cloud APIs, endpoint agents and code repositories into one graph.',
        'Derive ownership from corroborating sources and flag disagreements for human confirmation.',
        'Measure coverage against independent sources rather than self-reporting.'
      ],
      tools:['Asset graph','Cloud and agent APIs','CMDB integration','Ownership reconciliation'],
      metrics:['Coverage vs independent sources','Ownership resolution rate','First-time routing accuracy'] },

    { owner:'VM', color:'navy2', t:'Unify exposure data and go continuous',
      gap:'Cloud, container and infrastructure findings sit in separate tools with incompatible severity models, merged by hand into a decaying spreadsheet.',
      build:[
        'One finding identity and one ranked queue across all sources.',
        'Version-controlled, tested reconciliation logic replacing the manual merge.',
        'Assessment cadence driven by asset criticality and change rate.'
      ],
      tools:['Unified exposure store','Scanner APIs','Normalization pipeline','Threat intelligence feeds'],
      metrics:['Sources ingested','Deduplication accuracy','Assessment freshness by tier'] },

    { owner:'VM', color:'green', t:'Rank by exposure, not severity',
      gap:'CVSS-only prioritization ignores reachability, active exploitation and business criticality, producing a queue that is technically accurate and operationally misleading.',
      build:[
        'AI exposure analysis over reachability, blast radius, compensating controls and business context.',
        'Explicit, versioned, auditable ranking rules with an explanation on every finding.',
        'Risk-driven SLAs replacing severity-derived due dates.'
      ],
      tools:['Exposure analysis','Control library','Business criticality ratings','Known-exploited and exploit-prediction feeds'],
      metrics:['AI vs expert ranking agreement','Time to remediate top-decile risk','Explanation coverage'] },

    { owner:'VM + App teams', color:'green2', t:'Propose remediation, then bound the automation',
      gap:'Remediation paths vary by team, compensating controls are recorded inconsistently, and the exception backlog grows without portfolio ownership.',
      build:[
        'Remediation agent proposing a specific patch, config change or compensating control per asset.',
        'Validation and human approval gate with tested rollback per action class.',
        'Auto-remediation limited to pre-approved low-risk classes, expanded only on evidence.'
      ],
      tools:['Remediation agent','Change management integration','Patch and config automation','Rollback tooling'],
      metrics:['Proposal acceptance rate','Approval turnaround','Failed and rolled-back change rate'] },

    { owner:'Org', color:'teal', t:'Report residual exposure and AI performance',
      gap:'Reporting counts findings closed and SLA attainment, which will read as regression once prioritization shifts to risk rather than volume.',
      build:[
        'Residual exposure as the headline executive metric, with baselines captured first.',
        'Exception backlog reported as a portfolio with trend and root-cause clustering.',
        'Standing AI performance view: ranking agreement, override rate, acceptance rate.'
      ],
      tools:['Exposure dashboard','Exception portfolio analytics','AI assurance metrics'],
      metrics:['Residual exposure trend','Exception backlog age and trend','AI override rate'] }
  ]
},

/* ==================================================================
   APPLICATION SECURITY
   ================================================================== */
appsec: {
  key: 'appsec',
  name: 'Application Security',
  short: 'AppSec',
  tagline: 'Securing applications, code and agents from design through production.',

  current: {
    label: 'Current State',
    phases: ['Initiation', 'Onboarding and Architecture', 'Build and Scan', 'Dynamic and Manual Testing', 'Reporting and Risk'],
    nodes: [
      { n:1, p:0, k:'process', t:'Team needs an application',
        s:'A business team identifies the need for a new internal or external facing application.',
        d:{
          'What happens today':[
            'Engagement with security depends on whether the team knows to ask.',
            'Applications built outside the standard intake path never enter the program.',
            'There is no automatic trigger tying application creation to a security record.'
          ],
          'Why it matters for AI':[
            'Voluntary intake is why the inventory is incomplete, and inventory gaps propagate through the entire lifecycle.',
            'The fix is a system trigger, not a policy reminder.'
          ],
          'Signals of maturity':[
            'Application creation automatically produces an inventory record.',
            'Security engagement initiated by the system, not by the team remembering.'
          ]
        }},

      { n:2, p:1, k:'process', t:'Security architecture review',
        badge:'main kickoff',
        s:'A human-led architecture review is the primary point of security engagement.',
        d:{
          'What happens today':[
            'Review quality is high but throughput is limited by reviewer availability.',
            'Output is a document, and its requirements are not mechanically linked to anything downstream.',
            'Re-review after significant architecture change is inconsistent.'
          ],
          'Why it matters for AI':[
            'The review is a genuine quality control worth preserving. The gap is that its output is prose rather than enforceable configuration.',
            'AI can prepare and pre-analyse the review so expert time goes to judgement rather than intake.'
          ],
          'Signals of maturity':[
            'Review requirements expressed as checkable conditions.',
            'Re-review triggered automatically by material architecture change.'
          ]
        }},

      { n:3, p:1, k:'process', t:'Architecture requirements set',
        s:'Approved pipeline, repository and scanning requirements are defined for the application.',
        d:{
          'What happens today':[
            'Requirements are documented and communicated but not technically enforced.',
            'Compliance is assumed rather than verified.',
            'Drift after go-live is generally invisible.'
          ],
          'Why it matters for AI':[
            'Requirements that are not machine-checkable cannot be monitored by anything, AI included.',
            'Turning requirements into configuration is a precondition for the gate downstream.'
          ],
          'Signals of maturity':[
            'Requirements represented as policy-as-code.',
            'Continuous verification rather than point-in-time attestation.'
          ]
        }},

      { n:4, p:1, k:'decision', t:'Uses approved repository and pipeline?',
        badge:'optional today',
        s:'The approved path exists but is opt-in, so there is no enforceable technical gate.',
        d:{
          'What happens today':[
            'Some environments and teams sit outside the program entirely.',
            'There is no technical mechanism that prevents building outside the approved path.',
            'The security team often learns about non-compliant applications after go-live.'
          ],
          'Why it matters for AI':[
            'This is the structural gap. Any AI capability inserted into the pipeline only covers applications that actually use the pipeline.',
            'Coverage, not model quality, is what limits value here.'
          ],
          'Signals of maturity':[
            'A single governed path that cannot be bypassed.',
            'Bypass attempts logged, alerted and reviewed.'
          ]
        }},

      { n:5, p:2, k:'process', t:'Code moves through the CI pipeline',
        s:'Approved applications build through the standard continuous integration pipeline.',
        d:{
          'What happens today':[
            'The pipeline is well established for teams that use it.',
            'Security steps are stages within the build rather than gates on it.',
            'Failing a security stage does not reliably stop a build.'
          ],
          'Why it matters for AI':[
            'The pipeline is the natural insertion point for AI review, and it already exists — the work is enforcement, not plumbing.',
            'A stage that cannot block is advisory, and advisory controls decay.'
          ],
          'Signals of maturity':[
            'Security stages have defined pass and fail semantics.',
            'Build outcome is genuinely tied to security results.'
          ]
        }},

      { n:6, p:2, k:'tool', t:'SAST and SCA scanning per build',
        badge:'per build',
        s:'Static analysis and dependency scanning run on each build of onboarded applications.',
        d:{
          'What happens today':[
            'Scanning is build-driven, so cadence varies with how often a team ships.',
            'Slow-moving applications can go long periods without assessment.',
            'False positive rates drive selective attention to results.'
          ],
          'Why it matters for AI':[
            'Build-driven cadence means an infrequently changing but internet-facing application is assessed rarely — exactly backwards from a risk perspective.',
            'False positive reduction is one of the clearest AI wins available in AppSec.'
          ],
          'Signals of maturity':[
            'Assessment cadence tied to risk, not only to commit frequency.',
            'False positive rate measured and trending down.'
          ]
        }},

      { n:7, p:3, k:'tool', t:'Dynamic testing',
        badge:'periodic',
        s:'Dynamic application security testing runs on a periodic cadence against running environments.',
        d:{
          'What happens today':[
            'Cadence is periodic and not synchronized with release activity.',
            'Coverage of authenticated and API surfaces is inconsistent.',
            'Results arrive on a different clock from static findings, complicating triage.'
          ],
          'Why it matters for AI':[
            'Correlating static and dynamic findings for the same application is a strong model task and materially improves confidence in what is real.',
            'Unsynchronized cadences are why the same issue is triaged twice.'
          ],
          'Signals of maturity':[
            'Dynamic testing triggered by deployment events.',
            'Authenticated and API coverage tracked explicitly.'
          ]
        }},

      { n:8, p:3, k:'process', t:'Manual penetration testing',
        badge:'annual',
        s:'Expert-led testing on an annual or event-driven basis for higher-criticality applications.',
        d:{
          'What happens today':[
            'Depth is excellent and coverage is narrow, constrained by cost and scheduling.',
            'Findings are delivered as reports and re-keyed into the tracking system.',
            'Between tests, the assurance position is inferred rather than measured.'
          ],
          'Why it matters for AI':[
            'Expert testing is not the thing to automate away. AI should widen the coverage between engagements so expert time goes to the hardest problems.',
            'Report re-keying is unnecessary toil that also loses fidelity.'
          ],
          'Signals of maturity':[
            'Findings ingested structurally rather than transcribed.',
            'Continuous testing covering the ground between engagements.'
          ]
        }},

      { n:9, p:4, k:'process', t:'Triage and assign findings to owners',
        s:'Findings are triaged by severity and assigned to the owning application team.',
        d:{
          'What happens today':[
            'Severity is the primary and often the only prioritization input.',
            'Owner mapping depends on inventory data that is not always current.',
            'Teams receive volume rather than a prioritized short list.'
          ],
          'Why it matters for AI':[
            'Prioritization that ignores reachability and business context produces a queue application teams learn to ignore.',
            'Credibility with engineering teams is the real currency here, and it is spent by sending noise.'
          ],
          'Signals of maturity':[
            'Prioritization includes exploitability and business context.',
            'Owner mapping resolved automatically and verified.'
          ]
        }},

      { n:10, p:4, k:'sor', t:'Findings in the system of record',
        s:'The AppSec system of record holds findings, status and evidence for controls monitoring.',
        d:{
          'What happens today':[
            'Traditional scanner findings flow in reliably.',
            'AI-assisted and experimental findings have no supported path into the record.',
            'Controls monitoring and audit evidence therefore reflect only part of the picture.'
          ],
          'Why it matters for AI':[
            'If AI-assisted findings cannot enter the system of record, the AI program cannot be evidenced, audited or defended — regardless of how well it performs.',
            'This is usually a schema and provenance problem, not a capability problem, and it is worth solving early.'
          ],
          'Signals of maturity':[
            'A supported ingestion path with provenance for AI-generated findings.',
            'AI findings visible in controls monitoring alongside traditional sources.'
          ]
        }},

      { n:11, p:4, k:'process', t:'Owner remediation, path varies',
        s:'Owners patch, apply a compensating control or raise a risk exception, with the path varying by team.',
        d:{
          'What happens today':[
            'Remediation maturity varies significantly across application teams.',
            'Compensating controls are recorded inconsistently.',
            'Risk exceptions accumulate and are rarely revisited before expiry.'
          ],
          'Why it matters for AI':[
            'Specific, environment-aware remediation guidance is where AI most directly helps engineering teams, and it is how you level up the less mature ones.',
            'Consistency is the goal, not speed alone.'
          ],
          'Signals of maturity':[
            'A recorded, verifiable action for every closed finding.',
            'Exceptions with expiry, owner and compensating control.'
          ]
        }},

      { n:12, p:2, k:'ai', t:'AI-assisted review, running in parallel',
        badge:'experimental',
        s:'AI review of code and scan output runs alongside the traditional program, outside the system of record.',
        d:{
          'What happens today':[
            'Results are promising and are compared informally against the traditional program.',
            'There is no supported path for these findings into the system of record.',
            'The work is genuinely valuable and organizationally invisible.'
          ],
          'Why it matters for AI':[
            'A parallel experiment is the right way to start and the wrong place to stay. Without a path into the record it cannot become a control.',
            'The next step is not more capability, it is provenance and integration.'
          ],
          'Signals of maturity':[
            'A defined promotion path from experiment to production control.',
            'Measured comparison against the traditional program on a standing basis.'
          ]
        }}
    ],

    observations: [
      { tag:'Organizational', ref:'1', t:'No connected view',
        b:'Application and API inventory is incomplete and not reliably mapped back to the correct repositories, so coverage cannot be stated with confidence.' },
      { tag:'Governance', ref:'4', t:'No enforceable gate',
        b:'Approved repositories and pipelines exist but are optional, so there is no technical gate today and some environments sit outside the program entirely.' },
      { tag:'Detection', ref:'6 7', t:'Build-driven, not continuous',
        b:'Scanning cadence follows commit frequency rather than risk, so a slow-moving internet-facing application can go long periods without assessment.' },
      { tag:'Remediation', ref:'9 11', t:'Severity-only triage, varied remediation',
        b:'Findings are prioritized by severity alone and remediation next steps vary across teams once findings reach owners.' },
      { tag:'Organizational', ref:'10 12', t:'AI work is not captured',
        b:'AI-assisted findings do not flow into the system of record, leaving no supported way to report them for controls monitoring or to evidence AI efficacy.' }
    ]
  },

  future: {
    label: 'Future State',
    phases: ['Inventory and Governance', 'Secure Development (Gated)', 'Continuous Detection', 'Remediation and Reporting'],
    foundation: 'Centralized, normalized data foundation — application and API inventory, security tooling, business context, risk context, control library',
    nodes: [
      { n:1, p:0, k:'process', t:'Application created and inventory record made',
        s:'Creating an application automatically produces an inventory record with owner and criticality.',
        d:{
          'What changes':[
            'Inventory is a system outcome rather than a process people have to remember.',
            'Owner, criticality and repository mapping are captured at creation.',
            'Applications without records become an exception you can detect.'
          ],
          'Where AI fits':[
            'Model-assisted reconciliation of repositories, deployments and inventory records to find the applications nobody registered.',
            'Not glamorous, and it determines the coverage of everything downstream.'
          ],
          'Prerequisites':[
            'Integration between the application provisioning path and the inventory system.'
          ],
          'How to measure it':[
            'Applications with a complete inventory record.',
            'Repository-to-application mapping accuracy.'
          ]
        }},

      { n:2, p:0, k:'process', t:'Security architecture review, AI assisted',
        s:'Human-led review with AI preparing context, drafting requirements and flagging pattern deviations.',
        d:{
          'What changes':[
            'Reviewers arrive with context already assembled and comparable designs surfaced.',
            'Requirements are produced as checkable conditions rather than prose.',
            'Material architecture change triggers automatic re-review.'
          ],
          'Where AI fits':[
            'Preparation and drafting, with the architect making every judgement. Throughput of reviews goes up without lowering the bar.',
            'Deliberately keep the human as reviewer of record here.'
          ],
          'Prerequisites':[
            'A corpus of prior reviews and an agreed requirements format.'
          ],
          'How to measure it':[
            'Reviews completed per architect per month.',
            'Share of requirements expressed as checkable conditions.'
          ]
        }},

      { n:3, p:1, k:'process', isNew:true, t:'Development restricted to approved pathways',
        s:'Application, code and agent development is constrained to approved repositories and pipelines.',
        d:{
          'What changes':[
            'One governed path replaces informal expectation.',
            'Environments outside the program are identified and either onboarded or retired.',
            'Agent and AI-component development is covered by the same governance as application code.'
          ],
          'Where AI fits':[
            'Not an AI capability — it is the coverage prerequisite that determines whether any AI capability actually reaches your applications.',
            'Including agent development explicitly matters as teams start shipping AI components of their own.'
          ],
          'Prerequisites':[
            'Executive sponsorship and a migration path for applications currently outside the program.'
          ],
          'How to measure it':[
            'Percentage of builds through the governed path.',
            'Applications outside the program, trending to zero.'
          ]
        }},

      { n:4, p:1, k:'decision', isNew:true, t:'AI code review gate',
        badge:'cannot be bypassed',
        s:'A pre-build technical gate combining AI review with scan results, using defined pass and fail criteria.',
        d:{
          'What changes':[
            'The gate is technical and cannot be bypassed, replacing optional expectation.',
            'AI pre-merge review is formalized into the pipeline rather than run alongside it.',
            'Blocked builds route directly into the remediation flow.'
          ],
          'Where AI fits':[
            'AI review contributes to a pass or fail decision, which means precision matters more than coverage. A noisy gate will be disabled within a month.',
            'Start the gate in warn-only mode, measure precision, then switch to blocking once the numbers justify it.'
          ],
          'Prerequisites':[
            'Approved pathways enforced, agreed pass and fail criteria, and a measured warn-only period.'
          ],
          'How to measure it':[
            'Gate pass and fail rate and bypass attempts blocked.',
            'False positive rate at the gate and developer-reported friction.'
          ]
        }},

      { n:5, p:2, k:'tool', t:'Static and dependency analysis',
        s:'Traditional static and composition analysis, folded into a single review with the other detection sources.',
        d:{
          'What changes':[
            'Static and composition results are correlated with dynamic and AI findings rather than triaged separately.',
            'Cadence is driven by risk as well as by commit frequency.',
            'Results feed the gate rather than sitting in a separate report.'
          ],
          'Where AI fits':[
            'Correlation and false positive reduction across sources, rather than replacing the scanners themselves.'
          ],
          'Prerequisites':[
            'Unified finding schema across detection sources.'
          ],
          'How to measure it':[
            'False positive rate and assessment freshness by application criticality.'
          ]
        }},

      { n:6, p:2, k:'tool', t:'Dynamic testing at higher frequency',
        s:'Dynamic testing triggered by deployment events, with explicit authenticated and API coverage.',
        d:{
          'What changes':[
            'Testing follows deployments rather than the calendar.',
            'Authenticated and API surface coverage is tracked as a metric.',
            'Results arrive on the same clock as other findings.'
          ],
          'Where AI fits':[
            'Model assistance in generating authenticated test flows and API coverage, plus correlation with static findings.'
          ],
          'Prerequisites':[
            'Deployment event integration and API inventory.'
          ],
          'How to measure it':[
            'Coverage of authenticated and API surfaces.',
            'Time from deployment to assessment.'
          ]
        }},

      { n:7, p:2, k:'ai', isNew:true, t:'Graph and constraint-based analysis',
        badge:'false positive reduction',
        s:'Graph analysis with constraint solving determines whether a finding is genuinely reachable and exploitable.',
        d:{
          'What changes':[
            'Findings that are not reachable in practice are suppressed with a recorded justification.',
            'The remaining queue is smaller and materially more credible to engineering teams.',
            'Suppression logic is auditable rather than a black box.'
          ],
          'Where AI fits':[
            'This pairs formal methods with model reasoning — the solver provides rigour, the model provides breadth. It is the most direct answer to scanner noise.',
            'Every suppression must carry its justification. Silent suppression is how you lose the auditors.'
          ],
          'Prerequisites':[
            'Code graph construction and an agreed suppression justification format.'
          ],
          'How to measure it':[
            'False positive reduction rate.',
            'Suppression accuracy validated by sampling.'
          ]
        }},

      { n:8, p:2, k:'ai', isNew:true, t:'AI red teaming',
        badge:'includes AI components',
        s:'Continuous adversarial testing, extending to the AI and agent components teams are now shipping.',
        d:{
          'What changes':[
            'Adversarial testing runs continuously rather than annually, starting with the external perimeter.',
            'Coverage explicitly includes prompt injection, agent tool abuse and model misuse for applications with AI components.',
            'Expert testers focus on the hardest targets while automated red teaming covers the breadth.'
          ],
          'Where AI fits':[
            'Both the tester and part of the target. As application teams ship agents, the attack surface changes shape and traditional testing does not cover it.',
            'This is the capability most likely to be missing from current AppSec programs entirely.'
          ],
          'Prerequisites':[
            'Rules of engagement, safe test environments and an inventory of applications with AI components.'
          ],
          'How to measure it':[
            'Coverage of AI-enabled applications.',
            'Findings from automated versus expert red teaming.'
          ]
        }},

      { n:9, p:3, k:'ai', isNew:true, t:'AI exposure analysis',
        s:'Findings prioritized by reachability, blast radius, business context and existing controls.',
        d:{
          'What changes':[
            'Prioritization considers whether an issue is actually exposed and what it would cost.',
            'Structured, versioned rules drive ranking and remediation routing.',
            'Application teams receive a short, credible list.'
          ],
          'Where AI fits':[
            'Reasoning across the code graph, deployment topology, control coverage and business context simultaneously.',
            'Shared with the vulnerability management domain — build it once and serve both.'
          ],
          'Prerequisites':[
            'Data foundation with business and risk context, plus the control library.'
          ],
          'How to measure it':[
            'Findings ranked by exposure rather than severity.',
            'Agreement between AI ranking and expert review.'
          ]
        }},

      { n:10, p:3, k:'ai', isNew:true, t:'Agent review of AI-generated results',
        badge:'quality control',
        s:'A separate agent validates AI-produced findings before they are promoted to the system of record.',
        d:{
          'What changes':[
            'AI output is checked before it reaches humans or the record.',
            'Low-confidence output is routed for human review rather than promoted.',
            'Provenance is attached to every AI-generated finding.'
          ],
          'Where AI fits':[
            'A distinct model reviewing another model output, with different prompting and grounding. This is what makes AI findings defensible enough to enter a system of record.',
            'It is also the answer to the current-state gap where AI work cannot be captured at all.'
          ],
          'Prerequisites':[
            'A provenance schema and an agreed confidence threshold for promotion.'
          ],
          'How to measure it':[
            'Promotion rate and post-promotion accuracy.',
            'Findings caught by review before reaching owners.'
          ]
        }},

      { n:11, p:3, k:'ai', isNew:true, t:'AI-proposed remediation with human validation',
        s:'The agent proposes the fix; validation and human approval precede any approved action.',
        d:{
          'What changes':[
            'Owners receive a specific proposed change rather than a generic advisory.',
            'Approved actions include auto-patching, compensating control or human intervention.',
            'Remediation consistency stops depending on individual team maturity.'
          ],
          'Where AI fits':[
            'Proposal with mandatory human validation. Proposal and execution stay separate, exactly as in the vulnerability management flow.',
            'This is where application teams feel the benefit most directly.'
          ],
          'Prerequisites':[
            'Control library, environment context and an approval gate agreed with change management.'
          ],
          'How to measure it':[
            'Proposal acceptance rate and time to remediate.',
            'Consistency of remediation across teams.'
          ]
        }},

      { n:12, p:3, k:'ai', isNew:true, t:'Notification and stakeholder loop',
        s:'Continued stakeholder interaction and feedback rather than one-way ticket assignment.',
        d:{
          'What changes':[
            'Owners get context, reasoning and a proposed fix in the tools they already use.',
            'Feedback from owners returns to the system and improves ranking and suppression.',
            'Disagreements become data instead of friction.'
          ],
          'Where AI fits':[
            'Drafting the communication and interpreting the response. The feedback loop is what makes the ranking model improve over time.',
            'Programs that skip this end up with technically correct rankings that engineering teams do not trust.'
          ],
          'Prerequisites':[
            'Integration with developer tooling and a defined feedback schema.'
          ],
          'How to measure it':[
            'Owner response rate and feedback volume.',
            'Change in ranking accuracy attributable to feedback.'
          ]
        }},

      { n:13, p:3, k:'ai', isNew:true, t:'AI performance reporting',
        badge:'executive',
        s:'Metrics tracked for findings and for AI performance, per team against agreed thresholds.',
        d:{
          'What changes':[
            'AI-assisted findings flow into the system of record with provenance and appear in controls monitoring.',
            'Each team performance against thresholds is visible in a standing organizational dashboard.',
            'AI efficacy can be evidenced to auditors and regulators.'
          ],
          'Where AI fits':[
            'Governance of the AI. This closes the current-state gap where AI-assisted findings cannot be captured or reported at all.',
            'Formalize it as a standing executive report, not a one-off analysis.'
          ],
          'Prerequisites':[
            'Provenance in the system of record and pre-deployment baselines.'
          ],
          'How to measure it':[
            'Precision and false positive rate by AI use case.',
            'Team performance against thresholds, trended.'
          ]
        }}
    ],

    observations: [
      { tag:'Foundation', ref:'1', t:'Expand the organizational data layer',
        b:'Consolidate application, API and repository inventory with business context, risk context and a control library into a centralized, normalized data foundation available to all security teams.' },
      { tag:'Governance', ref:'3 4', t:'Enforceable build gates, not opt-in',
        b:'One governed pipeline with a technical pre-build gate that cannot be bypassed, wired to both scan and AI review output, with defined pass and fail criteria.' },
      { tag:'Detection', ref:'4 7 8', t:'Built-in AI review, plus continuous adversarial testing',
        b:'Formalize AI pre-merge review in the pipeline, fold static, dependency, dynamic and constraint-based analysis into one review, and extend red teaming to the AI components teams now ship.' },
      { tag:'Remediation', ref:'9 11', t:'Exposure-based analysis and proposed fixes',
        b:'Structured rules rank findings by actual exposure and drive remediation; the agent proposes a specific fix that a human validates before any approved action.' },
      { tag:'Organizational', ref:'10 13', t:'Make AI performance visible',
        b:'Give AI findings a provenance-carrying path into the system of record and stand up an organizational dashboard tracking AI performance per team against agreed thresholds.' }
    ]
  },

  recommendations: [
    { owner:'Org', color:'navy', t:'Expand the organizational data layer',
      gap:'There is no single connected view across applications. Asset and API inventory is incomplete and not reliably mapped back to the correct repositories.',
      build:[
        'Consolidate inventory and security tooling data into a centralized, normalized data foundation.',
        'Add business context, risk context and a control library.',
        'Extend access across all security teams so the foundation is shared, not AppSec-only.'
      ],
      tools:['Data foundation','Inventory integrations','Control library','Business and risk context'],
      metrics:['Priority feeds ingested','Teams onboarded','Repository-to-application mapping accuracy'] },

    { owner:'AppSec', color:'navy2', t:'Enforceable build gates, not opt-in',
      gap:'Approved repositories and pipelines exist but are optional, so there is no enforceable technical gate today and some environments sit outside the program.',
      build:[
        'One governed pipeline with a technical pre-build gate that cannot be bypassed.',
        'Restrict application, code and agent development to approved pathways.',
        'Define pass and fail criteria; blocked builds route into remediation.',
        'Wire the gate to both scan and AI review output.'
      ],
      tools:['CI/CD gate','Approved pipeline and repositories','Policy-as-code','Bypass logging'],
      metrics:['Builds through the gate','Bypasses blocked','Gate pass and fail rate'] },

    { owner:'AppSec', color:'green', t:'Insert built-in AI code review into the pipeline',
      gap:'Scanning is build-driven rather than continuous, so cadence varies by application depending on how often code changes.',
      build:[
        'Formalize AI pre-merge review embedded in the pipeline rather than running alongside it.',
        'Shift build-driven scans toward near real-time detection.',
        'Fold static, dependency, dynamic and constraint-based analysis into one review.',
        'Add an agent layer to validate AI results before promotion.'
      ],
      tools:['AI code review','Static and dependency analysis','Dynamic testing','Graph and constraint solver'],
      metrics:['Pre-merge review coverage','Time to detect','False positive rate'] },

    { owner:'AppSec', color:'green2', t:'Extend red teaming to AI components',
      gap:'Application teams are beginning to ship AI and agent components, and current testing does not cover prompt injection, tool abuse or model misuse.',
      build:[
        'Continuous adversarial testing starting with the external perimeter.',
        'Explicit coverage of AI-specific attack classes for applications with AI components.',
        'An inventory of which applications contain AI or agent components.'
      ],
      tools:['AI red teaming','Rules of engagement','AI component inventory','Safe test environments'],
      metrics:['Coverage of AI-enabled applications','Automated vs expert findings','Time to detect'] },

    { owner:'AppSec + Org', color:'teal', t:'Leverage exposure-based analysis and prove AI efficacy',
      gap:'Findings are prioritized by severity only and remediation varies by team. AI-assisted findings do not flow into the system of record, so AI efficacy cannot be reported.',
      build:[
        'AI-assisted analysis over scan data and the data foundation to prioritize findings.',
        'Structured rules that rank findings and drive remediation.',
        'AI remediation proposals validated by a human before approved action.',
        'A provenance-carrying path for AI findings into the system of record, and a standing organizational dashboard of AI performance per team against thresholds.'
      ],
      tools:['Exposure analysis','Remediation agent','System of record integration','AI performance dashboard'],
      metrics:['Findings ranked by exposure','Time to remediate','Auto-patched vs human','Per team vs thresholds'] }
  ]
}
};

/* Order in which domains appear */
const DOMAIN_ORDER = ['soc', 'vm', 'appsec'];

/* Node kind metadata — drives colour and legend */
const KINDS = {
  process:  { label:'Process',          cls:'k-process'  },
  tool:     { label:'Tool-driven',      cls:'k-tool'     },
  ai:       { label:'AI / agentic',     cls:'k-ai'       },
  decision: { label:'Decision / gate',  cls:'k-decision' },
  sor:      { label:'System of record', cls:'k-sor'      }
};
