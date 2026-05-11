import { randomBytes, timingSafeEqual } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { settings } from "@/db/schema";

const TOKEN_KEY = "links_api_token";

export function getApiToken(): string | null {
  const row = db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, TOKEN_KEY))
    .get();
  return row?.value ?? null;
}

export function rotateApiToken(): string {
  const token = randomBytes(32).toString("hex");
  db.insert(settings)
    .values({ key: TOKEN_KEY, value: token })
    .onConflictDoUpdate({ target: settings.key, set: { value: token } })
    .run();
  return token;
}

export function verifyApiToken(provided: string | null | undefined): boolean {
  if (!provided) return false;
  const stored = getApiToken();
  if (!stored) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(stored);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function readBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  return match ? match[1].trim() : null;
}
