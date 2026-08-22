"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { formatMoney, shippingFor } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fd.get("customerName"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          address: fd.get("address"),
          city: fd.get("city"),
          notes: fd.get("notes") || null,
          items: items.map((i) => ({
            productId: i.productId,
            colorId: i.colorId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      clear();
      router.push(`/order/${data.number}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (ready && items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <h1 className="font-display text-4xl text-ink">Nothing to check out</h1>
        <p className="mt-3 text-sm text-ink/60">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary mt-8">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">Checkout</h1>
      <p className="mt-2 text-sm text-ink/60">
        Pay with cash when your order arrives. No card needed.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-5 font-display text-xl">Contact &amp; delivery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="customerName" className="label">Full name *</label>
                <input id="customerName" name="customerName" required minLength={2} maxLength={120} className="input" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="email" className="label">Email *</label>
                <input id="email" name="email" type="email" required maxLength={200} className="input" autoComplete="email" />
              </div>
              <div>
                <label htmlFor="phone" className="label">Phone *</label>
                <input id="phone" name="phone" required pattern="[+0-9\s()-]{6,}" title="Valid phone number" className="input" autoComplete="tel" placeholder="+20 100 000 0000" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="label">Street address *</label>
                <input id="address" name="address" required minLength={5} maxLength={300} className="input" autoComplete="street-address" />
              </div>
              <div>
                <label htmlFor="city" className="label">City *</label>
                <input id="city" name="city" required minLength={2} maxLength={100} className="input" autoComplete="address-level2" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="label">Order notes (optional)</label>
                <textarea id="notes" name="notes" rows={3} maxLength={1000} className="input resize-none" placeholder="Delivery instructions, landmark, preferred time…" />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-xl">Payment</h2>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-clay bg-clay/5 p-4">
              <input type="radio" checked readOnly className="mt-1 accent-[#B4552D]" />
              <span>
                <span className="block font-semibold">Cash on delivery</span>
                <span className="text-sm text-ink/60">
                  Pay in cash to the courier when your order arrives.
                </span>
              </span>
            </label>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-xl">Your order</h2>
            <ul className="mt-4 max-h-64 space-y-3 overflow-auto pr-1 text-sm">
              {items.map((i) => (
                <li key={`${i.productId}-${i.colorId}`} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-ink/70">
                    {i.quantity}× {i.name}
                    <span
                      className="ml-2 inline-block h-2.5 w-2.5 rounded-full border border-black/10 align-middle"
                      style={{ backgroundColor: i.colorHex }}
                      title={i.colorName}
                    />
                  </span>
                  <span className="shrink-0 font-semibold">
                    {formatMoney(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-3 border-t border-ink/10 pt-4 text-sm">
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
              <div className="flex justify-between border-t border-ink/10 pt-3 text-base">
                <dt className="font-bold">Total (cash)</dt>
                <dd className="font-bold">{formatMoney(total)}</dd>
              </div>
            </dl>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="btn-primary mt-6 w-full"
            >
              {submitting ? "Placing order…" : `Place order · ${formatMoney(total)}`}
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-ink/50">
              🔒 Your details are validated and stored securely. Prices are
              confirmed server-side at checkout.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
