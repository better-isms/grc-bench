# GRC Bench method (v0.1 preview)

## Why it exists

To test AI on the work compliance practitioners do, in the open. We built it first to assess the models we consider for our own product. We publish it so the test can be inspected, criticised and reused by others.

## Conflict of interest

Better ISMS sells ISMS Copilot, an AI product for this work. It will be an entry. We wrote this benchmark, so read it with that in mind.

## What we commit to

1. Tasks, reference answers, scoring rules, judge prompts and scorer are public.
2. Our product is tested only through its public API, like any other entry.
3. We do not tune framework knowledge on benchmark tasks. This is a contributor rule, not a technical wall.
4. Every official round is pre-registered and publishes every entry, including ours when we lose.
5. We also use GRC Bench privately to choose our own models. Those runs are not official scores and we never quote them publicly.
6. Every correction goes in `ERRATA.md`, with a new version. Scores never compare across versions.

## Tasks

Four types, weighted towards doing the work:

- **Applied work**: a situation at a fictional company. Scored on the steps, decisions and evidence that matter.
- **Seeded review**: a fictional document with planted defects and clean decoys. False alarms cost points.
- **Traps**: a false premise, a fake control or superseded numbering. Passing means correcting it.
- **Facts**: scope, deadlines and obligations.

## Scoring

Each task has binary criteria. A task score is the share passed.

Critical failures, such as wrong law, a wrong deadline, an invented provision or unsafe advice, are reported as their own rate. They are never netted against quality. There is no single overall number.

Two judges from different model families decide every criterion, and both must pass it. A literal check on a criterion can fail it but never pass it. Disagreements are reported. An invalid judge reply stops the run, and a missing answer scores zero. Judges read answers as untrusted data, and `judge-fixtures/` holds wrong answers and injection attempts each judge should fail. This reduces manipulation but does not remove it.

## How public law differs from ISO and SOC 2

For public law, every reference answer cites the official text with a short quote. A machine check finds each quote in a saved copy of the source it cites, and those copies are in `sources/`.

ISO and AICPA material is copyrighted, and agents do not read it. So ISO 27001 and SOC 2 tasks never ask what a control says. They use fictional situations scored on practice in our own words. Every scored step must still hold if the framework's name is removed from the prompt. Those answer keys are practitioner judgment, and they are labelled so.

## Open tasks

All v0.1 tasks are public, so anyone, including us, can tune to them. Public task scores alone are never a ranking.

Official rounds will add a sealed task set, written apart from the ISMS Copilot team, with its hash published in advance. Each entry's model, prompts, routing, tools and configuration are registered before anyone responsible for model selection can reach sealed tasks or results. If sealed exposure is used to change an entry, that attempt is published and the set is replaced.

## What comes before v1.0

- A calibrated scored round showing the tasks separate strong and weak models.
- Named, pinned judges with measured agreement.
- Expert review of every reference answer and an independent practitioner sample.
- About 120 tasks and a sealed set.

## Report a problem

Open an issue citing the task id and the official source. Outside pull requests are read line by line. At v0.1 we accept no change to dependencies, install scripts or workflows.
