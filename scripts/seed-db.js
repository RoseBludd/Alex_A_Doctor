const path = require("path");
const { pool } = require("../lib/db");

const SECTIONS = [
  { id: "chem_phys", label: "Chem & Physics", color: "#f97316", icon: "⚗️", segments: [
    { id: "gen_chem", label: "General Chemistry", color: "#f97316", icon: "🧪" },
    { id: "org_chem", label: "Organic Chemistry", color: "#fb923c", icon: "🔗" },
    { id: "physics", label: "Physics & Math", color: "#fbbf24", icon: "⚡" },
    { id: "biochem", label: "Biochemistry", color: "#f59e0b", icon: "🧬" },
  ]},
  { id: "cars", label: "CARS", color: "#8b5cf6", icon: "📖", segments: [
    { id: "cars_comp", label: "Passage Comprehension", color: "#8b5cf6", icon: "📖" },
    { id: "cars_arg", label: "Argument & Reasoning", color: "#a78bfa", icon: "💡" },
  ]},
  { id: "bio_biochem", label: "Biology & Biochemistry", color: "#22c55e", icon: "🧫", segments: [
    { id: "mol_bio", label: "Molecular Bio & Genetics", color: "#22c55e", icon: "🧬" },
    { id: "cell_bio", label: "Cell Biology", color: "#16a34a", icon: "🦠" },
    { id: "organ_sys", label: "Organ Systems", color: "#4ade80", icon: "🫀" },
  ]},
  { id: "psych_soc", label: "Psych & Sociology", color: "#3b82f6", icon: "🧠", segments: [
    { id: "behavior", label: "Behavioral Psychology", color: "#3b82f6", icon: "🧠" },
    { id: "cognition", label: "Cognition & Perception", color: "#60a5fa", icon: "👁️" },
    { id: "sociology", label: "Sociology & Society", color: "#818cf8", icon: "👥" },
    { id: "research", label: "Research & Statistics", color: "#6366f1", icon: "📊" },
  ]},
];

async function loadSeed() {
  const dataPath = path.join(__dirname, "seed-questions.json");
  const fs = require("fs");
  if (!fs.existsSync(dataPath)) {
    console.error("Run: node scripts/extract-seed-json.js first to create seed-questions.json from demo.js");
    process.exit(1);
  }
  return require(dataPath);
}

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  const SEED = await loadSeed();
  const client = await pool.connect();
  try {
    let so = 0;
    for (const sec of SECTIONS) {
      await client.query(
        "INSERT INTO sections (id, label, color, icon, sort_order) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING",
        [sec.id, sec.label, sec.color, sec.icon, so++]
      );
      let segOrder = 0;
      for (const seg of sec.segments) {
        await client.query(
          "INSERT INTO segments (id, section_id, label, color, icon, sort_order) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING",
          [seg.id, sec.id, seg.label, seg.color, seg.icon, segOrder++]
        );
      }
    }
    for (const [segId, questions] of Object.entries(SEED)) {
      if (!Array.isArray(questions)) continue;
      for (const q of questions) {
        await client.query(
          "INSERT INTO questions (id, segment_id, q, opts, ans, exp, is_custom) VALUES ($1,$2,$3,$4,$5,$6,FALSE) ON CONFLICT (id) DO NOTHING",
          [q.id, segId, q.q, JSON.stringify(q.opts), q.ans, q.exp]
        );
      }
    }
    console.log("Seed data inserted.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
