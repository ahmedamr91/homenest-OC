import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/product-card";
import { productArt } from "@/lib/art";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories, newArrivals] = await Promise.all([
    db.product.findMany({
      where: { published: true, featured: true },
      include: { colors: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      take: 6,
      orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { published: true } } } } },
    }),
    db.product.findMany({
      where: { published: true },
      include: { colors: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 inline-block rounded-full bg-clay/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-clay">
              New season · New colors
            </p>
            <h1 className="font-display text-5xl leading-[1.08] text-balance text-ink sm:text-6xl lg:text-[4.2rem]">
              Beautiful things make a{" "}
              <span className="italic text-clay">house</span> a home.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/60 sm:text-lg">
              Lamps, vases, cushions and mirrors — every piece available in the
              colors that fit your space. Choose yours.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">
                Shop the collection
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
              <Link href="/shop?sort=price-asc" className="btn-secondary">
                Best prices
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className={`group overflow-hidden rounded-xl2 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift ${
                    i % 2 === 1 ? "translate-y-6" : ""
                  }`}
                >
                  <div className="aspect-square overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl || productArt(p.colors.map((c) => c.hex), p.id)}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-title">Shop by room &amp; mood</h2>
          <Link href="/shop" className="text-sm font-semibold text-clay hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="group rounded-xl2 border border-ink/10 bg-white p-5 text-center shadow-card transition hover:border-clay/40 hover:shadow-lift"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sand font-display text-xl text-clay transition group-hover:bg-clay group-hover:text-white">
                {c.name.charAt(0)}
              </div>
              <div className="text-sm font-semibold leading-tight">{c.name}</div>
              <div className="mt-1 text-xs text-ink/50">{c._count.products} items</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured strip */}
      {featured.length > 0 && (
        <section className="border-y border-ink/10 bg-white/60 py-14">
          <div className="container-page">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="section-title">Featured favorites</h2>
              <Link href="/shop" className="text-sm font-semibold text-clay hover:underline">
                Shop all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Value props */}
      <section className="container-page grid gap-6 py-14 sm:grid-cols-3">
        {[
          ["Free shipping", "On every order over $75, delivered to your door."],
          ["Cash on delivery", "Pay only when your order arrives at your door."],
          ["30-day returns", "Changed your mind? Send it back within 30 days."],
        ].map(([title, desc]) => (
          <div key={title} className="rounded-xl2 bg-white p-6 shadow-card">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-clay/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B4552D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h3 className="font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-ink/60">{desc}</p>
          </div>
        ))}
      </section>

      {/* New arrivals */}
      <section className="container-page pb-6 pt-4">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-title">New arrivals</h2>
          <Link href="/shop?sort=newest" className="text-sm font-semibold text-clay hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Custom orders banner */}
      <section className="container-page pb-4">
        <Link
          href="/custom"
          className="group relative block overflow-hidden rounded-xl2 bg-ink px-6 py-12 sm:px-12"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-clay/20 blur-3xl transition group-hover:bg-clay/30" />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-3 inline-block rounded-full bg-clay px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
                New service
              </p>
              <h2 className="font-display text-3xl leading-snug text-cream sm:text-4xl">
                Have a piece in mind? <span className="italic text-clay-light">We&apos;ll make it.</span>
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/70">
                Send us a photo of your dream piece, pick your colors, and our
                makers will bring it to life. Quote within 48 hours.
              </p>
            </div>
            <span className="btn-primary shrink-0 !bg-clay hover:!bg-clay-dark">
              Make it yours
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </div>
        </Link>
      </section>

      {/* Newsletter */}
      <section className="container-page py-16">
        <div className="rounded-xl2 bg-ink px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-3xl text-cream sm:text-4xl">
            Get 10% off your first order
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-cream/70">
            Join our list for early access to new collections and color drops.
          </p>
          <form
            action="/shop"
            method="get"
            className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              className="w-full rounded-full bg-cream/10 px-5 py-3 text-sm text-cream placeholder:text-cream/50 focus:border-clay focus:outline-none"
            />
            <button type="submit" className="btn-primary shrink-0 !px-6 !bg-clay hover:!bg-clay-dark">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
