import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { productArt } from "@/lib/art";
import ProductCard, { type CardProduct } from "@/components/product-card";
import AddToCart from "./add-to-cart";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { colors: true, category: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  return { title: product?.name || "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product || !product.published) notFound();

  const related = await db.product.findMany({
    where: { published: true, categoryId: product.categoryId, id: { not: product.id } },
    include: { colors: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-10">
      <nav className="mb-8 flex items-center gap-2 text-sm text-ink/50" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-clay">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-clay">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-clay">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <AddToCart
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl,
            colors: product.colors.map((c) => ({
              id: c.id,
              name: c.name,
              hex: c.hex,
            })),
          }}
          artBase={product.imageUrl ? null : productArt(product.colors.map((c) => c.hex), product.id)}
        />

        <div className="lg:py-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-clay">
            {product.category.name}
          </p>
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-ink">
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice != null && product.comparePrice > product.price && (
              <>
                <span className="text-xl text-ink/40 line-through">
                  ${product.comparePrice.toFixed(2)}
                </span>
                <span className="rounded-full bg-clay/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-clay">
                  Save {Math.round((1 - product.price / product.comparePrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <div className="mt-3 text-sm">
            {product.stock > 5 ? (
              <span className="font-medium text-emerald-700">● In stock</span>
            ) : product.stock > 0 ? (
              <span className="font-medium text-amber-600">
                ● Only {product.stock} left in stock
              </span>
            ) : (
              <span className="font-medium text-red-600">● Out of stock</span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-ink/70">{product.description}</p>

          <dl className="mt-8 space-y-2 border-t border-ink/10 pt-6 text-sm text-ink/60">
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="font-medium text-ink">Free over $75 · otherwise $9.95</dd>
            </div>
            <div className="flex justify-between">
              <dt>Payment</dt>
              <dd className="font-medium text-ink">Cash on delivery</dd>
            </div>
            <div className="flex justify-between">
              <dt>Returns</dt>
              <dd className="font-medium text-ink">30 days, no questions asked</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title mb-8">You may also like</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p as CardProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
