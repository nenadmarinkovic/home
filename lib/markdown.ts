import DOMPurify from "isomorphic-dompurify";
import { marked, type Tokens } from "marked";

import { embedApps } from "./embeds";

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

const VIDEO_EXT: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
};

const MOCKUP_ROUTE = /^\/mockup\/[a-z0-9][a-z0-9-]{0,48}$/;

const EMBED_PATH = /^\/[a-zA-Z0-9\-._~/]*$/;

const STATUS_BAR_RE =
  /<span class="device-status" data-device-status="1"><\/span>/g;

const STATUS_BAR =
  `<svg class="device-status" viewBox="65 55 1170 300" fill="none" aria-hidden="true">` +
  `<g transform="translate(216.7 149.6) scale(0.9) translate(-216.7 -149.6)">` +
  `<path d="M231.241 129.576C239.781 129.576 246.898 135.565 246.898 149.154V149.208C246.898 162.018 240.963 169.672 231.08 169.672C223.91 169.672 218.539 165.536 217.33 159.681L217.276 159.386H224.151L224.232 159.628C225.279 162.286 227.643 164.005 231.107 164.005C237.337 164.005 239.942 158.043 240.211 150.712C240.238 150.309 240.265 149.906 240.265 149.476H240.104C238.573 153.021 234.706 155.707 229.469 155.707C222.003 155.707 216.739 150.336 216.739 143.058V143.004C216.739 135.189 222.889 129.576 231.241 129.576ZM231.241 150.363C235.672 150.363 239.056 147.247 239.056 142.924V142.897C239.056 138.6 235.672 135.243 231.322 135.243C227.025 135.243 223.561 138.573 223.561 142.763V142.816C223.561 147.221 226.837 150.363 231.241 150.363ZM255.545 143.649C253.37 143.649 251.651 141.93 251.651 139.755C251.651 137.579 253.37 135.888 255.545 135.888C257.721 135.888 259.413 137.579 259.413 139.755C259.413 141.93 257.721 143.649 255.545 143.649ZM255.545 163.361C253.37 163.361 251.651 161.642 251.651 159.467C251.651 157.291 253.37 155.599 255.545 155.599C257.721 155.599 259.413 157.291 259.413 159.467C259.413 161.642 257.721 163.361 255.545 163.361ZM283.233 169V161.561H263.897V155.653L279.984 130.248H289.84V155.868H295.104V161.561H289.84V169H283.233ZM270.128 156.029H283.341V135.485H283.18L270.128 155.841V156.029ZM309.149 169V136.854H308.988L298.971 143.729V137.365L309.095 130.248H315.943V169H309.149Z" fill="currentColor"/>` +
  `</g>` +
  `<g opacity="0.9">` +
  `<rect x="902" y="150" width="10" height="12" rx="1" fill="currentColor"/>` +
  `<rect x="916" y="144" width="10" height="18" rx="1" fill="currentColor"/>` +
  `<rect x="931" y="137" width="10" height="25" rx="1" fill="currentColor"/>` +
  `<rect x="945" y="129" width="10" height="33" rx="1" fill="currentColor"/>` +
  `</g>` +
  `<g opacity="0.9">` +
  `<path d="M1034.15 137.633C1027.62 131.066 1018.59 127 1008.6 127C998.586 127 989.526 131.091 983 137.692L988.657 143.349C993.735 138.195 1000.8 135 1008.6 135C1016.38 135 1023.42 138.171 1028.49 143.29L1034.15 137.633Z" fill="currentColor"/>` +
  `<path d="M1024.95 146.825C1020.79 142.611 1015 140 1008.6 140C1002.18 140 996.366 142.636 992.192 146.885L997.85 152.542C1000.57 149.741 1004.39 148 1008.6 148C1012.79 148 1016.58 149.716 1019.3 152.482L1024.95 146.825Z" fill="currentColor"/>` +
  `<path d="M1015.76 156.018C1013.95 154.156 1011.41 153 1008.6 153C1005.77 153 1003.21 154.181 1001.39 156.078L1008.54 163.236L1015.76 156.018Z" fill="currentColor"/>` +
  `</g>` +
  `<rect opacity="0.6" x="1063.5" y="129.5" width="67" height="32" rx="6.5" stroke="currentColor" stroke-width="3"/>` +
  `<rect opacity="0.9" x="1067" y="133" width="60" height="25" rx="4" fill="currentColor"/>` +
  `<path opacity="0.6" d="M1134 141C1136.21 141 1138 142.791 1138 145V146C1138 148.209 1136.21 150 1134 150V141Z" fill="currentColor"/>` +
  `</svg>`;

const FRAME_RE = /<span class="device-frame" data-device-frame="1"><\/span>/g;

const FRAME =
  `<svg class="device-frame" viewBox="0 0 1350 2760" fill="none" aria-hidden="true">` +
  `<rect class="device-btn" x="31" y="467" width="17" height="126" rx="5"/>` +
  `<rect class="device-btn" x="31" y="647" width="17" height="234" rx="5"/>` +
  `<rect class="device-btn" x="31" y="937" width="17" height="234" rx="5"/>` +
  `<rect class="device-btn" x="1302" y="719" width="17" height="341" rx="5"/>` +
  `<path class="device-body" fill-rule="evenodd" d="M292.0 37.0L1058.0 37.0L1088.2 37.6L1111.7 39.6L1133.0 42.8L1152.7 47.3L1171.2 53.1L1188.5 60.1L1204.7 68.3L1219.8 77.8L1233.9 88.4L1246.8 100.2L1258.6 113.1L1269.2 127.2L1278.7 142.3L1286.9 158.5L1293.9 175.8L1299.7 194.3L1304.2 214.0L1307.4 235.3L1309.4 258.8L1310.0 289.0L1310.0 2471.0L1309.4 2501.2L1307.4 2524.7L1304.2 2546.0L1299.7 2565.7L1293.9 2584.2L1286.9 2601.5L1278.7 2617.7L1269.2 2632.8L1258.6 2646.9L1246.8 2659.8L1233.9 2671.6L1219.8 2682.2L1204.7 2691.7L1188.5 2699.9L1171.2 2706.9L1152.7 2712.7L1133.0 2717.2L1111.7 2720.4L1088.2 2722.4L1058.0 2723.0L292.0 2723.0L261.8 2722.4L238.3 2720.4L217.0 2717.2L197.3 2712.7L178.8 2706.9L161.5 2699.9L145.3 2691.7L130.2 2682.2L116.1 2671.6L103.2 2659.8L91.4 2646.9L80.8 2632.8L71.3 2617.7L63.1 2601.5L56.1 2584.2L50.3 2565.7L45.8 2546.0L42.6 2524.7L40.6 2501.2L40.0 2471.0L40.0 289.0L40.6 258.8L42.6 235.3L45.8 214.0L50.3 194.3L56.1 175.8L63.1 158.5L71.3 142.3L80.8 127.2L91.4 113.1L103.2 100.2L116.1 88.4L130.2 77.8L145.3 68.3L161.5 60.1L178.8 53.1L197.3 47.3L217.0 42.8L238.3 39.6L261.8 37.6L292.0 37.0ZM292.0 69.0L1058.0 69.0L1084.4 69.6L1104.9 71.3L1123.5 74.1L1140.7 78.0L1156.8 83.0L1171.9 89.2L1186.1 96.4L1199.3 104.6L1211.5 113.9L1222.8 124.2L1233.1 135.5L1242.4 147.7L1250.6 160.9L1257.8 175.1L1264.0 190.2L1269.0 206.3L1272.9 223.5L1275.7 242.1L1277.4 262.6L1278.0 289.0L1278.0 2471.0L1277.4 2497.4L1275.7 2517.9L1272.9 2536.5L1269.0 2553.7L1264.0 2569.8L1257.8 2584.9L1250.6 2599.1L1242.4 2612.3L1233.1 2624.5L1222.8 2635.8L1211.5 2646.1L1199.3 2655.4L1186.1 2663.6L1171.9 2670.8L1156.8 2677.0L1140.7 2682.0L1123.5 2685.9L1104.9 2688.7L1084.4 2690.4L1058.0 2691.0L292.0 2691.0L265.6 2690.4L245.1 2688.7L226.5 2685.9L209.3 2682.0L193.2 2677.0L178.1 2670.8L163.9 2663.6L150.7 2655.4L138.5 2646.1L127.2 2635.8L116.9 2624.5L107.6 2612.3L99.4 2599.1L92.2 2584.9L86.0 2569.8L81.0 2553.7L77.1 2536.5L74.3 2517.9L72.6 2497.4L72.0 2471.0L72.0 289.0L72.6 262.6L74.3 242.1L77.1 223.5L81.0 206.3L86.0 190.2L92.2 175.1L99.4 160.9L107.6 147.7L116.9 135.5L127.2 124.2L138.5 113.9L150.7 104.6L163.9 96.4L178.1 89.2L193.2 83.0L209.3 78.0L226.5 74.1L245.1 71.3L265.6 69.6L292.0 69.0Z"/>` +
  `<path class="device-rim" d="M292.0 37.0L1058.0 37.0L1088.2 37.6L1111.7 39.6L1133.0 42.8L1152.7 47.3L1171.2 53.1L1188.5 60.1L1204.7 68.3L1219.8 77.8L1233.9 88.4L1246.8 100.2L1258.6 113.1L1269.2 127.2L1278.7 142.3L1286.9 158.5L1293.9 175.8L1299.7 194.3L1304.2 214.0L1307.4 235.3L1309.4 258.8L1310.0 289.0L1310.0 2471.0L1309.4 2501.2L1307.4 2524.7L1304.2 2546.0L1299.7 2565.7L1293.9 2584.2L1286.9 2601.5L1278.7 2617.7L1269.2 2632.8L1258.6 2646.9L1246.8 2659.8L1233.9 2671.6L1219.8 2682.2L1204.7 2691.7L1188.5 2699.9L1171.2 2706.9L1152.7 2712.7L1133.0 2717.2L1111.7 2720.4L1088.2 2722.4L1058.0 2723.0L292.0 2723.0L261.8 2722.4L238.3 2720.4L217.0 2717.2L197.3 2712.7L178.8 2706.9L161.5 2699.9L145.3 2691.7L130.2 2682.2L116.1 2671.6L103.2 2659.8L91.4 2646.9L80.8 2632.8L71.3 2617.7L63.1 2601.5L56.1 2584.2L50.3 2565.7L45.8 2546.0L42.6 2524.7L40.6 2501.2L40.0 2471.0L40.0 289.0L40.6 258.8L42.6 235.3L45.8 214.0L50.3 194.3L56.1 175.8L63.1 158.5L71.3 142.3L80.8 127.2L91.4 113.1L103.2 100.2L116.1 88.4L130.2 77.8L145.3 68.3L161.5 60.1L178.8 53.1L197.3 47.3L217.0 42.8L238.3 39.6L261.8 37.6L292.0 37.0Z"/>` +
  `<path class="device-rim device-rim-inner" d="M292.0 69.0L1058.0 69.0L1084.4 69.6L1104.9 71.3L1123.5 74.1L1140.7 78.0L1156.8 83.0L1171.9 89.2L1186.1 96.4L1199.3 104.6L1211.5 113.9L1222.8 124.2L1233.1 135.5L1242.4 147.7L1250.6 160.9L1257.8 175.1L1264.0 190.2L1269.0 206.3L1272.9 223.5L1275.7 242.1L1277.4 262.6L1278.0 289.0L1278.0 2471.0L1277.4 2497.4L1275.7 2517.9L1272.9 2536.5L1269.0 2553.7L1264.0 2569.8L1257.8 2584.9L1250.6 2599.1L1242.4 2612.3L1233.1 2624.5L1222.8 2635.8L1211.5 2646.1L1199.3 2655.4L1186.1 2663.6L1171.9 2670.8L1156.8 2677.0L1140.7 2682.0L1123.5 2685.9L1104.9 2688.7L1084.4 2690.4L1058.0 2691.0L292.0 2691.0L265.6 2690.4L245.1 2688.7L226.5 2685.9L209.3 2682.0L193.2 2677.0L178.1 2670.8L163.9 2663.6L150.7 2655.4L138.5 2646.1L127.2 2635.8L116.9 2624.5L107.6 2612.3L99.4 2599.1L92.2 2584.9L86.0 2569.8L81.0 2553.7L77.1 2536.5L74.3 2517.9L72.6 2497.4L72.0 2471.0L72.0 289.0L72.6 262.6L74.3 242.1L77.1 223.5L81.0 206.3L86.0 190.2L92.2 175.1L99.4 160.9L107.6 147.7L116.9 135.5L127.2 124.2L138.5 113.9L150.7 104.6L163.9 96.4L178.1 89.2L193.2 83.0L209.3 78.0L226.5 74.1L245.1 71.3L265.6 69.6L292.0 69.0Z"/>` +
  `<rect class="device-island" x="488" y="112" width="373" height="108" rx="54"/>` +
  `</svg>`;

const DEVICE_SCREEN_RE =
  /<div class="device-screen" data-device-route="([^"]+)"(?: data-device-title="([^"]*)")?><\/div>/g;

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fenceFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const match = /^\s*([a-zA-Z]+)\s*:\s*(.*)$/.exec(line);
    if (match) fields[match[1].toLowerCase()] = match[2].trim();
  }
  return fields;
}

type AppTarget = { href: string; frame: string };

function appTarget(fields: Record<string, string>): AppTarget | null {
  const origin = embedApps().get((fields.app ?? "").toLowerCase());
  if (!origin) return null;

  const path = fields.path ?? "/";
  if (!EMBED_PATH.test(path)) return null;
  const rest = path === "/" ? "" : path;

  const frame = fields.frame ?? `${rest}/embed`;
  if (!EMBED_PATH.test(frame)) return null;

  return { href: `${origin}${rest}`, frame: `${origin}${frame}` };
}

function visitUrl(value: string | undefined): URL | null {
  try {
    const visit = new URL(value ?? "");
    if (visit.protocol === "http:" || visit.protocol === "https:") return visit;
  } catch {}
  return null;
}

function visitLine(visit: URL): string {
  return (
    `<span class="embed-visit">For the full experience visit ` +
    `<a href="${escapeAttr(visit.href)}">${escapeAttr(visit.host)}</a></span>`
  );
}

function renderDeviceFence(text: string): string | null {
  const fields = fenceFields(text);

  const parts: string[] = [];
  const poster = fields.poster ?? "";
  const alt = escapeAttr(fields.alt ?? "");

  if (fields.app) {
    const app = appTarget(fields);
    if (!app) return null;
    parts.push(
      `<div class="device-screen">` +
        `<div class="embed-frame" data-embed-src="${escapeAttr(app.frame)}"` +
        ` data-embed-title="${alt || escapeAttr(fields.app)}"></div>` +
        `</div>`,
    );
  } else if (fields.route) {
    if (!MOCKUP_ROUTE.test(fields.route)) return null;
    parts.push(
      `<div class="device-screen" data-device-route="${escapeAttr(fields.route)}"` +
        `${alt ? ` data-device-title="${alt}"` : ""}></div>`,
    );
  } else if (fields.video) {
    parts.push(`<div class="device-screen">`);
    const sources = fields.video
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!sources.length) return null;
    const posterAttr = poster ? ` poster="${escapeAttr(poster)}"` : "";
    parts.push(
      `<video autoplay muted loop playsinline preload="metadata"${posterAttr}>`,
    );
    for (const src of sources) {
      const ext = src.split(".").pop()?.toLowerCase() ?? "";
      const type = VIDEO_EXT[ext];
      parts.push(
        `<source src="${escapeAttr(src)}"${type ? ` type="${type}"` : ""}>`,
      );
    }
    parts.push("</video>");
    if (poster) {
      parts.push(
        `<img class="device-still" src="${escapeAttr(poster)}" alt="${alt}">`,
      );
    }
    parts.push("</div>");
  } else if (fields.image) {
    parts.push(
      `<div class="device-screen">` +
        `<img src="${escapeAttr(fields.image)}" alt="${alt}">` +
        `</div>`,
    );
  } else {
    return null;
  }

  const caption: string[] = [];
  if (fields.caption) caption.push(escapeAttr(fields.caption));
  const visit = fields.app ? visitUrl(fields.visit) : null;
  if (visit) caption.push(visitLine(visit));
  if (caption.length) {
    parts.push(`<figcaption>${caption.join("")}</figcaption>`);
  }

  const side =
    fields.side === "left" || fields.side === "right" ? fields.side : null;
  const cls = side ? `device device-${side}` : "device";

  const chrome = `<span class="device-frame" data-device-frame="1"></span>`;

  const status =
    fields.route || fields.app
      ? `<span class="device-status" data-device-status="1"></span>` +
      `<span class="device-home" aria-hidden="true"></span>`
    : "";
  return `<figure class="${cls}">${parts.join("")}${status}${chrome}</figure>`;
}

const EMBED_RATIOS: Record<string, string> = {
  "16/9": "embed-16x9",
  "3/2": "embed-3x2",
  "4/3": "embed-4x3",
  "1/1": "embed-1x1",
};

function renderEmbedFence(text: string): string | null {
  const fields = fenceFields(text);
  const app = appTarget(fields);
  if (!app) return null;

  const title = escapeAttr(fields.title || fields.app);
  const ratio = EMBED_RATIOS[fields.ratio] ?? EMBED_RATIOS["16/9"];
  const label = escapeAttr(fields.link || "Open ↗");

  const parts = [];
  if (fields.caption) parts.push(escapeAttr(fields.caption));
  const visit = visitUrl(fields.visit);
  if (visit) parts.push(visitLine(visit));
  const caption = parts.length
    ? `<figcaption>${parts.join("")}</figcaption>`
    : "";

  return (
    `<figure class="embed ${ratio}">` +
    `<div class="embed-frame" data-embed-src="${escapeAttr(app.frame)}"` +
    ` data-embed-full="${escapeAttr(app.href)}"` +
    ` data-embed-title="${title}">` +
    `<a class="embed-card" href="${escapeAttr(visit?.href ?? app.href)}">` +
    `<span class="embed-card-title">${title}</span>` +
    `<span class="embed-card-open">${label}</span>` +
    `</a>` +
    `</div>` +
    `<div class="embed-controls"></div>` +
    caption +
    `</figure>`
  );
}

const CODE_LANG = /^[a-z0-9+#._-]{1,24}$/;

const CODE_LABELS: Record<string, string> = {
  cjs: "javascript",
  dockerfile: "docker",
  js: "javascript",
  jsx: "javascript",
  md: "markdown",
  mjs: "javascript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  sh: "shell",
  ts: "typescript",
  tsx: "typescript",
  yml: "yaml",
};

function renderCodeFence(token: Tokens.Code): string {
  const word = (token.lang ?? "").trim().split(/\s+/)[0].toLowerCase();
  const lang = CODE_LANG.test(word) ? word : "";
  const label = lang ? (CODE_LABELS[lang] ?? lang) : "";
  const body = token.text.replace(/\n+$/, "");
  const code = token.escaped ? body : escapeAttr(body);

  return (
    `<figure class="code">` +
    `<figcaption class="code-lang">` +
    `<span class="code-lang-name">${label}</span>` +
    `<span class="code-actions"></span>` +
    `</figcaption>` +
    `<pre><code${lang ? ` class="language-${lang}"` : ""}>${code}</code></pre>` +
    `</figure>`
  );
}

marked.use({
  renderer: {
    code(token: Tokens.Code) {
      if (token.lang === "device") {
        const html = renderDeviceFence(token.text);
        if (html) return html;
      }
      if (token.lang === "embed") {
        const html = renderEmbedFence(token.text);
        if (html) return html;
      }

      return renderCodeFence(token);
    },
  },
});

export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false }) as string;
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
  });

  return clean
    .replace(FRAME_RE, FRAME)
    .replace(STATUS_BAR_RE, STATUS_BAR)
    .replace(DEVICE_SCREEN_RE, (_match, route: string, title = "") => {
      if (!MOCKUP_ROUTE.test(route)) return "";
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
      return (
        `<div class="device-screen">` +
        `<iframe src="${route}" loading="lazy" tabindex="-1"` +
        ` scrolling="no" sandbox="allow-scripts allow-same-origin"${titleAttr}></iframe>` +
        `</div>`
      );
    });
}
