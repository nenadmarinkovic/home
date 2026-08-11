/**
 * Self-test for the status-bar / notch colour pipeline.
 *
 *   npm run theme:test                       # logic + CSS drift checks
 *   npm run theme:test -- --url=http://…     # also assert the rendered HTML
 *
 * The `--url` pass is the important one: the theme-color meta has to be a
 * single un-scoped tag inside <head>, and the bootstrap script has to be a real
 * inline <script> that follows it. Reintroducing a media-scoped pair, or
 * `next/script` `beforeInteractive` (queued into `self.__next_s`, so it runs
 * long after first paint), brings the flash back — this fails loudly instead.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  applyThemeColorMeta,
  resolveTheme,
  THEME_COLORS,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
} from "../lib/theme";

const root = process.cwd();

let failures = 0;

function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ok   ${name}`);
    return;
  }
  failures += 1;
  console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
}

function equal(name: string, actual: unknown, expected: unknown) {
  check(
    name,
    Object.is(actual, expected) ||
      JSON.stringify(actual) === JSON.stringify(expected),
    `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
}

/* ------------------------------------------------------------------ */
/* A minimal DOM, just enough for the bootstrap script and the helpers. */
/* ------------------------------------------------------------------ */

type FakeMeta = {
  content: string;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
};

function makeMeta(content: string): FakeMeta {
  const meta: FakeMeta = {
    content,
    getAttribute(name) {
      return name === "content" ? meta.content : null;
    },
    setAttribute(name, value) {
      if (name === "content") meta.content = value;
    },
  };
  return meta;
}

function makeEnv(stored: string | null, systemDark: boolean, meta: FakeMeta | null) {
  const classes = new Set<string>(["antialiased"]);
  const documentElement = {
    classList: {
      add: (...names: string[]) => names.forEach((n) => classes.add(n)),
      remove: (...names: string[]) => names.forEach((n) => classes.delete(n)),
    },
    style: { colorScheme: "" },
  };
  const doc = {
    documentElement,
    querySelector: (selector: string) =>
      selector === 'meta[name="theme-color"]' ? meta : null,
  };
  return {
    doc,
    classes,
    documentElement,
    window: {
      matchMedia: (query: string) => ({
        matches: query.includes("dark") ? systemDark : !systemDark,
      }),
    },
    localStorage: {
      getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null),
    },
  };
}

/** Every combination of (stored preference) x (OS appearance). */
const MATRIX: Array<{
  stored: string | null;
  systemDark: boolean;
  resolved: ResolvedTheme;
}> = [
  { stored: null, systemDark: false, resolved: "light" },
  { stored: null, systemDark: true, resolved: "dark" },
  { stored: "system", systemDark: false, resolved: "light" },
  { stored: "system", systemDark: true, resolved: "dark" },
  { stored: "light", systemDark: false, resolved: "light" },
  { stored: "light", systemDark: true, resolved: "light" },
  { stored: "dark", systemDark: false, resolved: "dark" },
  { stored: "dark", systemDark: true, resolved: "dark" },
  // Garbage in storage must not wedge the page on the wrong theme.
  { stored: "purple", systemDark: true, resolved: "dark" },
];

console.log("\nbootstrap script (runs render-blocking in <head>)");
for (const row of MATRIX) {
  const meta = makeMeta(THEME_COLORS.light);
  const env = makeEnv(row.stored, row.systemDark, meta);
  const run = new Function("window", "document", "localStorage", THEME_INIT_SCRIPT);
  run(env.window, env.doc, env.localStorage);

  const label = `stored=${row.stored ?? "-"} systemDark=${row.systemDark}`;
  equal(`${label} → html class`, [...env.classes].sort(), ["antialiased", row.resolved].sort());
  equal(`${label} → color-scheme`, env.documentElement.style.colorScheme, row.resolved);
  equal(`${label} → meta content`, meta.content, THEME_COLORS[row.resolved]);
}

console.log("\nbootstrap script survives a hostile environment");
{
  const env = makeEnv(null, true, makeMeta(THEME_COLORS.light));
  const run = new Function("window", "document", "localStorage", THEME_INIT_SCRIPT);
  const throwingStorage = {
    getItem() {
      throw new Error("localStorage disabled");
    },
  };
  let threw = false;
  try {
    run(env.window, env.doc, throwingStorage);
  } catch {
    threw = true;
  }
  check("does not throw when localStorage is blocked", !threw);
  equal("still falls back to the OS appearance", env.documentElement.style.colorScheme, "dark");
}
{
  // Nothing to correct yet (meta not parsed) must not abort class application.
  const env = makeEnv("dark", false, null);
  const run = new Function("window", "document", "localStorage", THEME_INIT_SCRIPT);
  run(env.window, env.doc, env.localStorage);
  equal("applies the class even with no meta present", env.documentElement.style.colorScheme, "dark");
}

console.log("\napplyThemeColorMeta (runtime toggle)");
for (const row of MATRIX) {
  const meta = makeMeta("#123456");
  applyThemeColorMeta(row.resolved, {
    querySelector: () => meta,
  } as unknown as Document);
  equal(`resolved=${row.resolved} → meta content`, meta.content, THEME_COLORS[row.resolved]);
}

console.log("\nresolveTheme");
equal("explicit light wins over OS", resolveTheme("light"), "light");
equal("explicit dark wins over OS", resolveTheme("dark"), "dark");

/* ------------------------------------------------------------------ */
/* The colours must match the CSS, or the notch and the page disagree.  */
/* ------------------------------------------------------------------ */

console.log("\nglobals.css stays in sync");
{
  const css = readFileSync(join(root, "app/globals.css"), "utf8");
  const rootBlock = css.slice(css.indexOf(":root {"), css.indexOf(".dark {"));
  const darkBlock = css.slice(css.indexOf(".dark {"));
  const lightBg = /--background:\s*([^;]+);/.exec(rootBlock)?.[1].trim();
  const darkBg = /--background:\s*([^;]+);/.exec(darkBlock)?.[1].trim();
  equal("--background (light) matches THEME_COLORS.light", lightBg, THEME_COLORS.light);
  equal("--background (dark) matches THEME_COLORS.dark", darkBg, THEME_COLORS.dark);
  check("html paints its own background", /html\s*\{[^}]*background-color:\s*var\(--background\)/s.test(css));
  check("color-scheme declared for light", /:root\s*\{[^}]*color-scheme:\s*light/s.test(css));
  check("color-scheme declared for dark", /\.dark\s*\{[^}]*color-scheme:\s*dark/s.test(css));
}

console.log("\nmanifest agrees with the light theme");
{
  const manifest = JSON.parse(readFileSync(join(root, "public/site.webmanifest"), "utf8"));
  equal("theme_color", manifest.theme_color, THEME_COLORS.light);
  equal("background_color", manifest.background_color, THEME_COLORS.light);
}

/* ------------------------------------------------------------------ */
/* The launch path: nothing in the document can colour a window in      */
/* which there is no document yet.                                      */
/* ------------------------------------------------------------------ */

console.log("\nservice worker serves the shell without waiting on the network");
{
  // Source-level guards. The behaviour itself needs a browser with a stalled
  // network to observe; these catch the two ways it silently regresses.
  const sw = readFileSync(join(root, "public/sw.js"), "utf8");
  const shell = sw.slice(sw.indexOf("function handleShellNavigate"));
  check("navigations have a cache-first shell path", shell.length > 0);
  check(
    "the cached copy is read before the network is awaited",
    shell.indexOf("cache.match(pathname)") > -1 &&
      shell.indexOf("cache.match(pathname)") < shell.indexOf("await revalidate"),
  );
  check("revalidation is kept alive past the response", shell.includes("event.waitUntil(revalidate)"));
  check(
    "per-session routes stay network-first",
    /isShellPath[\s\S]{0,200}admin\|login\|api/.test(sw),
  );
}

const urlArg = process.argv.find((a) => a.startsWith("--url="));

async function checkRenderedDocument(url: string) {
  console.log(`\nrendered document at ${url}`);
  const html = await fetch(url).then((r) => r.text());
  const headEnd = html.indexOf("</head>");
  check("document has a head", headEnd > -1);
  const head = html.slice(0, headEnd);

  const metaMatches = [...head.matchAll(/<meta[^>]*name="theme-color"[^>]*>/g)];
  equal("exactly one theme-color meta in <head>", metaMatches.length, 1);
  check("it is not media-scoped", !metaMatches[0]?.[0].includes("media="), metaMatches[0]?.[0]);
  check(
    "it ships the light background",
    !!metaMatches[0]?.[0].includes(THEME_COLORS.light),
    metaMatches[0]?.[0],
  );

  const scriptIndex = head.indexOf("localStorage.getItem");
  check("bootstrap script is inline in <head>", scriptIndex > -1);
  check(
    "bootstrap script runs after the meta",
    scriptIndex > -1 && metaMatches.every((m) => (m.index ?? 0) < scriptIndex),
  );
  check(
    "bootstrap script is render-blocking, not queued via next/script",
    !head.includes("__next_s"),
  );
  check("viewport-fit=cover is set", /name="viewport"[^>]*viewport-fit=cover/.test(head));
  check(
    "the server bakes no theme into the html element",
    !/<html[^>]*class="[^"]*\bdark\b/.test(html),
  );
}

async function main() {
  if (urlArg) await checkRenderedDocument(urlArg.slice("--url=".length));

  console.log(
    failures === 0
      ? "\nAll theme colour checks passed.\n"
      : `\n${failures} theme colour check(s) failed.\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

void main();
