const { query } = require("../../../lib/db");

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { clientId, segmentId, questions: qs } = body;
  if (!clientId || !segmentId || !Array.isArray(qs) || qs.length === 0) {
    return Response.json(
      { error: "clientId, segmentId, and questions array required" },
      { status: 400 }
    );
  }
  try {
    for (const q of qs) {
      const id = q.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await query(
        `INSERT INTO questions (id, segment_id, q, opts, ans, exp, is_custom, client_id)
         VALUES ($1,$2,$3,$4,$5,$6,TRUE,$7)
         ON CONFLICT (id) DO NOTHING`,
        [id, segmentId, q.q, JSON.stringify(q.opts || []), q.ans ?? 0, q.exp || "", clientId]
      );
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("POST /api/custom-questions", err);
    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
