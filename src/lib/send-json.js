// Client-side fetch wrapper. Never throws: a network failure comes back as status 0.
export async function sendJson(url, method, payload) {
  try {
    const res = await fetch(url, {
      method,
      headers: payload ? { "Content-Type": "application/json" } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const body = res.status === 204 ? null : await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0, body: null };
  }
}

export function describeFailure({ status, body }) {
  if (status === 0) return "Couldn't reach the server. Check your connection and try again.";
  return body?.error ?? "Something went wrong. Try again.";
}
