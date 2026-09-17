import type { AppConfig, EpicOverlay, EpicsResponse } from "./types";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function getConfig(): Promise<AppConfig> {
  return fetch("/api/config").then((r) => handle<AppConfig>(r));
}

export function getEpics(quarter: number, year: number): Promise<EpicsResponse> {
  const params = new URLSearchParams({
    quarter: String(quarter),
    year: String(year),
  });
  return fetch(`/api/epics?${params}`).then((r) => handle<EpicsResponse>(r));
}

export function saveOverlay(
  epicKey: string,
  patch: Partial<EpicOverlay>,
): Promise<EpicOverlay> {
  return fetch(`/api/overlay/${encodeURIComponent(epicKey)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).then((r) => handle<EpicOverlay>(r));
}
