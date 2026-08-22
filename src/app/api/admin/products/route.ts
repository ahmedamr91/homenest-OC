import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productSchema, slugify } from "@/lib/validators";
import { requireAdmin, readJson } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const products = await db.product.findMany({
    include: { colors: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

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
    let slug = slugify(d.name) || `product-${Date.now()}`;
    if (await db.product.findUnique({ where: { slug } })) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    const product = await db.product.create({
      data: {
        name: d.name,
        slug,
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
      include: { colors: true },
    });
    return NextResponse.json({ ok: true, id: product.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create the product." },
      { status: 500 }
    );
  }
}
