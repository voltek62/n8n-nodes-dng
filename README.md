# n8n-nodes-dng

[![CI](https://github.com/voltek62/n8n-nodes-dng/actions/workflows/ci.yml/badge.svg)](https://github.com/voltek62/n8n-nodes-dng/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/n8n-nodes-dng.svg)](https://www.npmjs.com/package/n8n-nodes-dng)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official **n8n community node pack** for the [DraftNGoal](https://dng.ai)
exam. Install it in your own n8n, build a workflow on the canvas, and submit it
to the official scoring webhook hosted on the DraftNGoal n8n cloud — your score
and detailed feedback come back as the node's output.

The pack ships:

- **41 mirror nodes** that map DNG Builder blocks to native‑looking n8n nodes
  (`Text`, `LLM`, `Output`, `Agent`, `HTTP Request`, …).
- **DNG Submit Level** — the only node that talks to the cloud. It packages
  your canvas as DNG JSON, signs the request with your shared secret + personal
  exam token, and posts it to the scoring webhook.
- A **sanitized challenge catalogue** ([`nodes-dng/challenges/`](nodes-dng/challenges/)):
  description, available nodes, time limit, sanitized step blueprint. The
  reference solutions and grading rubrics are **never shipped** with this
  package.

## Quick start (Docker)

```bash
git clone https://github.com/voltek62/n8n-nodes-dng.git
cd n8n-nodes-dng

# 1. Build the community node pack (41 mirrors + DNG Submit Level)
(cd nodes-dng && npm install && npm run build)

# 2. Boot a local n8n that auto-loads the pack
docker compose up -d

# 3. Open n8n and finish the owner setup
open http://localhost:5678
```

## Wire your candidate workflow

1. In n8n → **Credentials** → **+ New** → search **DNG Scoring Webhook**, then fill:
   - **Webhook URL**: keep the default `https://draftngoal.app.n8n.cloud/webhook/dng-score`.
   - **Shared secret**: cohort secret — sent to you by email after you sign up at <https://dng.ai>.
   - **Exam token (per candidate)**: personal token — also sent by email.
2. Create a workflow:

   ```
   Manual Trigger
       └── DNG mirror nodes (e.g. Text → LLM → Output)
              └── DNG Submit Level
   ```

3. In **DNG Submit Level**, pick a challenge from the dropdown, fill your name
   and email, then **Execute workflow**.
4. The node returns the JSON response from the cloud:

   ```json
   {
     "ok": true,
     "audit_id": "…",
     "challenge_id": "summarization-pipeline",
     "overall_score": 92.5,
     "passed": true,
     "criteria_scores": [ … ],
     "step_results": [ … ],
     "grading_decisions": [ … ]
   }
   ```

   The same payload is also emailed to DraftNGoal admins for audit.

## Available challenges

The candidate-facing catalogue is in [`nodes-dng/challenges/index.json`](nodes-dng/challenges/index.json).
Browse the per-challenge description and step blueprint in
[`nodes-dng/challenges/<id>.json`](nodes-dng/challenges/) — the reference
solution is **not** in those files. It lives only on the DraftNGoal cloud.

| id | difficulty | duration |
|----|------------|---------:|
| `summarization-pipeline` | Easy | 10 min |
| `web-content-extraction` | Easy | 12 min |
| `sentiment-routing` | Intermediate | 15 min |
| `csv-enrichment` | Intermediate | 15 min |
| `web-research-augmented` | Intermediate | 15 min |
| `competitive-intelligence-agent` | Advanced | 20 min |
| `url-enrichment-loop` | Advanced | 20 min |
| `wordpress-publishing-pipeline` | Advanced | 20 min |
| `qa-human-validation` | Expert | 25 min |
| `full-seo-audit` | Expert | 30 min |

## Install via the n8n Community Nodes UI (alternative)

If you run n8n cloud or a self-hosted n8n that allows community nodes:

1. **Settings → Community nodes → Install** → enter `n8n-nodes-dng`.
2. Confirm the install. Mirror nodes and **DNG Submit Level** appear in the
   node panel.
3. Configure the **DNG Scoring Webhook** credential (same fields as above).

## Repository layout

```
.
├── nodes-dng/             # the published npm package (n8n-nodes-dng)
│   ├── nodes/             # DNG Submit Level + 41 mirror nodes
│   ├── credentials/       # DNG Scoring Webhook credential type
│   ├── challenges/        # sanitized public catalogue (no answers)
│   ├── source/            # canonical DNG node definitions
│   └── scripts/           # mirror generator + challenge sanitizer
├── docker-compose.yml     # local n8n for candidates
├── .github/               # CI, release, dependabot, issue templates
├── LICENSE                # MIT
├── SECURITY.md
└── CODE_OF_CONDUCT.md
```

The `server/` directory used by the maintainer (full challenges + scoring
workflow + auth wrapper) is **gitignored** and never published. Only DraftNGoal
operates that side, on n8n cloud at <https://draftngoal.app.n8n.cloud>.

## Build & test the pack locally (contributors)

```bash
cd nodes-dng
npm install
npm run build      # generate mirrors + sanitize challenges + tsc
npm run lint       # type-check
npm pack --dry-run # see what gets shipped to npm
```

## Support

- General questions / billing / score appeals: <support@dng.ai>.
- Public bugs and feature requests: GitHub issues here.
- Security: see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Vincent Terrasi / DraftNGoal.
