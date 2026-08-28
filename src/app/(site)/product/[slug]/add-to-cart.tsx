"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { productArt } from "@/lib/art";

type Color = { id: number; name: string; hex: string };
type Props = {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    images: { id: number; url: string; colorHex: string | null }[];
    colors: Color[];
  };
};

function Stars({ value }: { value: number }) {
  return (
    <span aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? "text-amber-500" : "text-ink/20"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function AddToCart({ product }: Props) {
  const { add } = useCart();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<Color>(
    product.colors[0] || { id: 0, name: "", hex: "#D6C3A5" }
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  // when color changes, auto-select matching image by colorHex
  useEffect(() => {
    const idx = product.images.findIndex(
      (im) => im.colorHex && im.colorHex.toLowerCase() === selectedColor.hex.toLowerCase()
    );
    if (idx !== -1) setActiveImg(idx);
  }, [selectedColor.hex, product.images]);

  const hasPhotos = product.images.length > 0;
  const tintedArt = productArt([selectedColor.hex], product.id);

  const outOfStock = product.stock === 0;

  function handleAdd(goToCart = false) {
    if (outOfStock) return;
    add(
      {
        productId: product.id,
        colorId: selectedColor.id || null,
        slug: product.slug,
        name: product.name,
        price: product.price,
        maxStock: product.stock,
        colorName: selectedColor.name || "Default",
        colorHex: selectedColor.hex,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    if (goToCart) router.push("/cart");
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl2 bg-white shadow-card">
        <div className="relative aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hasPhotos ? product.images[activeImg]?.url : tintedArt}
            alt={product.name}
            className={`h-full w-full object-cover ${hasPhotos ? "" : "transition-all duration-500"}`}
          />
          {!hasPhotos && selectedColor.name && (
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">
              Shown in {selectedColor.name}
            </span>
          )}
        </div>
        {hasPhotos && product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-ink/10 p-4">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImg(i)}
                aria-label={`Photo ${i + 1}`}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  activeImg === i ? "border-clay ring-2 ring-clay/30" : "border-ink/10 hover:border-ink/30"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {product.colors.length > 1 && (
        <div>
          <span className="label">Available colors</span>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c)}
                title={c.name}
                aria-pressed={selectedColor.id === c.id}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selectedColor.id === c.id
                    ? "border-clay bg-clay/10 text-clay"
                    : "border-ink/15 bg-white text-ink/70 hover:border-clay/50"
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-[52px] w-fit items-center rounded-full border border-ink/15 bg-white">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={outOfStock}
            className="px-4 text-lg text-ink/60 transition hover:text-clay disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-bold">{qty}</span>
          <button
            onClick={() => setQty(Math.min(product.stock, 99, qty + 1))}
            disabled={outOfStock}
            className="px-4 text-lg text-ink/60 transition hover:text-clay disabled:opacity-40"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button onClick={() => handleAdd(false)} disabled={outOfStock} className="btn-primary flex-1">
          {outOfStock ? "Out of stock" : added ? "✓ Added to cart" : "Add to cart"}
        </button>
      </div>

      {!outOfStock && (
        <button onClick={() => handleAdd(true)} className="btn-secondary w-full">
          Buy now — go to checkout
        </button>
      )}
    </div>
  );
}
