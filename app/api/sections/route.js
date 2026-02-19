const { query } = require("../../../lib/db");

export async function GET() {
  try {
    const sectionsRes = await query(
      "SELECT id, label, color, icon, sort_order FROM sections ORDER BY sort_order"
    );
    const segmentsRes = await query(
      "SELECT id, section_id, label, color, icon, sort_order FROM segments ORDER BY section_id, sort_order"
    );
    const bySection = {};
    for (const row of sectionsRes.rows) {
      bySection[row.id] = {
        id: row.id,
        label: row.label,
        color: row.color,
        icon: row.icon,
        segments: [],
      };
    }
    for (const row of segmentsRes.rows) {
      if (bySection[row.section_id]) {
        bySection[row.section_id].segments.push({
          id: row.id,
          label: row.label,
          color: row.color,
          icon: row.icon,
        });
      }
    }
    const sections = sectionsRes.rows.map((r) => bySection[r.id]);
    return Response.json(sections);
  } catch (err) {
    console.error("GET /api/sections", err);
    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
