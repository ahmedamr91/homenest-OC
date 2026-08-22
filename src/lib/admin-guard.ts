import { NextResponse } from "next/server";
import { getAdminSession } from "./session";
import type { SessionPayload } from "./jwt";

export async function requireAdmin(): Promise<
  { session: SessionPayload } | { error: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session };
}

export async function readJson<T = unknown>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
