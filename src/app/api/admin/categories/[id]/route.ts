import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categoryUpdateSchema } from "@/lib/validators";
import { requireAdmin, readJson } from "@/lib/admin-guard";

type Params = { params: { id: string } };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const body = await readJson(req);
  if (body == null)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });

  try {
    await db.category.update({
      where: { id },
      data: {
        ...(parsed.data.name != null ? { name: parsed.data.name } : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description ?? null }
          : {}),
        ...(parsed.data.imageUrl !== undefined
          ? { imageUrl: parsed.data.imageUrl ?? null }
          : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    const count = await db.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json(
        {
          error: `This category still has ${count} product(s). Move or delete them first.`,
        },
        { status: 409 }
      );
    }
    await db.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete the category." },
      { status: 500 }
    );
  }
}
