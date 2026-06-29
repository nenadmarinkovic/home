import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f5f4f0",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={124} height={124} viewBox="0 0 48 48" fill="#000000">
          <path d="M30.82,15.53s-5.91,10.23-5.91,10.23c-.42.72-1.46.72-1.88,0l-5.89-10.21c-1.94-3.36-6.78-3.36-8.72,0L.54,29.2c-2.41,4.49,3.83,8.16,6.52,3.88,1.33-2.3,3.54-6.13,4.79-8.29.42-.72,1.46-.72,1.88,0,1.02,1.76,2.63,4.55,3.62,6.27,1.03,1.78,2.7,3.15,4.69,3.67,3.41.89,6.84-.64,8.52-3.54l9.01-15.61c-1.92-3.38-6.79-3.41-8.73-.03Z" />
          <path d="M47.47,29.28l-5.72-9.91s-4.38,7.58-4.38,7.58c0,0,3.53,6.12,3.53,6.12,2.63,4.26,8.95.64,6.57-3.79Z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
