import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().trim().email().max(200) });

export async function POST(req: Request) {
  const rl = await rateLimit(`news:${getClientIp(req.headers)}`, 5, 60_000);
  if (!rl.ok)
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });

  await db.subscriber.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    update: {},
    create: { email: parsed.data.email.toLowerCase() },
  });

  void sendWelcomeEmail(parsed.data.email).catch(() => {});

  return NextResponse.json({ ok: true, message: "You're in! Check your inbox. 🎉" });
}
