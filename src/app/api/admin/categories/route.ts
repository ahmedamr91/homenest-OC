import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categorySchema, slugify } from "@/lib/validators";
import { requireAdmin, readJson } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await readJson(req);
  if (body == null)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Name is required (2–80 chars)." }, { status: 400 });

  try {
    const slug = slugify(parsed.data.name) || `cat-${Date.now().toString(36)}`;
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing)
      return NextResponse.json({ error: "A similar category already exists." }, { status: 409 });

    const category = await db.category.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
      },
    });
    return NextResponse.json({ ok: true, id: category.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create the category." }, { status: 500 });
  }
}
