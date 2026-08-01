const NAME = /^[a-z][a-z0-9-]{0,31}$/;

export function embedApps(): Map<string, string> {
  const apps = new Map<string, string>();
  for (const entry of (process.env.EMBED_APPS ?? "").split(",")) {
    const at = entry.indexOf("=");
    if (at < 1) continue;
    const name = entry.slice(0, at).trim().toLowerCase();
    if (!NAME.test(name)) continue;
    try {
      const url = new URL(entry.slice(at + 1).trim());
      if (url.protocol === "http:" || url.protocol === "https:") {
        apps.set(name, url.origin);
      }
    } catch {
      continue;
    }
  }
  return apps;
}

export function embedOrigins(): string[] {
  return [...new Set(embedApps().values())];
}
