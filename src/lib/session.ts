import { cookies } from "next/headers";
import { verifySession, type SessionPayload } from "./jwt";

export const SESSION_COOKIE = "emptycorner_session";

export async function getAdminSession(): Promise<SessionPayload | null> {
  const store = cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
