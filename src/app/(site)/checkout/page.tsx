"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";
import { formatMoney } from "@/lib/utils";
import { EG_CITIES } from "@/lib/shipping";
import type { ShippingSettings } from "@/lib/settings";

export default function CheckoutPage() {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [city, setCity] = useState<string>("Cairo");
  const [config, setConfig] = useState<ShippingSettings | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number; message: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  const discount = coupon?.discount ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = (() => {
    if (!items.length || !config) return 0;
    if (discountedSubtotal >= config.freeShippingThreshold) return 0;
    return config.cityFees[city] ?? config.flatShippingFee;
  })();
  const total = discountedSubtotal + shipping;

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({ code: data.code, discount: data.discount, message: data.message });
        setCouponMsg({ ok: true, text: `${data.message} You save ${formatMoney(data.discount)}.` });
      } else {
        setCoupon(null);
        setCouponMsg({ ok: false, text: data.message || "Invalid code." });
      }
    } catch {
      setCouponMsg({ ok: false, text: "Could not check the code. Try again." });
    } finally {
      setCheckingCoupon(false);
    }
  }

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
          city,
          notes: fd.get("notes") || null,
          discountCode: coupon?.code ?? null,
          items: items.map((i) => ({
            productId: i.productId,
            colorId: i.colorId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
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
                <label htmlFor="phone" className="label">Phone / WhatsApp *</label>
                <input id="phone" name="phone" required pattern="[+0-9\s()-]{6,}" title="Valid phone number" className="input" autoComplete="tel" placeholder="+20 100 000 0000" />
              </div>
              <div>
                <label htmlFor="city" className="label">City *</label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input cursor-pointer"
                >
                  {EG_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="address" className="label">Street address *</label>
                <input id="address" name="address" required minLength={5} maxLength={300} className="input" autoComplete="street-address" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="label">Order notes (optional)</label>
                <textarea id="notes" name="notes" rows={3} maxLength={1000} className="input resize-none" placeholder="Delivery instructions, landmark, preferred time…" />
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-sand/70 px-3 py-2 text-xs text-ink/60">
              🚚 Shipping to <strong>{city}</strong>:{" "}
              {shipping === 0 ? "FREE" : formatMoney(shipping)} · free everywhere on orders over {formatMoney(config?.freeShippingThreshold ?? 3000)}
            </p>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 font-display text-xl">Payment</h2>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-clay bg-clay/5 p-4">
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
            <ul className="mt-4 max-h-56 space-y-3 overflow-auto pr-1 text-sm">
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

            {/* Promo code */}
            <div className="mt-5 border-t border-dashed border-ink/15 pt-4">
              <label htmlFor="promo" className="label">Promo code</label>
              <div className="flex gap-2">
                <input
                  id="promo"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="input !py-2 font-mono uppercase"
                  maxLength={40}
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={checkingCoupon || !couponInput.trim()}
                  className="shrink-0 rounded-xl bg-ink px-4 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-clay disabled:opacity-40"
                >
                  {checkingCoupon ? "…" : "Apply"}
                </button>
              </div>
              {couponMsg && (
                <p className={`mt-2 text-xs font-medium ${couponMsg.ok ? "text-emerald-600" : "text-red-500"}`}>
                  {couponMsg.ok ? "✓ " : "✕ "}
                  {couponMsg.text}
                </p>
              )}
            </div>

            <dl className="mt-5 space-y-3 border-t border-ink/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Subtotal</dt>
                <dd className="font-semibold">{formatMoney(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <dt>Discount ({coupon?.code})</dt>
                  <dd className="font-semibold">−{formatMoney(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink/60">Shipping to {city}</dt>
                <dd className="font-semibold">
                  {shipping === 0 ? <span className="text-emerald-600">FREE</span> : formatMoney(shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-3 text-base">
                <dt className="font-bold">Total (cash)</dt>
                <dd className="font-bold">{formatMoney(total)}</dd>
              </div>
            </dl>

            {error && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
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
