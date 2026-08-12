"use client";

import { useEffect } from "react";

/* Phosphor Copy (regular) and Check (bold), inlined because the buttons are
   built in the DOM rather than rendered by React — see below. */
const COPY_PATH =
  "M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z";
const CHECK_PATH =
  "M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z";

const SVG_NS = "http://www.w3.org/2000/svg";

function icon(path: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 256 256");
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "code-copy-icon");
  const node = document.createElementNS(SVG_NS, "path");
  node.setAttribute("d", path);
  svg.append(node);
  return svg;
}

/* The article body is server-rendered HTML, so there is no React tree to hang
   these off. Building them here also means the button only ever exists when
   the clipboard call behind it can actually run. */
export function ArticleCode() {
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const buttons = [
      ...document.querySelectorAll<HTMLElement>("article .code"),
    ].flatMap((figure) => {
      const slot = figure.querySelector<HTMLElement>(".code-actions");
      const code = figure.querySelector("code")?.textContent;
      if (!slot || !code) return [];

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.setAttribute("aria-label", "Copy code");
      button.append(icon(COPY_PATH));

      button.addEventListener("click", () => {
        navigator.clipboard.writeText(code).then(() => {
          button.dataset.copied = "1";
          button.setAttribute("aria-label", "Copied");
          button.replaceChildren(icon(CHECK_PATH));
          timers.push(
            setTimeout(() => {
              delete button.dataset.copied;
              button.setAttribute("aria-label", "Copy code");
              button.replaceChildren(icon(COPY_PATH));
            }, 1600),
          );
        }, noop);
      });

      slot.append(button);
      return [button];
    });

    return () => {
      for (const timer of timers) clearTimeout(timer);
      for (const button of buttons) button.remove();
    };
  }, []);

  return null;
}

function noop() {}
