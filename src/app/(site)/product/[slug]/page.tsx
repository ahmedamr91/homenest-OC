import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import ProductCard from "@/components/product-card";
import { formatMoney, SHIPPING_FEE, SHIPPING_THRESHOLD } from "@/lib/utils";
import AddToCart from "./add-to-cart";
import ReviewForm from "./review-form";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      colors: true,
      images: { orderBy: { sort: "asc" } },
      category: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
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

function Stars({ value }: { value: number }) {
  return (
    <span aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? "text-amber-500" : "text-ink/25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product || !product.published) notFound();

  const [related, agg] = await Promise.all([
    db.product.findMany({
      where: { published: true, categoryId: product.categoryId, id: { not: product.id } },
      include: { colors: true, images: { orderBy: { sort: "asc" }, take: 1 } },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    db.review.aggregate({
      where: { productId: product.id, approved: true },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  const relatedRatings = await db.review.groupBy({
    by: ["productId"],
    where: { approved: true, productId: { in: related.map((r) => r.id) } },
    _avg: { rating: true },
    _count: true,
  });

  const ratingAvg = agg._avg.rating ?? 0;
  const ratingCount = agg._count;

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
            images: product.images.map((i) => ({ id: i.id, url: i.url })),
            colors: product.colors.map((c) => ({ id: c.id, name: c.name, hex: c.hex })),
          }}
        />

        <div className="lg:py-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-clay">
            {product.category.name}
          </p>
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            {product.name}
          </h1>

          {ratingCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Stars value={ratingAvg} />
              <span className="text-sm text-ink/60">
                {ratingAvg.toFixed(1)} · {ratingCount} review{ratingCount === 1 ? "" : "s"}
              </span>
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-ink">
              {formatMoney(product.price)}
            </span>
            {product.comparePrice != null && product.comparePrice > product.price && (
              <>
                <span className="text-xl text-ink/40 line-through">
                  {formatMoney(product.comparePrice)}
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
              <dd className="font-medium text-ink">
                Free over {formatMoney(SHIPPING_THRESHOLD)} · from {formatMoney(SHIPPING_FEE)}
              </dd>
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

      {/* Reviews */}
      <section id="reviews" className="mt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Customer reviews</h2>
            {ratingCount > 0 && (
              <p className="mt-2 flex items-center gap-2 text-sm text-ink/60">
                <Stars value={ratingAvg} />
                {ratingAvg.toFixed(1)} out of 5 · based on {ratingCount} review
                {ratingCount === 1 ? "" : "s"}
              </p>
            )}
          </div>
          <ReviewForm productId={product.id} />
        </div>

        {product.reviews.length === 0 ? (
          <p className="rounded-xl2 border border-dashed border-ink/15 p-8 text-center text-sm text-ink/50">
            No reviews yet — be the first to share your thoughts.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {product.reviews.map((r) => (
              <li key={r.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <Stars value={r.rating} />
                  <span className="text-xs text-ink/40">
                    {new Date(r.createdAt).toLocaleDateString("en-EG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="mt-2 font-semibold">{r.name}</div>
                {r.comment && (
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title mb-8">You may also like</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((p) => {
              const r = relatedRatings.find((x) => x.productId === p.id);
              return (
                <ProductCard
                  key={p.id}
                  product={{
                    ...p,
                    imageUrl: p.imageUrl ?? null,
                    images: p.images,
                    ratingAvg: r?._avg.rating ?? null,
                    ratingCount: r?._count ?? 0,
                  }}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
