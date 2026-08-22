import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discountCreateSchema } from "@/lib/validators";
import { requireAdmin, readJson } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const discounts = await db.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ discounts });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await readJson(req);
  if (body == null)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = discountCreateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid data." },
      { status: 400 }
    );
  const d = parsed.data;

  try {
    const exists = await db.discountCode.findUnique({ where: { code: d.code } });
    if (exists)
      return NextResponse.json(
        { error: `Code "${d.code}" already exists.` },
        { status: 409 }
      );

    await db.discountCode.create({
      data: {
        code: d.code,
        type: d.type,
        value: d.value,
        minOrder: d.minOrder ?? null,
        maxUses: d.maxUses ?? null,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create the code." }, { status: 500 });
  }
}
