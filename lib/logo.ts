/**
 * The mark, as data. Shared so the site header, the admin share preview and
 * the OG card all draw the same paths — the card is rasterised by Satori and
 * can't import a React component, so it rebuilds an SVG from these instead of
 * keeping a second copy of the geometry.
 */
export const LOGO_VIEWBOX = "-15 -10 535 250";

export const LOGO_PATHS = [
  "M494.526 169.408L434.906 66.1484L389.256 145.138L426.076 208.938C453.526 253.298 519.326 215.638 494.536 169.418L494.526 169.408Z",
  "M321.056 26.1992L259.526 132.749C255.176 140.289 244.286 140.289 239.936 132.749L178.556 26.3792C158.396 -8.58081 107.946 -8.60081 87.7556 26.3492L5.63557 168.579C-19.4244 215.359 45.5756 253.569 73.5256 208.969C87.3256 185.059 110.356 145.169 123.386 122.589C127.736 115.059 138.576 115.059 142.926 122.589C153.516 140.939 170.276 169.999 180.596 187.909C191.306 206.489 208.666 220.679 229.426 226.089C264.916 235.329 300.696 219.459 318.156 189.219L412.016 26.5692C392.056 -8.69082 341.276 -8.90081 321.036 26.2092L321.056 26.1992Z",
] as const;

/** Width per unit of height, for laying the mark out from its height alone. */
export const LOGO_ASPECT = 535 / 250;

/** The mark as a data URI, since Satori draws images rather than components. */
export function logoDataUri(fill: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO_VIEWBOX}" fill="${fill}">` +
    LOGO_PATHS.map((d) => `<path d="${d}"/>`).join("") +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
