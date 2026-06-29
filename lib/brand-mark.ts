// Single source of truth for the logo mark and its app-icon colours.
//
// The mark lives in two places that are easy to let drift: the static favicon
// (app/icon.svg) and the generated iOS touch icon (app/apple-icon.tsx). They
// once drifted — the touch icon was briefly recoloured to brand orange while
// the favicon stayed black — which is what left iOS favourites showing an
// off-brand mark. Keep every generated icon importing these constants so a
// colour change is one edit, in one place, applied everywhere at once.

// The two paths that make up the painted logo mark, on a 48×48 canvas.
export const BRAND_MARK_VIEWBOX = "0 0 48 48";
export const BRAND_MARK_PATHS = [
  "M30.82,15.53s-5.91,10.23-5.91,10.23c-.42.72-1.46.72-1.88,0l-5.89-10.21c-1.94-3.36-6.78-3.36-8.72,0L.54,29.2c-2.41,4.49,3.83,8.16,6.52,3.88,1.33-2.3,3.54-6.13,4.79-8.29.42-.72,1.46-.72,1.88,0,1.02,1.76,2.63,4.55,3.62,6.27,1.03,1.78,2.7,3.15,4.69,3.67,3.41.89,6.84-.64,8.52-3.54l9.01-15.61c-1.92-3.38-6.79-3.41-8.73-.03Z",
  "M47.47,29.28l-5.72-9.91s-4.38,7.58-4.38,7.58c0,0,3.53,6.12,3.53,6.12,2.63,4.26,8.95.64,6.57-3.79Z",
] as const;

// The mark is black ink on the warm off-white surface used across the app
// (matches the light theme background and manifest background_color).
export const BRAND_INK = "#000000";
export const BRAND_SURFACE = "#f5f4f0";
