import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
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

  if (!existsSync(absDir)) {
    await mkdir(absDir, { recursive: true });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absPath, buffer);

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
