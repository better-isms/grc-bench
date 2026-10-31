// Every public-law quote must appear in a saved copy of the official text.
// Usage: node scripts/check-quotes.mjs <tasks-dir> <sources-dir>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const [tasksDir, srcDir] = process.argv.slice(2);
const norm = (s) => s.replace(/\s+/g, " ").toLowerCase();
const corpus = readdirSync(srcDir).filter((f) => f.endsWith(".txt"))
  .map((f) => norm(readFileSync(join(srcDir, f), "utf8"))).join("\n");
let total = 0, missing = 0;
for (const f of readdirSync(tasksDir).filter((x) => x.endsWith(".jsonl"))) {
  for (const l of readFileSync(join(tasksDir, f), "utf8").split("\n").filter(Boolean)) {
    const t = JSON.parse(l);
    for (const s of t.sources) {
      if (!s.quote) continue;
      total++;
      if (!corpus.includes(norm(s.quote))) { missing++; console.log(`MISSING ${t.id}: ${s.quote}`); }
    }
  }
}
console.log(`quotes: ${total}, missing: ${missing}`);
process.exit(missing ? 1 : 0);
