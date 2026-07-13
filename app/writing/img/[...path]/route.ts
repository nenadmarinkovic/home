import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { contentTypeFor, resolveUploadPath } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const relPath = segments.join("/");
  const abs = resolveUploadPath(relPath);

  if (!abs || !existsSync(abs)) {
    return new Response("Not found", { status: 404 });
  }
  const info = await stat(abs);
  if (!info.isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const body = await readFile(abs);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(path.extname(abs)),
      "Content-Length": String(info.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
