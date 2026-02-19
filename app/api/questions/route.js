const { query } = require("../../../lib/db");

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const segmentId = searchParams.get("segmentId");
  const clientId = searchParams.get("clientId") || "";
  if (!segmentId) {
    return Response.json(
      { error: "segmentId required" },
      { status: 400 }
    );
  }
  try {
    const res = await query(
      `SELECT id, segment_id, q, opts, ans, exp, is_custom
       FROM questions
       WHERE segment_id = $1 AND (is_custom = FALSE OR (is_custom = TRUE AND client_id = $2))
       ORDER BY is_custom, id`,
      [segmentId, clientId]
    );
    const questions = res.rows.map((r) => ({
      id: r.id,
      q: r.q,
      opts: r.opts,
      ans: r.ans,
      exp: r.exp,
    }));
    return Response.json(questions);
  } catch (err) {
    console.error("GET /api/questions", err);
    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
