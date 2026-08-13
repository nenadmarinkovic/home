import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_CHARS = 16_000;
const MAX_TITLE = 300;
const FETCH_TIMEOUT_MS = 12_000;
const TITLE_TIMEOUT_MS = 6_000;
const MAX_REDIRECTS = 5;

function ipv4IsPrivate(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255))
    return true;
  const [a, b] = p;
  if (a === 0 || a === 10 || a === 127) return true; // this-host, private, loopback
  if (a === 169 && b === 254) return true; // link-local (incl. metadata)
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function ipIsPrivate(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return ipv4IsPrivate(ip);
  if (kind === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true; // loopback / unspecified
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return ipv4IsPrivate(mapped[1]);
    if (lower.startsWith("fe8") || lower.startsWith("fe9")) return true; // link-local
    if (lower.startsWith("fea") || lower.startsWith("feb")) return true; // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique-local
    return false;
  }
  return true; // not a parseable IP → unsafe
}

async function assertPublicHost(hostname: string): Promise<void> {
  let records: { address: string }[];
  try {
    records = await lookup(hostname, { all: true });
  } catch {
    throw new Error("Could not resolve host");
  }
  if (records.length === 0 || records.some((r) => ipIsPrivate(r.address))) {
    throw new Error("Refusing to fetch a private or non-public address");
  }
}

const ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&hellip;": "…",
  "&mdash;": "—",
  "&ndash;": "–",
  "&laquo;": "«",
  "&raquo;": "»",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&ldquo;": "“",
  "&rdquo;": "”",
};

function decodeEntities(input: string): string {
  let out = input;
  for (const [k, v] of Object.entries(ENTITY_MAP)) {
    out = out.split(k).join(v);
  }
  out = out.replace(/&#(\d+);/g, (_, dec: string) =>
    String.fromCodePoint(Number(dec)),
  );
  out = out.replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
    String.fromCodePoint(parseInt(hex, 16)),
  );
  return out;
}

function extractText(html: string): string {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ");

  const articleMatch = cleaned.match(/<(article|main)[^>]*>([\s\S]*?)<\/\1>/i);
  if (articleMatch) cleaned = articleMatch[2];

  const text = decodeEntities(cleaned.replace(/<[^>]+>/g, " "));
  return text.replace(/\s+/g, " ").trim();
}

async function fetchHtml(url: string, timeoutMs: number): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http(s) URLs are supported");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let current = parsed;
    for (let hop = 0; ; hop++) {
      await assertPublicHost(current.hostname);
      const res = await fetch(current.toString(), {
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; nenad-links-saver/1.0; +https://github.com)",
          accept: "text/html,application/xhtml+xml",
          "accept-language": "en,*",
        },
        redirect: "manual",
        signal: controller.signal,
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) throw new Error("Redirect without a location");
        if (hop >= MAX_REDIRECTS) throw new Error("Too many redirects");
        let next: URL;
        try {
          next = new URL(location, current);
        } catch {
          throw new Error("Invalid redirect target");
        }
        if (next.protocol !== "http:" && next.protocol !== "https:") {
          throw new Error("Only http(s) URLs are supported");
        }
        current = next;
        continue;
      }

      if (!res.ok) {
        throw new Error(`Source responded HTTP ${res.status}`);
      }
      return res.text();
    }
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchPageText(url: string): Promise<string> {
  const html = await fetchHtml(url, FETCH_TIMEOUT_MS);
  return extractText(html).slice(0, MAX_CHARS);
}

function extractTitle(html: string): string {
  const head = html.slice(0, 100_000);
  const og = head.match(
    /<meta[^>]+(?:property|name)=["']og:title["'][^>]*content=["']([^"']+)["']/i,
  );
  const reversed = head.match(
    /<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']og:title["']/i,
  );
  const tag = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const raw = og?.[1] ?? reversed?.[1] ?? tag?.[1] ?? "";
  return decodeEntities(raw).replace(/\s+/g, " ").trim().slice(0, MAX_TITLE);
}

export async function fetchPageTitle(url: string): Promise<string> {
  return extractTitle(await fetchHtml(url, TITLE_TIMEOUT_MS));
}
