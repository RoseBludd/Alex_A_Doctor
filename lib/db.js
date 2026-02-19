const { Pool } = require("pg");

const isProd = process.env.NODE_ENV === "production";

const pool =
  process.env.DATABASE_URL &&
  (() => {
    let connectionString = process.env.DATABASE_URL;
    if (connectionString && connectionString.includes("sslmode=require")) {
      connectionString = connectionString.replace("sslmode=require", "sslmode=verify-full");
    }
    const poolConfig = {
      connectionString,
      ssl: connectionString?.startsWith("postgres://")
        ? undefined
        : { rejectUnauthorized: false },
    };
    if (isProd) {
      poolConfig.max = 10;
      poolConfig.idleTimeoutMillis = 30000;
    } else {
      poolConfig.max = 1;
    }
    return new Pool(poolConfig);
  })();

async function query(text, params) {
  if (!pool) {
    const err = new Error("DATABASE_URL is not set");
    err.code = "NO_DATABASE";
    throw err;
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === "development" && duration > 50) {
    console.log("db query", { text: text.slice(0, 60), duration, rows: res.rowCount });
  }
  return res;
}

module.exports = { query, pool };
