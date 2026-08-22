import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { signSession } from "@/lib/jwt";
import { SESSION_COOKIE } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`login:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${rl.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const admin = await db.admin.findUnique({ where: { email: email.toLowerCase() } });

  // Constant-shape response: same message for unknown user & bad password
  const invalid = NextResponse.json(
    { error: "Invalid email or password." },
    { status: 401 }
  );
  if (!admin) return invalid;

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return invalid;

  const token = await signSession({
    sub: String(admin.id),
    email: admin.email,
    name: admin.name,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
