import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/product-card";
import { productArt } from "@/lib/art";
import { getSiteSettings, getHomeContent, getSlides, getCustomBanner } from "@/lib/settings";
import NewsletterForm from "./newsletter-form";
import HeroSlideshow from "./hero-slideshow";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, categories, newArrivals, settings, home, slides, banner] = await Promise.all([
    db.product.findMany({
      where: { published: true, featured: true },
      include: { colors: true, images: { orderBy: { sort: "asc" }, take: 1 } },
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
      include: { colors: true, images: { orderBy: { sort: "asc" }, take: 1 } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    getSiteSettings(),
    getHomeContent(),
    getSlides(),
    getCustomBanner(),
  ]);

  const ratings = await db.review.groupBy({
    by: ["productId"],
    where: {
      approved: true,
      productId: { in: [...featured, ...newArrivals].map((p) => p.id) },
    },
    _avg: { rating: true },
    _count: true,
  });

  const withRating = (p: (typeof featured)[number]) => {
    const r = ratings.find((x) => x.productId === p.id);
    return {
      ...p,
      imageUrl: p.imageUrl ?? null,
      images: p.images,
      ratingAvg: r?._avg.rating ?? null,
      ratingCount: r?._count ?? 0,
    };
  };

  return (
    <div>
      {/* Hero */}
      {slides.length > 0 ? (
        <HeroSlideshow slides={slides} />
      ) : (
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 inline-block rounded-full bg-clay/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-clay">
              {home.heroBadge}
            </p>
            <h1 className="font-display text-5xl leading-[1.08] text-balance text-ink sm:text-6xl lg:text-[4.2rem]">
              {home.headlineStart}{" "}
              <span className="italic text-clay">{home.headlineAccent}</span>{" "}
              {home.headlineEnd}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/60 sm:text-lg">
              {home.heroText}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">
                Shop the collection
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
              <Link href="/custom" className="btn-secondary">
                Make it yours
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
                      src={p.images[0]?.url || p.imageUrl || productArt(p.colors.map((c) => c.hex), p.id)}
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
      )}

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
              className="group overflow-hidden rounded-xl2 border border-ink/10 bg-white shadow-card transition hover:-translate-y-1 hover:border-clay/40 hover:shadow-lift"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                {c.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-0 right-0 text-center text-sm font-bold text-white drop-shadow">
                      {c.name}
                    </span>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 transition group-hover:bg-linen">
                    <span className="font-display text-3xl text-clay">{c.name.charAt(0)}</span>
                    <span className="px-2 text-center text-xs font-semibold leading-tight">{c.name}</span>
                  </div>
                )}
              </div>
              <div className="px-3 py-2.5 text-xs text-ink/50">
                {c._count.products} item{c._count.products === 1 ? "" : "s"}
              </div>
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
                <ProductCard key={p.id} product={withRating(p)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Value props */}
      <section className="container-page grid gap-6 py-14 sm:grid-cols-3">
        {[
          ["Free shipping", `On every order over EGP ${settings.freeShippingThreshold.toLocaleString()}, delivered to your door.`],
          ["Cash on delivery", "Pay only when your order arrives, across Egypt."],
          [`${settings.returnsDays}-day returns`, settings.returnsNote + "."],
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
            <ProductCard key={p.id} product={withRating(p)} />
          ))}
        </div>
      </section>

      {/* Custom orders banner — full-width, 3:1, photo layer + fixed button layer */}
      <section className="relative w-full overflow-hidden bg-ink">
        <div className="relative h-[240px] w-full md:aspect-[3/1] md:h-auto md:max-h-[420px]">
          {banner.imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={banner.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/40" />

          <div className="container-page relative flex h-full flex-col items-start justify-center gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {banner.badge && (
                <p className="mb-3 inline-block rounded-full bg-clay px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
                  {banner.badge}
                </p>
              )}
              <h2 className="font-display text-3xl leading-snug text-cream sm:text-4xl">
                {banner.headlineStart}{" "}
                {banner.headlineAccent && (
                  <span className="italic text-clay-light">
                    {banner.headlineAccent}
                  </span>
                )}
              </h2>
              {banner.subtext && (
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/70">
                  {banner.subtext}
                </p>
              )}
            </div>
            <Link
              href={banner.href}
              className="btn-primary shrink-0 !bg-clay hover:!bg-clay-dark"
            >
              {banner.buttonText}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
          </div>
        </div>
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
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
