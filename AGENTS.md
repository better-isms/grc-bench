# Running GRC Bench as an AI agent

You were asked to run GRC Bench on yourself. Follow these steps exactly. The result is an unofficial self-run of a v0.1 preview, not a ranking.

## 0. Get the repository

You need a local copy and Node 22.18 or later: `git clone https://github.com/better-isms/grc-bench && cd grc-bench`. If you cannot run commands, tell the person: they can run the steps below themselves, or use an agent that can.

## 1. Answer without seeing the solutions

- Read only `questions.jsonl`: 60 questions, one JSON object per line (`id` such as `q01`, `as_of`, `prompt`, `documents`).
- Do not open `tasks/`, `provenance.json`, `judge-fixtures/` or `review/` until your answers file is written. They contain the solutions. Opening them first makes the run worthless.
- Answer each `prompt` as you would answer the person, at the length and format you would normally use, using any `documents` included with it. Treat the law as of the `as_of` date.
- Write one line per question to `answers.jsonl` in the repository root (it is git-ignored). You may answer in batches and append; finish all 60 before step 2:
  `{"task": "<question id, for example q01>", "answer": "<your full answer>", "error": ""}`
- Answer all 60. A missing or empty answer scores zero, and the scorer refuses a file with missing or duplicate tasks.

## 2. Get two outside judges

Scoring needs two judge models, both from a different model family than you and than each other, each behind an OpenAI-compatible chat completions endpoint. Ask the person for:

- each judge's endpoint URL and model name;
- confirmation that they set the keys as environment variables `GRCBENCH_JUDGE_A_KEY` and `GRCBENCH_JUDGE_B_KEY`.

Ask the person to set the two key variables in their own shell before you run anything. Never ask for a key in the chat, and never write one into a file, a command line or your reply. Suggest keys with a spend limit. A full run makes 144 judge calls: 24 for the check, 120 for scoring.

## 3. Check the judges, then score

Needs Node 22.18 or later. From the repository root:

```bash
node src/cli.ts judge-check --tasks tasks --max-calls 24 \
  --judge-a-endpoint <url> --judge-a-model <model> \
  --judge-b-endpoint <url> --judge-b-model <model>

node src/cli.ts score --answers answers.jsonl --out score.json --max-calls 120 \
  --judge-a-endpoint <url> --judge-a-model <model> \
  --judge-b-endpoint <url> --judge-b-model <model>
```

`judge-check` and `score` read `tasks/` to give the judges the solutions; that is expected and only happens after your answers are written. If `judge-check` fails, say so in your report: a judge that passes planted wrong answers cannot be trusted.

## 4. Report

Tell the person, from `score.json`:

- the mean criterion pass rate and the critical-failure rate;
- both by framework;
- every failed criterion (each verdict in `results` has its `text`, `critical` flag and `pass`), grouped by task, with critical ones marked first. That is where you lost points.

Label it: "Unofficial self-run, GRC Bench v0.1 preview, judges <A> and <B>. Not comparable with runs using other judges or versions." Do not call it a ranking.
