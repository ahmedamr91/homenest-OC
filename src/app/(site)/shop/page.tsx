import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/product-card";
import ShopFilters from "./filters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

type SearchParams = {
  category?: string;
  color?: string;
  min?: string;
  max?: string;
  q?: string;
  sort?: string;
  page?: string;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => !!v) as [string, string][]
  );

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { published: true } } } } },
  });
  const allColors = await db.productColor.findMany({
    distinct: ["name"],
    select: { name: true },
    orderBy: { name: "asc" },
  });

  const where: Record<string, unknown> = { published: true };
  if (searchParams.category) {
    const cat = categories.find((c) => c.slug === searchParams.category);
    where.categoryId = cat ? cat.id : -1;
  }
  if (searchParams.color) {
    where.colors = { some: { name: searchParams.color } };
  }
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { description: { contains: searchParams.q } },
    ];
  }
  const priceFilter: Record<string, number> = {};
  const min = Number(searchParams.min);
  const max = Number(searchParams.max);
  if (!Number.isNaN(min) && searchParams.min) priceFilter.gte = min;
  if (!Number.isNaN(max) && searchParams.max) priceFilter.lte = max;
  if (Object.keys(priceFilter).length) where.price = priceFilter;

  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  switch (searchParams.sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
  }

  const page = Math.max(1, Number(searchParams.page) || 1);
  const total = await db.product.count({ where });
  const products = await db.product.findMany({
    where,
    include: { colors: true, category: true },
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          {searchParams.category
            ? categories.find((c) => c.slug === searchParams.category)?.name ||
              "Shop"
            : "Shop All"}
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          {total} product{total === 1 ? "" : "s"} found
          {searchParams.q ? ` for “${searchParams.q}”` : ""}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <ShopFilters
          categories={categories.map((c) => ({
            slug: c.slug,
            name: c.name,
            count: c._count.products,
          }))}
          colors={allColors.map((c) => c.name)}
          current={Object.fromEntries(sp.entries())}
        />

        <div>
          {products.length === 0 ? (
            <div className="card flex flex-col items-center justify-center p-16 text-center">
              <div className="mb-4 font-display text-5xl text-clay">∅</div>
              <h3 className="text-lg font-semibold">Nothing matches those filters</h3>
              <p className="mt-1 text-sm text-ink/60">
                Try removing a filter or browsing everything.
              </p>
              <Link href="/shop" className="btn-secondary mt-6 !px-6 !py-2.5">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => {
                const p = new URLSearchParams(sp);
                p.set("page", String(n));
                return (
                  <Link
                    key={n}
                    href={`/shop?${p.toString()}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                      n === page
                        ? "bg-ink text-cream"
                        : "border border-ink/15 bg-white text-ink hover:border-clay"
                    }`}
                  >
                    {n}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
