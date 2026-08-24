import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Lightweight self-hosted analytics: increments today's visit counter.
const BOT_RE = /bot|crawler|spider|crawling|headless|curl|wget|python-requests|axios|postman/i;

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const ua = req.headers.get("user-agent") || "";
  if (BOT_RE.test(ua)) return NextResponse.json({ ok: false, bot: true });

  const rl = await rateLimit(`track:${ip}`, 60, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: true });

  let path = "/";
  try {
    const body = (await req.json()) as { path?: string };
    path = String(body.path || "/");
  } catch {
    /* keep default */
  }

  // Only count storefront pages
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true });
  }

  try {
    const now = new Date();
    const day = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    await db.pageViewDay.upsert({
      where: { day },
      update: { views: { increment: 1 } },
      create: { day, views: 1 },
    });
  } catch {
    /* never break the page for analytics */
  }
  return NextResponse.json({ ok: true });
}
