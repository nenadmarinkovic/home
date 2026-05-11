import type { LinkType } from "@/db/schema";

const TRACKING_PARAM_PREFIXES = ["utm_", "fbclid", "gclid", "mc_cid", "mc_eid"];

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  try {
    const u = new URL(trimmed);
    for (const key of [...u.searchParams.keys()]) {
      if (TRACKING_PARAM_PREFIXES.some((p) => key.toLowerCase().startsWith(p))) {
        u.searchParams.delete(key);
      }
    }
    u.hash = "";
    return u.toString();
  } catch {
    return trimmed;
  }
}

export function deriveType(url: string): LinkType {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host.endsWith("youtube.com") || host === "youtu.be") return "video";
    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) return "video";
    if (host === "twitter.com" || host === "x.com" || host === "bsky.app")
      return "social";
    if (host.endsWith("substack.com")) return "article";
    return "article";
  } catch {
    return "article";
  }
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
