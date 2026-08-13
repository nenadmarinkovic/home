export const PREVIEW_KEY = "preview:article";
export const PREVIEW_CHANNEL = "article-preview";
export const PREVIEW_WINDOW = "article-preview";

export type PreviewPayload = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  body: string;
  draft: boolean;
};

function isPayload(value: unknown): value is PreviewPayload {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.slug === "string" &&
    typeof p.title === "string" &&
    typeof p.subtitle === "string" &&
    typeof p.date === "string" &&
    typeof p.body === "string" &&
    (typeof p.draft === "boolean" || p.draft === undefined)
  );
}

export function readPreview(): string | null {
  try {
    return window.localStorage.getItem(PREVIEW_KEY);
  } catch {
    return null;
  }
}

export function parsePreview(raw: string | null): PreviewPayload | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writePreview(payload: PreviewPayload): void {
  try {
    window.localStorage.setItem(PREVIEW_KEY, JSON.stringify(payload));
  } catch {}
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(PREVIEW_CHANNEL);
  channel.postMessage(payload);
  channel.close();
}

export function subscribePreview(onChange: () => void): () => void {
  const channel =
    typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(PREVIEW_CHANNEL);
  if (channel) channel.onmessage = () => onChange();
  window.addEventListener("storage", onChange);
  return () => {
    channel?.close();
    window.removeEventListener("storage", onChange);
  };
}
