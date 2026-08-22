import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators";
import { requireAdmin, readJson } from "@/lib/admin-guard";

type Params = { params: { id: string } };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const product = await db.product.findUnique({
    where: { id },
    include: { colors: true, category: true },
  });
  if (!product)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const body = await readJson(req);
  if (body == null)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid data." },
      { status: 400 }
    );
  }
  const d = parsed.data;

  try {
    await db.$transaction(async (tx) => {
      await tx.productColor.deleteMany({ where: { productId: id } });
      await tx.product.update({
        where: { id },
        data: {
          name: d.name,
          description: d.description,
          price: d.price,
          comparePrice: d.comparePrice ?? null,
          stock: d.stock,
          featured: d.featured ?? false,
          published: d.published ?? true,
          imageUrl: d.imageUrl ?? null,
          categoryId: d.categoryId,
          colors: { create: d.colors },
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not update the product." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    const used = await db.orderItem.count({ where: { productId: id } });
    if (used > 0) {
      // Product is referenced by orders — unpublish instead of hard delete
      await db.product.update({ where: { id }, data: { published: false } });
      return NextResponse.json({
        ok: true,
        unpublished: true,
        message: "Product has orders — it was hidden instead of deleted.",
      });
    }
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete the product." },
      { status: 500 }
    );
  }
}
