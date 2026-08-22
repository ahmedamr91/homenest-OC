import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendLowStockDigest } from "@/lib/email";

// Called daily by Vercel Cron (see vercel.json). Protected by CRON_SECRET.
export const runtime = "nodejs";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const low = await db.product.findMany({
    where: { published: true, stock: { lte: 10 } },
    orderBy: { stock: "asc" },
    select: { name: true, stock: true },
  });

  if (low.length) await sendLowStockDigest(low);

  return NextResponse.json({ ok: true, lowStockCount: low.length });
}
