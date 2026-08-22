import { db } from "@/lib/db";
import CategoryManager from "./category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Categories</h1>
      <p className="mt-1 text-sm text-ink/60">
        Organize products into collections customers can browse.
      </p>
      <CategoryManager
        initial={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: c.imageUrl,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}
