// Each quote must appear in the saved copy of the source it cites.
// Usage: node scripts/check-quotes.mjs
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const norm = (s) => s.replace(/\s+/g, " ").toLowerCase();
const manifest = JSON.parse(readFileSync("sources/MANIFEST.json", "utf8"));
const text = new Map();
let bad = 0, total = 0;
for (const [url, { file, sha256 }] of Object.entries(manifest)) {
  const raw = readFileSync(join("sources", file));
  if (createHash("sha256").update(raw).digest("hex") !== sha256) { bad++; console.log(`HASH ${file}`); }
  text.set(url, norm(raw.toString("utf8")));
}
for (const f of readdirSync("tasks").filter((x) => x.endsWith(".jsonl"))) {
  for (const l of readFileSync(join("tasks", f), "utf8").split("\n").filter(Boolean)) {
    const t = JSON.parse(l);
    for (const s of t.sources) {
      if (!s.quote) continue;
      total++;
      const src = text.get(s.url);
      if (!src) { bad++; console.log(`NO SNAPSHOT ${t.id}: ${s.url}`); }
      else if (!src.includes(norm(s.quote))) { bad++; console.log(`MISSING ${t.id}: ${s.quote}`); }
    }
  }
}
console.log(`quotes: ${total}, problems: ${bad}`);
process.exit(bad ? 1 : 0);
