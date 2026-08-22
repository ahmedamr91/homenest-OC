import Link from "next/link";
import { db } from "@/lib/db";
import ProductRow from "./product-row";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { colors: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Products</h1>
          <p className="mt-1 text-sm text-ink/60">
            {products.length} product(s) · manage details, stock and colors
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary !px-5 !py-2.5">
          ＋ New product
        </Link>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-sand/40 text-left text-xs uppercase tracking-wider text-ink/50">
              <th className="px-5 py-3.5 font-bold">Product</th>
              <th className="px-4 py-3.5 font-bold">Category</th>
              <th className="px-4 py-3.5 font-bold">Colors</th>
              <th className="px-4 py-3.5 font-bold">Price</th>
              <th className="px-4 py-3.5 font-bold">Stock</th>
              <th className="px-4 py-3.5 font-bold">Status</th>
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  comparePrice: p.comparePrice,
                  stock: p.stock,
                  published: p.published,
                  featured: p.featured,
                  category: p.category.name,
                  colors: p.colors.map((c) => ({ id: c.id, name: c.name, hex: c.hex })),
                }}
              />
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center text-ink/50">
                  No products yet — create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-ink/50">
        Tip: products that already appear in orders are hidden (unpublished) instead of deleted, so order history stays intact.
      </p>
    </div>
  );
}
