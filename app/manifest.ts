import type { MetadataRoute } from "next";

import { BRAND_SURFACE } from "@/lib/brand-mark";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.title,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: BRAND_SURFACE,
    theme_color: BRAND_SURFACE,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      // Raster fallback for installers that ignore SVG icons (notably older
      // Android launchers). Reuses the generated 180×180 touch icon so there's
      // one icon definition, not a separate committed PNG that can drift.
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
