/**
 * Fetch-based SSE consumer.
 *
 * The standard EventSource API can't carry an Authorization header,
 * which we need to talk to /api/ask under the in-memory access token.
 * This wraps fetch + ReadableStream and parses SSE event/data pairs.
 */

export type SSEEvent = { event: string; data: unknown };

type AskFetcher = (path: string, opts?: RequestInit & { auth?: boolean }) => Promise<Response>;

export async function* sseStream(
  fetcher: AskFetcher,
  path: string,
  init: RequestInit & { signal?: AbortSignal } = {}
): AsyncGenerator<SSEEvent> {
  const res = await fetcher(path, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Accept: "text/event-stream",
    },
  });
  if (!res.ok || !res.body) {
    throw new Error(`SSE request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      // SSE messages are separated by "\n\n".
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const raw = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const parsed = parseEvent(raw);
        if (parsed) yield parsed;
      }
    }
    if (buffer.trim()) {
      const parsed = parseEvent(buffer);
      if (parsed) yield parsed;
    }
  } finally {
    reader.releaseLock();
  }
}

function parseEvent(raw: string): SSEEvent | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of raw.split("\n")) {
    if (!line) continue;
    if (line.startsWith(":")) continue; // comment
    const idx = line.indexOf(":");
    const field = idx === -1 ? line : line.slice(0, idx);
    const value = idx === -1 ? "" : line.slice(idx + 1).replace(/^ /, "");
    if (field === "event") event = value;
    else if (field === "data") dataLines.push(value);
  }
  if (dataLines.length === 0) return null;
  const dataStr = dataLines.join("\n");
  try {
    return { event, data: JSON.parse(dataStr) };
  } catch {
    return { event, data: dataStr };
  }
}
