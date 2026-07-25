import DOMPurify from "isomorphic-dompurify";
import { marked, type Tokens } from "marked";

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

// Same-origin mockup routes only. Anything else is rejected outright rather
// than sanitised, so an article can never point the frame off-site.
const MOCKUP_ROUTE = /^\/mockup\/[a-z0-9][a-z0-9-]{0,48}$/;

const STATUS_BAR_RE =
  /<span class="device-status" data-device-status="1"><\/span>/g;

// Clock, cellular, wifi and battery, lifted out of the same Figma export as
// the frame and kept in its 1300x2642 coordinate system — the SVG is stretched
// over the whole figure, so every glyph lands where the export put it and
// there is no second set of numbers to keep in sync with the frame. Figma
// bakes a white fill into each path; they are re-tagged to currentColor here
// so the bar follows the site's theme instead of shipping two versions.
const STATUS_BAR =
  `<svg class="device-status" viewBox="0 0 1300 2642" fill="none" aria-hidden="true">` +
  `<g transform="translate(-15 -15)">` +
  `<path d="M231.241 129.576C239.781 129.576 246.898 135.565 246.898 149.154V149.208C246.898 162.018 240.963 169.672 231.08 169.672C223.91 169.672 218.539 165.536 217.33 159.681L217.276 159.386H224.151L224.232 159.628C225.279 162.286 227.643 164.005 231.107 164.005C237.337 164.005 239.942 158.043 240.211 150.712C240.238 150.309 240.265 149.906 240.265 149.476H240.104C238.573 153.021 234.706 155.707 229.469 155.707C222.003 155.707 216.739 150.336 216.739 143.058V143.004C216.739 135.189 222.889 129.576 231.241 129.576ZM231.241 150.363C235.672 150.363 239.056 147.247 239.056 142.924V142.897C239.056 138.6 235.672 135.243 231.322 135.243C227.025 135.243 223.561 138.573 223.561 142.763V142.816C223.561 147.221 226.837 150.363 231.241 150.363ZM255.545 143.649C253.37 143.649 251.651 141.93 251.651 139.755C251.651 137.579 253.37 135.888 255.545 135.888C257.721 135.888 259.413 137.579 259.413 139.755C259.413 141.93 257.721 143.649 255.545 143.649ZM255.545 163.361C253.37 163.361 251.651 161.642 251.651 159.467C251.651 157.291 253.37 155.599 255.545 155.599C257.721 155.599 259.413 157.291 259.413 159.467C259.413 161.642 257.721 163.361 255.545 163.361ZM283.233 169V161.561H263.897V155.653L279.984 130.248H289.84V155.868H295.104V161.561H289.84V169H283.233ZM270.128 156.029H283.341V135.485H283.18L270.128 155.841V156.029ZM309.149 169V136.854H308.988L298.971 143.729V137.365L309.095 130.248H315.943V169H309.149Z" fill="currentColor"/>` +
  `</g>` +
  `<g transform="translate(15 -15)">` +
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
  `</g>` +
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

/**
 * A ```device fence becomes an iPhone frame (see `article .device` in
 * globals.css). It has to be a fence rather than raw <figure> HTML because
 * articles are authored in TipTap: its schema has no figure node, so raw
 * markup round-trips to a bare image and the wrapper is lost. A code block
 * survives the editor byte-for-byte, and degrades to a readable block if this
 * transform ever goes away.
 *
 *   ```device
 *   route: /mockup/lib-list
 *   alt: The word library list
 *   caption: The whole library in one list.
 *   ```
 *
 * `video:` (with an optional `poster:`) or `image:` may be used instead of
 * `route:` for a recording or a still. Unknown keys are ignored; a fence with
 * none of the three is left as a normal code block so a typo is visible rather
 * than silently dropping the figure.
 */
function renderDeviceFence(text: string): string | null {
  const fields: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const match = /^\s*([a-zA-Z]+)\s*:\s*(.*)$/.exec(line);
    if (match) fields[match[1].toLowerCase()] = match[2].trim();
  }

  const parts: string[] = [];
  const poster = fields.poster ?? "";
  const alt = escapeAttr(fields.alt ?? "");

  if (fields.route) {
    // Rendered as a placeholder here and swapped for the iframe after
    // sanitising — DOMPurify forbids <iframe>, and relaxing that for every
    // article body to serve this one feature isn't a trade worth making.
    // One route per frame. Phones are never shown side by side, so a comma
    // here is a mistake rather than a request for a row — reject it and let
    // the block fall through to a visible code block.
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
    // Autoplay can't be cancelled from CSS, so reduced-motion readers get the
    // poster still instead. Only possible when a poster was supplied.
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

  if (fields.caption) {
    parts.push(`<figcaption>${escapeAttr(fields.caption)}</figcaption>`);
  }

  // `side: left|right` floats the frame into the column's empty margin so body
  // text wraps alongside instead of the phone eating a screenful on its own.
  const side =
    fields.side === "left" || fields.side === "right" ? fields.side : null;
  const cls = side ? `device device-${side}` : "device";
  // The hardware — body, bezel, buttons, Dynamic Island — is one SVG laid over
  // the screen, with the aperture knocked out of it so the screen shows
  // through. It comes last so it draws on top, which is also what trims the
  // screen's corners to the bezel's radius.
  const chrome = `<img class="device-frame" src="/iphone-frame.svg" alt="" aria-hidden="true">`;
  // The status bar is drawn here rather than inside the mockup route: the
  // iframe is scaled to ~0.46, so anything in it renders at under half size
  // and 5px glyphs turn to mush. Out here it draws at full resolution.
  // Placeholder, swapped for the real markup after sanitising: the SVG in it
  // would otherwise be stripped, since USE_PROFILES only enables html.
  const status = fields.route
    ? `<span class="device-status" data-device-status="1"></span>`
    : "";
  return `<figure class="${cls}">${parts.join("")}${status}${chrome}</figure>`;
}

marked.use({
  renderer: {
    code(token: Tokens.Code) {
      if (token.lang === "device") {
        const html = renderDeviceFence(token.text);
        if (html) return html;
      }
      // marked falls back to the default renderer when an override returns
      // false. The published types declare the return as string, so the cast
      // is needed to express it.
      return false as unknown as string;
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

  // Swap device-screen placeholders for iframes now that sanitising is done.
  // The route was validated against MOCKUP_ROUTE when the fence was parsed and
  // is re-checked here, so this can only ever produce a same-origin /mockup/*
  // src no matter what survived sanitisation.
  // Both swaps are of markup this module generated, never of author content.
  return clean
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
