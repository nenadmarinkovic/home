/**
 * Self-test for the status-bar / notch colour pipeline.
 *
 *   npm run theme:test                       # logic + CSS drift checks
 *   npm run theme:test -- --url=http://…     # also assert the rendered HTML
 *
 * The `--url` pass is the important one for regressions that only show up in
 * the document: the theme-color metas have to be inside <head> and the
 * bootstrap script has to be a real inline <script> that follows them. If Next
 * ever hoists things differently, or someone reintroduces `next/script`
 * `beforeInteractive` (which is queued into `self.__next_s` and runs long
 * after first paint), this fails loudly instead of silently reintroducing the
 * flash.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  applyThemeColorMeta,
  documentMatchesPreference,
  resolveTheme,
  THEME_COLORS,
  THEME_COOKIE,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  themeColorMetas,
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
  media: string | null;
  content: string;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
};

function makeMeta(media: string | null, content: string): FakeMeta {
  const meta: FakeMeta = {
    media,
    content,
    getAttribute(name) {
      if (name === "media") return meta.media;
      if (name === "content") return meta.content;
      return null;
    },
    setAttribute(name, value) {
      if (name === "media") meta.media = value;
      if (name === "content") meta.content = value;
    },
  };
  return meta;
}

/** The two metas exactly as `app/layout.tsx` ships them. */
function shippedMetas(): FakeMeta[] {
  return [
    makeMeta("(prefers-color-scheme: light)", THEME_COLORS.light),
    makeMeta("(prefers-color-scheme: dark)", THEME_COLORS.dark),
  ];
}

function makeEnv(stored: string | null, systemDark: boolean, metas: FakeMeta[]) {
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
    querySelectorAll: (selector: string) =>
      selector === 'meta[name="theme-color"]' ? metas : [],
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

/**
 * Every combination of (stored preference) x (OS appearance), and what the
 * notch must end up as. `content` is what iOS reads out of whichever meta its
 * current appearance matches — so for an explicit choice both metas must carry
 * the chosen colour, and for "system" each meta keeps its own.
 */
const MATRIX: Array<{
  stored: string | null;
  systemDark: boolean;
  resolved: ResolvedTheme;
  metas: [string, string];
}> = [
  { stored: null, systemDark: false, resolved: "light", metas: [THEME_COLORS.light, THEME_COLORS.dark] },
  { stored: null, systemDark: true, resolved: "dark", metas: [THEME_COLORS.light, THEME_COLORS.dark] },
  { stored: "system", systemDark: false, resolved: "light", metas: [THEME_COLORS.light, THEME_COLORS.dark] },
  { stored: "system", systemDark: true, resolved: "dark", metas: [THEME_COLORS.light, THEME_COLORS.dark] },
  { stored: "light", systemDark: false, resolved: "light", metas: [THEME_COLORS.light, THEME_COLORS.light] },
  { stored: "light", systemDark: true, resolved: "light", metas: [THEME_COLORS.light, THEME_COLORS.light] },
  { stored: "dark", systemDark: false, resolved: "dark", metas: [THEME_COLORS.dark, THEME_COLORS.dark] },
  { stored: "dark", systemDark: true, resolved: "dark", metas: [THEME_COLORS.dark, THEME_COLORS.dark] },
  // Garbage in storage must not wedge the page on the wrong theme.
  { stored: "purple", systemDark: true, resolved: "dark", metas: [THEME_COLORS.light, THEME_COLORS.dark] },
];

console.log("\nbootstrap script (runs render-blocking in <head>)");
for (const row of MATRIX) {
  const metas = shippedMetas();
  const env = makeEnv(row.stored, row.systemDark, metas);
  const run = new Function("window", "document", "localStorage", THEME_INIT_SCRIPT);
  run(env.window, env.doc, env.localStorage);

  const label = `stored=${row.stored ?? "-"} systemDark=${row.systemDark}`;
  equal(`${label} → html class`, [...env.classes].sort(), ["antialiased", row.resolved].sort());
  equal(`${label} → color-scheme`, env.documentElement.style.colorScheme, row.resolved);
  equal(`${label} → meta contents`, [metas[0].content, metas[1].content], row.metas);
  equal(`${label} → media untouched`, [metas[0].media, metas[1].media], [
    "(prefers-color-scheme: light)",
    "(prefers-color-scheme: dark)",
  ]);
}

console.log("\nbootstrap script re-stamps the preference cookie every load");
{
  // WebKit expires script-written cookies after seven days whatever `max-age`
  // says, so this must happen unconditionally on load — not only on change.
  for (const [stored, expected] of [
    ["light", `${THEME_COOKIE}=light`],
    ["dark", `${THEME_COOKIE}=dark`],
    ["system", `${THEME_COOKIE}=;`],
    [null, `${THEME_COOKIE}=;`],
  ] as const) {
    const env = makeEnv(stored, false, shippedMetas());
    let written = "";
    const doc = {
      ...env.doc,
      set cookie(v: string) {
        written = v;
      },
      get cookie() {
        return "";
      },
    };
    const run = new Function("window", "document", "localStorage", THEME_INIT_SCRIPT);
    run(env.window, doc, env.localStorage);
    check(
      `stored=${stored ?? "-"} → writes ${expected}`,
      written.startsWith(expected),
      written,
    );
    check(`stored=${stored ?? "-"} → scoped to the whole site`, written.includes("path=/"), written);
  }
}

console.log("\ndocumentMatchesPreference (is the served shell stale?)");
{
  const twoMetas = { querySelectorAll: () => shippedMetas() } as unknown as Document;
  const oneMeta = {
    querySelectorAll: () => [makeMeta(null, THEME_COLORS.light)],
  } as unknown as Document;
  check("system + media-scoped pair → matches", documentMatchesPreference("system", twoMetas));
  check("light + single un-scoped → matches", documentMatchesPreference("light", oneMeta));
  check(
    "light + media-scoped pair → mismatch (cache predates the cookie)",
    !documentMatchesPreference("light", twoMetas),
  );
  check(
    "system + single un-scoped → mismatch (cache predates clearing it)",
    !documentMatchesPreference("system", oneMeta),
  );
}

console.log("\nbootstrap script survives a hostile environment");
{
  const metas = shippedMetas();
  const env = makeEnv(null, true, metas);
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
  // Nothing to correct yet (metas not parsed) must not abort class application.
  const env = makeEnv("dark", false, []);
  const run = new Function("window", "document", "localStorage", THEME_INIT_SCRIPT);
  run(env.window, env.doc, env.localStorage);
  equal("applies the class even with no metas present", env.documentElement.style.colorScheme, "dark");
}

console.log("\napplyThemeColorMeta (runtime toggle + bfcache re-assert)");
for (const row of MATRIX) {
  const metas = shippedMetas();
  const label = `stored=${row.stored ?? "-"} systemDark=${row.systemDark}`;
  applyThemeColorMeta(row.stored, row.resolved, {
    querySelectorAll: () => metas,
  } as unknown as Document);
  equal(`${label} → meta contents`, [metas[0].content, metas[1].content], row.metas);
}
{
  // The previous implementation disabled a meta with media="not all", which
  // could not be undone by switching back to "system". Prove round-tripping.
  const metas = shippedMetas();
  const doc = { querySelectorAll: () => metas } as unknown as Document;
  applyThemeColorMeta("dark", "dark", doc);
  applyThemeColorMeta("light", "light", doc);
  applyThemeColorMeta("system", "light", doc);
  equal(
    "dark → light → system restores per-media colours",
    [metas[0].content, metas[1].content],
    [THEME_COLORS.light, THEME_COLORS.dark],
  );
}
{
  const meta = makeMeta(null, "#123456");
  applyThemeColorMeta("system", "dark", {
    querySelectorAll: () => [meta],
  } as unknown as Document);
  equal("a meta with no media takes the resolved colour", meta.content, THEME_COLORS.dark);
}

console.log("\nresolveTheme");
equal("explicit light wins over OS", resolveTheme("light"), "light");
equal("explicit dark wins over OS", resolveTheme("dark"), "dark");

console.log("\nthemeColorMetas (what the server puts in the first byte)");
equal("no cookie → both media-scoped metas", themeColorMetas(undefined), [
  { media: "(prefers-color-scheme: light)", content: THEME_COLORS.light },
  { media: "(prefers-color-scheme: dark)", content: THEME_COLORS.dark },
]);
equal("system → both media-scoped metas", themeColorMetas("system"), [
  { media: "(prefers-color-scheme: light)", content: THEME_COLORS.light },
  { media: "(prefers-color-scheme: dark)", content: THEME_COLORS.dark },
]);
equal("light → a single un-scoped light meta", themeColorMetas("light"), [
  { content: THEME_COLORS.light },
]);
equal("dark → a single un-scoped dark meta", themeColorMetas("dark"), [
  { content: THEME_COLORS.dark },
]);
check(
  "an explicit choice ships no meta that could match the other appearance",
  themeColorMetas("light").every((m) => m.media === undefined && m.content === THEME_COLORS.light),
);
equal("garbage cookie falls back to media-scoped", themeColorMetas("purple").length, 2);

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
  // The case that matters most on iOS: an explicitly chosen theme that
  // disagrees with the phone's appearance. The response must not contain a
  // meta scoped to the *other* appearance for iOS to latch onto.
  console.log(`\nrendered document at ${url} with an explicit preference`);
  for (const pref of ["light", "dark"] as const) {
    const html = await fetch(url, {
      headers: { cookie: `${THEME_COOKIE}=${pref}` },
    }).then((r) => r.text());
    const head = html.slice(0, html.indexOf("</head>"));
    const metas = [...head.matchAll(/<meta[^>]*name="theme-color"[^>]*>/g)].map((m) => m[0]);
    equal(`${pref} · exactly one theme-color meta`, metas.length, 1);
    check(`${pref} · it is not media-scoped`, !metas[0]?.includes("media="), metas[0]);
    check(`${pref} · it carries the ${pref} background`, !!metas[0]?.includes(THEME_COLORS[pref]), metas[0]);
  }

  console.log(`\nrendered document at ${url}`);
  const html = await fetch(url).then((r) => r.text());
  const headEnd = html.indexOf("</head>");
  check("document has a head", headEnd > -1);
  const head = html.slice(0, headEnd);

  const metaMatches = [...head.matchAll(/<meta[^>]*name="theme-color"[^>]*>/g)];
  equal("exactly two theme-color metas in <head>", metaMatches.length, 2);
  check(
    "light meta carries the light background",
    metaMatches.some(
      (m) => m[0].includes("prefers-color-scheme: light") && m[0].includes(THEME_COLORS.light),
    ),
  );
  check(
    "dark meta carries the dark background",
    metaMatches.some(
      (m) => m[0].includes("prefers-color-scheme: dark") && m[0].includes(THEME_COLORS.dark),
    ),
  );

  const scriptIndex = head.indexOf("localStorage.getItem");
  check("bootstrap script is inline in <head>", scriptIndex > -1);
  check(
    "bootstrap script runs after the metas",
    scriptIndex > -1 && metaMatches.every((m) => (m.index ?? 0) < scriptIndex),
  );
  check(
    "bootstrap script is render-blocking, not queued via next/script",
    !html.slice(0, scriptIndex > -1 ? scriptIndex : 0).includes("__next_s") &&
      !head.includes("__next_s"),
  );
  check("viewport-fit=cover is set", /name="viewport"[^>]*viewport-fit=cover/.test(head));
  check(
    "the stale cookie from the previous implementation is not read",
    !html.includes("theme-color=dark") && !html.includes("theme-color=light"),
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
