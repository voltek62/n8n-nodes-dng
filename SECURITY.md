# Security Policy

## Scope

This package (`n8n-nodes-dng`) is the **candidate-side** community node pack for the
DraftNGoal exam. It contains:

- Mirror nodes that map DNG Builder blocks to n8n nodes.
- The `DNG Submit Level` node, which posts the candidate canvas to the DraftNGoal
  scoring webhook hosted on n8n cloud.
- Sanitized challenge metadata (description, available nodes, step instructions).

It does **not** contain reference solutions, grading rubrics or any way to influence
the score independently from the official scoring service.

## Reporting a Vulnerability

If you find a way to:

- Recover the reference solution (`ideal_workflow`) of a challenge,
- Score a submission without going through the official scoring webhook,
- Bypass the `X-DNG-Secret` / `X-DNG-Exam-Token` authentication on the webhook,
- Impersonate another candidate from a token you legitimately hold,
- Make the scoring server return a higher score than the rubric allows,

please **do not open a public issue**. Email <security@dng.ai> instead.

We aim to:

- Acknowledge your report within 72 hours.
- Provide a fix or mitigation timeline within 14 days.
- Credit you in the release notes (unless you prefer to remain anonymous).

## Supported Versions

Only the **latest** published `1.x` release is actively supported. Earlier releases
are considered deprecated and will not receive security patches.

## What is **not** in scope

- The local n8n instance the candidate runs themselves (Docker, ports, system
  permissions). Hardening that environment is the candidate's responsibility.
- Bugs in `n8n-workflow` or other upstream dependencies. Please report those to the
  n8n project directly.
- The DraftNGoal website / billing flow. Those are tracked separately at
  <https://dng.ai/security>.
