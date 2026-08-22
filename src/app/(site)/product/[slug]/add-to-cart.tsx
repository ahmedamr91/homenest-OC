"use client";

import { useState } from "react";
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
    colors: Color[];
  };
  artBase: string | null;
};

export default function AddToCart({ product, artBase }: Props) {
  const { add } = useCart();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<Color>(
    product.colors[0] || { id: 0, name: "", hex: "#D6C3A5" }
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const art =
    artBase ||
    (product.imageUrl
      ? product.imageUrl
      : productArt([selectedColor.hex], product.id));

  const preview = artBase ? productArt([selectedColor.hex], product.id) : art;

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
          <img src={preview} alt={product.name} className="h-full w-full object-cover transition-all duration-500" />
        </div>
        {product.colors.length > 1 && (
          <div className="flex gap-2 border-t border-ink/10 p-4">
            {product.colors.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c)}
                aria-label={`View ${c.name}`}
                className={`h-12 w-12 rounded-xl border-2 transition ${
                  selectedColor.id === c.id
                    ? "border-clay ring-2 ring-clay/30"
                    : "border-ink/10 hover:border-ink/30"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}
      </div>

      {product.colors.length > 0 && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="label !mb-0">Available colors</span>
            <span className="text-sm font-semibold text-clay">{selectedColor.name}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
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

        <button
          onClick={() => handleAdd(false)}
          disabled={outOfStock}
          className="btn-primary flex-1"
        >
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
