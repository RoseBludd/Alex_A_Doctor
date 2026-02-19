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
      "SELECT segment_id, question_id, attempts, correct, streak, notes, last_seen FROM progress WHERE client_id = $1",
      [clientId]
    );
    const progress = {};
    for (const row of res.rows) {
      if (!progress[row.segment_id]) progress[row.segment_id] = {};
      progress[row.segment_id][row.question_id] = {
        attempts: row.attempts,
        correct: row.correct,
        streak: row.streak,
        notes: row.notes || "",
        lastSeen: row.last_seen,
      };
    }
    return Response.json(progress);
  } catch (err) {
    console.error("GET /api/progress", err);
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
  const { clientId: bodyId, segmentId, questionId, attempts, correct, streak, notes, lastSeen } = body;
  const cid = bodyId || clientId;
  if (!cid || !segmentId || !questionId) {
    return Response.json(
      { error: "clientId, segmentId, questionId required" },
      { status: 400 }
    );
  }
  try {
    await query(
      `INSERT INTO progress (client_id, segment_id, question_id, attempts, correct, streak, notes, last_seen)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (client_id, segment_id, question_id)
       DO UPDATE SET attempts = $4, correct = $5, streak = $6, notes = COALESCE($7, progress.notes), last_seen = $8`,
      [cid, segmentId, questionId, attempts ?? 0, correct ?? 0, streak ?? 0, notes ?? "", lastSeen ?? null]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("POST /api/progress", err);
    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
