import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_DIR = path.join(process.cwd(), "uploads");

export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : DEFAULT_DIR;

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export const ALLOWED_IMAGE_MIME = new Set(Object.keys(EXT_BY_MIME));

export type SavedImage = { url: string; relPath: string };

export async function saveImage(file: File): Promise<SavedImage> {
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    throw new Error(`Unsupported type: ${file.type}`);
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`File too large (max ${MAX_SIZE_BYTES / 1024 / 1024} MB)`);
  }

  const ext = EXT_BY_MIME[file.type];
  const now = new Date();
  const bucket = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const filename = `${randomUUID()}.${ext}`;
  const relPath = path.posix.join(bucket, filename);
  const absDir = path.join(UPLOADS_DIR, bucket);
  const absPath = path.join(absDir, filename);

  try {
    if (!existsSync(absDir)) {
      await mkdir(absDir, { recursive: true });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absPath, buffer);
  } catch (err) {
    // Surface a clear, actionable message. Common cause: UPLOADS_DIR points
    // to a path the process can't create (e.g. "/app/uploads" locally when
    // /app doesn't exist). In dev, unset UPLOADS_DIR to default to ./uploads.
    const message =
      err instanceof Error ? err.message : "unknown filesystem error";
    throw new Error(
      `Could not write upload to ${absDir} — ${message}. Check UPLOADS_DIR (currently: ${UPLOADS_DIR}).`,
    );
  }

  return { url: `/writing/img/${relPath}`, relPath };
}

export function resolveUploadPath(relPath: string): string | null {
  const abs = path.resolve(UPLOADS_DIR, relPath);
  // Prevent path traversal — must stay inside UPLOADS_DIR
  if (!abs.startsWith(UPLOADS_DIR + path.sep) && abs !== UPLOADS_DIR) {
    return null;
  }
  return abs;
}

const IMAGE_URL_RE = /\/writing\/img\/([A-Za-z0-9._\-/]+)/g;

export function extractImageUrls(body: string): string[] {
  const seen = new Set<string>();
  for (const match of body.matchAll(IMAGE_URL_RE)) {
    // Guard against trailing punctuation captured by the regex.
    const relPath = match[1].replace(/[.,;:!?)]+$/, "");
    seen.add(`/writing/img/${relPath}`);
  }
  return Array.from(seen);
}

export async function deleteImageByUrl(url: string): Promise<boolean> {
  if (!url.startsWith("/writing/img/")) return false;
  const relPath = url.slice("/writing/img/".length);
  const abs = resolveUploadPath(relPath);
  if (!abs || !existsSync(abs)) return false;
  try {
    await unlink(abs);
    return true;
  } catch {
    return false;
  }
}

export function contentTypeFor(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}
