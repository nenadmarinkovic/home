import { cookies } from "next/headers";

import { isValidSessionCookie, SESSION_COOKIE_NAME } from "./auth";

export async function getAuthedFromCookie(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE_NAME)?.value;
  return isValidSessionCookie(value);
}
