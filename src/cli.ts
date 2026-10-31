#!/usr/bin/env node
// grc-bench CLI: validate, run, score, compare. Node built-ins only.
import { readFileSync, writeFileSync, appendFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  type Task, type TaskResult, validateSet, coverage, aggregate, summarize, compare, judgePrompt, parseJudge,
} from "./lib.ts";

const MAX_RESPONSE_BYTES = 2_000_000;

export function loadTasks(dir: string): Task[] {
  return readdirSync(dir).filter((f) => f.endsWith(".jsonl")).sort().flatMap((f) =>
    readFileSync(join(dir, f), "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l) as Task));
}

export function checkEndpoint(url: string, allowLocal: boolean): string {
  const u = new URL(url);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  if (u.protocol === "https:") return u.origin + u.pathname.replace(/\/$/, "");
  if (u.protocol === "http:" && local && allowLocal) return u.origin + u.pathname.replace(/\/$/, "");
  throw new Error("endpoint must be https; use --allow-local for a local address");
}

export interface Endpoint { url: string; model: string; key: string; timeoutMs: number; }

export async function chat(ep: Endpoint, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(`${ep.url}/chat/completions`, {
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(ep.timeoutMs),
    headers: { "content-type": "application/json", authorization: `Bearer ${ep.key}` },
    body: JSON.stringify({ model: ep.model, messages, stream: false }),
  });
  const body = await res.text();
  if (body.length > MAX_RESPONSE_BYTES) throw new Error("response too large");
  if (!res.ok) throw new Error(`endpoint returned ${res.status}`);
  const j = JSON.parse(body) as { choices?: { message?: { content?: string } }[] };
  const text = j.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text) throw new Error("empty answer");
  return text;
}

function args(argv: string[]) {
  const o: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const n = argv[i + 1];
    if (n === undefined || n.startsWith("--")) o[a.slice(2)] = true;
    else { o[a.slice(2)] = n; i++; }
  }
  return o;
}

function must(o: Record<string, string | boolean>, k: string): string {
  const v = o[k];
  if (typeof v !== "string") throw new Error(`missing --${k}`);
  return v;
}

function envKey(name: string): string {
  const k = process.env[name];
  if (!k) throw new Error(`set ${name}`);
  return k;
}

function ep(o: Record<string, string | boolean>, prefix: string, keyVar: string): Endpoint {
  return {
    url: checkEndpoint(must(o, `${prefix}endpoint`), o["allow-local"] === true),
    model: must(o, `${prefix}model`), key: envKey(keyVar),
    timeoutMs: Number(o["timeout-ms"] ?? 180000),
  };
}

function capCheck(calls: number, o: Record<string, string | boolean>) {
  const cap = Number(o["max-calls"] ?? 0);
  console.log(`planned calls: ${calls}`);
  if (!cap || calls > cap) throw new Error(`pass --max-calls of at least ${calls} to confirm`);
}

const SYSTEM = "You are assisting a governance, risk and compliance practitioner. Answer the task directly.";

export async function runCmd(o: Record<string, string | boolean>) {
  const tasks = loadTasks(String(o.tasks ?? "tasks"));
  capCheck(tasks.length, o);
  const e = ep(o, "", "GRCBENCH_API_KEY");
  const out = must(o, "out");
  writeFileSync(out, "");
  for (const t of tasks) {
    const docs = t.documents.map((d) => `[${d.name}]\n${d.content}`).join("\n\n");
    const user = docs ? `${t.prompt}\n\nDOCUMENTS:\n${docs}` : t.prompt;
    let answer = "", error = "";
    try { answer = await chat(e, [{ role: "system", content: SYSTEM }, { role: "user", content: user }]); }
    catch (x) { error = (x as Error).message; }
    appendFileSync(out, JSON.stringify({ task: t.id, model: e.model, answer, error }) + "\n");
    console.log(`${t.id} ${error || "ok"}`);
  }
}

export async function scoreCmd(o: Record<string, string | boolean>) {
  const tasks = new Map(loadTasks(String(o.tasks ?? "tasks")).map((t) => [t.id, t]));
  const rows = readFileSync(must(o, "answers"), "utf8").split("\n").filter(Boolean)
    .map((l) => JSON.parse(l) as { task: string; answer: string; error: string });
  capCheck(rows.length * 2, o);
  const judges = [ep(o, "judge-a-", "GRCBENCH_JUDGE_A_KEY"), ep(o, "judge-b-", "GRCBENCH_JUDGE_B_KEY")];
  const results: TaskResult[] = [];
  const failures: string[] = [];
  for (const r of rows) {
    const t = tasks.get(r.task);
    if (!t) { failures.push(`${r.task}: unknown task`); continue; }
    const p = judgePrompt(t, r.answer ?? "");
    const votes: Record<string, boolean>[] = [];
    if (p.ids.length && r.answer) {
      for (const j of judges) {
        const text = await chat(j, [{ role: "system", content: p.system }, { role: "user", content: p.user }]);
        const v = parseJudge(text, p.ids);
        if (v) votes.push(v); else failures.push(`${r.task}: judge ${j.model} returned invalid output`);
      }
    }
    results.push(aggregate(t, r.answer ?? "", votes));
  }
  writeFileSync(must(o, "out"), JSON.stringify({
    label: "unofficial run", judges: judges.map((j) => j.model), failures, summary: summarize(results), results,
  }, null, 2));
  console.log(JSON.stringify(summarize(results), null, 2));
  if (failures.length) console.log(`judge failures: ${failures.length}, see output file`);
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const o = args(rest);
  if (cmd === "validate") {
    const tasks = loadTasks(String(o.tasks ?? "tasks"));
    const errs = validateSet(tasks);
    console.log(`tasks: ${tasks.length}`);
    console.log(JSON.stringify(coverage(tasks), null, 2));
    errs.forEach((e) => console.error(e));
    process.exit(errs.length ? 1 : 0);
  }
  if (cmd === "run") return runCmd(o);
  if (cmd === "score") return scoreCmd(o);
  if (cmd === "compare") {
    const read = (k: string) => (JSON.parse(readFileSync(must(o, k), "utf8")) as { results: TaskResult[] }).results;
    console.log(JSON.stringify(compare(read("current"), read("candidate")), null, 2));
    return;
  }
  console.log("usage: cli.ts validate|run|score|compare (see README)");
  process.exit(2);
}

if (process.argv[1]?.endsWith("cli.ts")) {
  main().catch((e) => { console.error((e as Error).message); process.exit(1); });
}
