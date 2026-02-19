const fs = require("fs");
const path = require("path");
const { pool } = require("../lib/db");

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Set it in .env or environment.");
    process.exit(1);
  }
  const sqlPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  try {
    await pool.query(sql);
    console.log("Schema applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
