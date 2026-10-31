# GRC Bench datasheet (v0.1 preview)

## What it measures

Whether an AI system can do common governance, risk and compliance work correctly: apply public law to a situation, find defects in a document, refuse a false premise, state an obligation accurately, and handle operational security and audit situations.

It does not measure a full compliance programme, tool use, long documents, multi-turn work, recent events after the as-of date, languages other than English, or national law beyond what a task states.

## Coverage

60 tasks. Law as of 31 October 2026.

| Framework | Applied | Seeded review | Trap | Fact | Total |
|---|---|---|---|---|---|
| GDPR | 4 | 2 | 2 | 2 | 10 |
| EU AI Act | 3 | 1 | 2 | 1 | 7 |
| Cyber Resilience Act | 2 | 1 | 1 | 1 | 5 |
| NIS 2 | 3 | 1 | 1 | 2 | 7 |
| DORA | 3 | 1 | 1 | 2 | 7 |
| HIPAA | 2 | 1 | 1 | 1 | 5 |
| NIST SP 800-171 Rev. 3 | 2 | 0 | 1 | 1 | 4 |
| ISO 27001 | 10 | 0 | 0 | 0 | 10 |
| SOC 2 | 5 | 0 | 0 | 0 | 5 |

The framework list and counts were chosen by us from what practitioners commonly face and what we could check. They are not a statistical sample of real work.

## How tasks were written

All companies are invented. No customer data or customer wording was used.

Public-law tasks were written by AI agents working from official texts, with no access to ISMS Copilot, its knowledge or past evaluation answers. That separation was set by instruction, not by a technical wall. A model from a second family then checked each key against the source. Quotes were confirmed by machine in saved copies.

ISO 27001 and SOC 2 tasks were written with no standard open, and they contain no control identifiers, mappings or claims about what a standard requires. Every scored step must stand as good practice with the framework's name removed. A second model checked this. The keys are practitioner judgment, reviewed by the vendor by exception. Planned identifier and edition tasks for these two frameworks were left out, because we could not confirm the terms of a permitted free source.

Each task records its authoring, checks and outcome in its `authoring` field.

## Known limits

- Reference answers are provisional. No outside practitioner has reviewed them.
- Authors and checkers are models, so they may share blind spots.
- No calibration: we have no evidence yet that tasks separate strong models from weak ones, nor any measure of judge agreement.
- Criterion counts differ across tasks, so task scores are not equally granular. A task's score is the share of its own criteria passed.
- A small dry run on existing subscriptions looked for confusing tasks. Its answers were not scored or published.
- National implementation can differ from EU directives. Where it matters, the task says so.
- All tasks are public and can be tuned to.

## Versioning

Versions follow `major.minor.patch`. A patch corrects a task, and any correction is listed in `ERRATA.md`. Results from different versions or different judges are not comparable. Law moves, so each version states its as-of date.
