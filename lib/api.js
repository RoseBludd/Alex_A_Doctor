const getBase = () => "";

export async function fetchSections() {
  const res = await fetch(`${getBase()}/api/sections`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchQuestions(segmentId, clientId) {
  const res = await fetch(
    `${getBase()}/api/questions?segmentId=${encodeURIComponent(segmentId)}&clientId=${encodeURIComponent(clientId || "")}`
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchProgress(clientId) {
  const res = await fetch(
    `${getBase()}/api/progress?clientId=${encodeURIComponent(clientId)}`
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchDaily(clientId) {
  const res = await fetch(
    `${getBase()}/api/daily?clientId=${encodeURIComponent(clientId)}`
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveProgress(clientId, segmentId, questionId, stat) {
  const res = await fetch(`${getBase()}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId,
      segmentId,
      questionId,
      attempts: stat.attempts,
      correct: stat.correct,
      streak: stat.streak,
      notes: stat.notes ?? "",
      lastSeen: stat.lastSeen ?? null,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function saveDaily(clientId, day, attempts, correct) {
  const res = await fetch(`${getBase()}/api/daily`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, day, attempts, correct }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function saveCustomQuestions(clientId, segmentId, questions) {
  const res = await fetch(`${getBase()}/api/custom-questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, segmentId, questions }),
  });
  if (!res.ok) throw new Error(await res.text());
}
