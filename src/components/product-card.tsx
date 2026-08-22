import Link from "next/link";
import { productArt } from "@/lib/art";
import { formatMoney } from "@/lib/utils";

export type CardProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  imageUrl: string | null;
  images?: { id: number; url: string }[];
  colors: { id: number; name: string; hex: string }[];
  ratingAvg?: number | null;
  ratingCount?: number;
};

function Stars({ value }: { value: number }) {
  return (
    <span className="text-[11px] tracking-tight" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? "text-amber-500" : "text-ink/20"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ProductCard({ product }: { product: CardProduct }) {
  const hexes = product.colors.map((c) => c.hex);
  const cover = product.images?.[0]?.url || product.imageUrl || productArt(hexes, product.id);
  const onSale =
    product.comparePrice != null && product.comparePrice > product.price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-xl2 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-clay px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            Sale
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-display text-lg leading-snug text-ink group-hover:text-clay">
          {product.name}
        </h3>
        {product.ratingCount ? (
          <div className="mt-1 flex items-center gap-1.5">
            <Stars value={product.ratingAvg ?? 0} />
            <span className="text-[11px] text-ink/50">({product.ratingCount})</span>
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-ink">
              {formatMoney(product.price)}
            </span>
            {onSale && (
              <span className="text-sm text-ink/40 line-through">
                {formatMoney(product.comparePrice!)}
              </span>
            )}
          </div>
          {product.colors.length > 0 && (
            <div className="flex -space-x-1" aria-hidden>
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c.id}
                  title={c.name}
                  className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="pl-1 text-[10px] font-medium text-ink/50">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
