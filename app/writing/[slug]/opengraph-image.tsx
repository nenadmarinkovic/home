import { ImageResponse } from "next/og";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

import { getAuthedFromCookie } from "@/lib/auth-server";
import { LOGO_ASPECT, logoDataUri } from "@/lib/logo";
import { contentTypeFor, resolveUploadPath } from "@/lib/uploads";
import { getArticle } from "../articles";

export const alt = "Nenad Marinković — writing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RASTERISABLE = new Set(["image/png", "image/jpeg"]);

function missing(): Response {
  return new Response("Not found", { status: 404 });
}

async function loadCover(url: string): Promise<string | null> {
  if (!url.startsWith("/writing/img/")) return null;
  const abs = resolveUploadPath(url.slice("/writing/img/".length));
  if (!abs || !existsSync(abs)) return null;
  const mime = contentTypeFor(extname(abs));
  if (!RASTERISABLE.has(mime)) return null;
  try {
    const bytes = await readFile(abs);
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return missing();

  if (article.draft && !(await getAuthedFromCookie())) return missing();

  const fontsDir = join(process.cwd(), "public", "fonts");
  const [sansRegular, sansSemibold, sansItalic, cover] = await Promise.all([
    readFile(join(fontsDir, "HankenGrotesk-Regular.ttf")),
    readFile(join(fontsDir, "HankenGrotesk-SemiBold.ttf")),
    readFile(join(fontsDir, "HankenGrotesk-Italic.ttf")),
    article.image ? loadCover(article.image) : Promise.resolve(null),
  ]);

  const ink = cover ? "#ffffff" : "#000000";
  const muted = cover ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.56)";
  const LOGO_H = 28;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background: cover ? "#151515" : "#fafafa",
        color: ink,
        fontFamily: "Hanken Grotesk",
      }}
    >
      {cover && (
        <img
          src={cover}
          alt=""
          width={size.width}
          height={size.height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            objectFit: "cover",
          }}
        />
      )}
      {cover && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 32%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.9) 100%)",
          }}
        />
      )}
      <img
        src={logoDataUri(ink)}
        alt=""
        width={Math.round(LOGO_H * LOGO_ASPECT)}
        height={LOGO_H}
        style={{
          width: Math.round(LOGO_H * LOGO_ASPECT),
          height: LOGO_H,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 60,
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          {article.title}
        </div>
        <div
          style={{
            fontSize: 30,
            fontStyle: "italic",
            lineHeight: 1.25,
            color: muted,
          }}
        >
          {article.subtitle}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Hanken Grotesk",
          data: sansRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Hanken Grotesk",
          data: sansSemibold,
          weight: 600,
          style: "normal",
        },
        {
          name: "Hanken Grotesk",
          data: sansItalic,
          weight: 400,
          style: "italic",
        },
      ],
    },
  );
}
