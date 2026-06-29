import { ImageResponse } from "next/og";

import {
  BRAND_INK,
  BRAND_MARK_PATHS,
  BRAND_MARK_VIEWBOX,
  BRAND_SURFACE,
} from "@/lib/brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: BRAND_SURFACE,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={124} height={124} viewBox={BRAND_MARK_VIEWBOX} fill={BRAND_INK}>
          {BRAND_MARK_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </div>
    ),
    { ...size },
  );
}
