import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";

const SCRYPT_KEYLEN = 64;

/** Hash format: scrypt$<saltHex>$<hashHex> */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password.normalize("NFKC"), salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(submitted: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  let saltBuf: Buffer;
  let expectedBuf: Buffer;
  try {
    saltBuf = Buffer.from(parts[1], "hex");
    expectedBuf = Buffer.from(parts[2], "hex");
  } catch {
    return false;
  }
  if (saltBuf.length === 0 || expectedBuf.length !== SCRYPT_KEYLEN) return false;
  const actual = scryptSync(submitted.normalize("NFKC"), saltBuf, SCRYPT_KEYLEN);
  return timingSafeEqual(actual, expectedBuf);
}
