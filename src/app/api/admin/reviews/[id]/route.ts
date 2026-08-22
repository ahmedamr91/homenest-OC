import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

type Params = { params: { id: string } };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(_req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    await db.review.update({ where: { id }, data: { approved: true } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    await db.review.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }
}
