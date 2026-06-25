const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    // Surface the server-provided message so callers can toast something useful.
    // Routes may return JSON ({ error }) or plain text — handle both.
    let message = `API error ${res.status}`;
    const text = await res.text().catch(() => "");
    if (text) {
      try {
        const data = JSON.parse(text);
        message = data?.error || data?.message || text;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }

  return res.json();
}

/**
 * Like apiFetch but returns the raw Response for streaming endpoints (read
 * `res.body` / response headers yourself). Throws on non-OK with a useful message.
 */
export async function apiStream(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    const text = await res.text().catch(() => "");
    if (text) {
      try {
        const data = JSON.parse(text);
        message = data?.error || data?.message || text;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }

  return res;
}
