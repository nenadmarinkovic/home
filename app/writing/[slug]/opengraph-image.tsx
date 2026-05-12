import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getArticle } from "../articles";

export const alt = "Nenad Marinković — writing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    return new ImageResponse(<div>Not found</div>, size);
  }

  const fontsDir = join(process.cwd(), "app", "fonts");
  const [serifNormal, serifItalic] = await Promise.all([
    readFile(join(fontsDir, "source-serif-4-og.ttf")),
    readFile(join(fontsDir, "source-serif-4-og-italic.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background: "#f7f3f3",
        color: "#151515",
        fontFamily: "Source Serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 24,
          fontStyle: "italic",
          color: "#52525b",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: "#F25022",
          }}
        />
        Nenad Marinković
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontSize: 84,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          {article.title}
        </div>
        <div
          style={{
            fontSize: 36,
            fontStyle: "italic",
            lineHeight: 1.2,
            color: "#52525b",
          }}
        >
          {article.subtitle}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#52525b",
        }}
      >
        <span>{article.dateLabel}</span>
        <span>nenadmarinkovic.com</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Source Serif",
          data: serifNormal,
          weight: 600,
          style: "normal",
        },
        {
          name: "Source Serif",
          data: serifItalic,
          weight: 400,
          style: "italic",
        },
      ],
    },
  );
}
