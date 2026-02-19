const { query } = require("../../../lib/db");

function getClientId(request) {
  const { searchParams } = new URL(request.url);
  return searchParams.get("clientId") || request.headers.get("x-client-id") || "";
}

export async function GET(request) {
  const clientId = getClientId(request);
  if (!clientId) {
    return Response.json({ error: "clientId required" }, { status: 400 });
  }
  try {
    const res = await query(
      "SELECT day, attempts, correct FROM daily WHERE client_id = $1 ORDER BY day",
      [clientId]
    );
    const daily = {};
    for (const row of res.rows) {
      daily[row.day] = { attempts: row.attempts, correct: row.correct };
    }
    return Response.json(daily);
  } catch (err) {
    console.error("GET /api/daily", err);
    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const clientId = getClientId(request);
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { clientId: bodyId, day, attempts, correct } = body;
  const cid = bodyId || clientId;
  if (!cid || !day) {
    return Response.json(
      { error: "clientId and day required" },
      { status: 400 }
    );
  }
  try {
    await query(
      `INSERT INTO daily (client_id, day, attempts, correct)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (client_id, day)
       DO UPDATE SET attempts = daily.attempts + EXCLUDED.attempts, correct = daily.correct + EXCLUDED.correct`,
      [cid, day, attempts ?? 0, correct ?? 0]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("POST /api/daily", err);
    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
