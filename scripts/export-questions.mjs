// Writes questions.jsonl: every task as the tested model sees it in an API run
// (prompt, documents, as-of date), under a neutral id (q01 to q60) in a fixed
// shuffled order, so ids and order reveal nothing about framework or task type.
// tasks/question-map.json maps each neutral id back to its task for scoring.
// Usage: node scripts/export-questions.mjs [--check]
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const rows = readdirSync("tasks").filter((f) => f.endsWith(".jsonl")).sort().flatMap((f) =>
  readFileSync(join("tasks", f), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)));
const order = [...rows].sort((a, b) => {
  const h = (t) => createHash("sha256").update(`grc-bench-v0.1:${t.id}`).digest("hex");
  return h(a) < h(b) ? -1 : 1;
});
const map = {};
const lines = order.map((t, i) => {
  const qid = `q${String(i + 1).padStart(2, "0")}`;
  map[qid] = t.id;
  return JSON.stringify({ id: qid, as_of: t.as_of, prompt: t.prompt, documents: t.documents });
});
const out = lines.join("\n") + "\n";
const mapOut = JSON.stringify(map, null, 1) + "\n";
if (process.argv.includes("--check")) {
  const ok = readFileSync("questions.jsonl", "utf8") === out && readFileSync("tasks/question-map.json", "utf8") === mapOut;
  if (!ok) { console.error("questions.jsonl or tasks/question-map.json is stale: run node scripts/export-questions.mjs"); process.exit(1); }
  console.log("questions up to date");
} else {
  writeFileSync("questions.jsonl", out);
  writeFileSync("tasks/question-map.json", mapOut);
  console.log(`questions: ${rows.length}`);
}
