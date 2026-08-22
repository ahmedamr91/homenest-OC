import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discountToggleSchema } from "@/lib/validators";
import { requireAdmin, readJson } from "@/lib/admin-guard";

type Params = { params: { id: string } };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const body = await readJson(req);
  if (body == null)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = discountToggleSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });

  try {
    await db.discountCode.update({
      where: { id },
      data: { active: parsed.data.active },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Code not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    await db.discountCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Code not found." }, { status: 404 });
  }
}
