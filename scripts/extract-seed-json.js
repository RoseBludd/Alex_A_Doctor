const fs = require("fs");
const path = require("path");
const demoPath = path.join(__dirname, "..", "demo.js");
let content = fs.readFileSync(demoPath, "utf8");
const start = content.indexOf("const SEED = {");
if (start === -1) {
  console.error("SEED not found in demo.js");
  process.exit(1);
}
let end = start + "const SEED = ".length;
let depth = 0;
let started = false;
for (let i = end; i < content.length; i++) {
  const c = content[i];
  if (c === "{") { depth++; started = true; }
  else if (c === "}") { depth--; if (started && depth === 0) { end = i + 1; break; } }
}
const raw = content.substring(content.indexOf("{", start), end);
let data;
try {
  const fn = new Function("return " + raw);
  data = fn();
} catch (e) {
  console.error("Extract error:", e.message);
  process.exit(1);
}
fs.writeFileSync(path.join(__dirname, "seed-questions.json"), JSON.stringify(data, null, 0));
console.log("Wrote scripts/seed-questions.json");
process.exit(0);
