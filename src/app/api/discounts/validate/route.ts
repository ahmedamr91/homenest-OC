import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.number().positive().max(10000000),
});

export async function POST(req: Request) {
  const rl = rateLimit(`coupon:${getClientIp(req.headers)}`, 20, 60_000);
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
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const code = parsed.data.code.toUpperCase();
  const dc = await db.discountCode.findUnique({ where: { code } });

  if (!dc || !dc.active)
    return NextResponse.json({ valid: false, message: "This code doesn't exist." });
  if (dc.expiresAt && dc.expiresAt < new Date())
    return NextResponse.json({ valid: false, message: "This code has expired." });
  if (dc.maxUses != null && dc.usedCount >= dc.maxUses)
    return NextResponse.json({ valid: false, message: "This code is fully used." });
  if (dc.minOrder != null && parsed.data.subtotal < dc.minOrder)
    return NextResponse.json({
      valid: false,
      message: `Needs a minimum order of EGP ${dc.minOrder.toFixed(0)}.`,
    });

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const discount =
    dc.type === "PERCENT"
      ? round2((parsed.data.subtotal * dc.value) / 100)
      : Math.min(dc.value, parsed.data.subtotal);

  return NextResponse.json({
    valid: true,
    code: dc.code,
    discount,
    message:
      dc.type === "PERCENT"
        ? `${dc.value}% off applied!`
        : `EGP ${dc.value.toFixed(0)} off applied!`,
  });
}
