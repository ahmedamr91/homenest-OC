"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { formatMoney, shippingFor, SHIPPING_THRESHOLD } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, setQty, remove, clear, ready } = useCart();

  if (!ready) {
    return (
      <div className="container-page py-20 text-center text-ink/50">
        Loading cart…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <div className="mb-6 font-display text-7xl text-clay/30">🛒</div>
        <h1 className="font-display text-4xl text-ink">Your cart is empty</h1>
        <p className="mt-3 max-w-sm text-sm text-ink/60">
          Beautiful things are waiting. Browse the collection and pick your colors.
        </p>
        <Link href="/shop" className="btn-primary mt-8">
          Start shopping
        </Link>
      </div>
    );
  }

  const shipping = shippingFor(subtotal);

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.colorId}`}
              className="card flex gap-4 p-4 sm:p-5"
            >
              <span
                aria-hidden
                className="hidden h-20 w-20 shrink-0 rounded-xl sm:block"
                style={{
                  background: `linear-gradient(135deg, ${item.colorHex}cc, ${item.colorHex})`,
                }}
              />
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-semibold leading-snug hover:text-clay"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-ink/60">
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-black/10"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      {item.colorName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatMoney(item.price * item.quantity)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-xs text-ink/50">
                        {formatMoney(item.price)} each
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex h-9 items-center rounded-full border border-ink/15 bg-white">
                    <button
                      onClick={() => setQty(item.productId, item.colorId, item.quantity - 1)}
                      className="px-3 text-ink/60 hover:text-clay"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => setQty(item.productId, item.colorId, item.quantity + 1)}
                      className="px-3 text-ink/60 hover:text-clay"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => remove(item.productId, item.colorId)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clear}
            className="text-sm font-semibold text-ink/50 transition hover:text-red-500"
          >
            Clear cart
          </button>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-2xl">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Subtotal</dt>
                <dd className="font-semibold">{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">Shipping</dt>
                <dd className="font-semibold">
                  {shipping === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    formatMoney(shipping)
                  )}
                </dd>
              </div>
              {shipping > 0 && (
                <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs text-clay">
                  Add {formatMoney(SHIPPING_THRESHOLD - subtotal)} more for free shipping
                </p>
              )}
              <div className="flex justify-between border-t border-ink/10 pt-4 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="font-bold">{formatMoney(subtotal + shipping)}</dd>
              </div>
            </dl>
            <Link href="/checkout" className="btn-primary mt-6 w-full">
              Proceed to checkout
            </Link>
            <Link
              href="/shop"
              className="mt-3 block text-center text-sm font-semibold text-clay hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
