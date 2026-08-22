"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney, ORDER_STATUSES, STATUS_STYLES } from "@/lib/utils";

function waLink(phone: string, text: string): string {
  let d = phone.replace(/[^0-9]/g, "");
  if (d.startsWith("0")) d = `20${d.slice(1)}`;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}
type OrderItem = {
  id: number;
  name: string;
  colorName: string;
  colorHex: string;
  price: number;
  quantity: number;
};

type Order = {
  id: number;
  number: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  subtotal: number;
  discountCode: string | null;
  discount: number;
  shipping: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function OrdersTable({ initial }: { initial: Order[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");

  async function updateStatus(id: number, status: string) {
    setBusy(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  const filtered =
    filter === "ALL" ? initial : initial.filter((o) => o.status === filter);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {["ALL", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              filter === s
                ? "bg-ink text-cream"
                : "border border-ink/15 bg-white text-ink/60 hover:border-clay"
            }`}
          >
            {s}
            {s !== "ALL" && (
              <span className="ml-1.5 opacity-60">
                {initial.filter((o) => o.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((o) => (
          <div key={o.id} className="card overflow-hidden">
            <button
              onClick={() => setOpenId(openId === o.id ? null : o.id)}
              className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-left transition hover:bg-sand/40"
              aria-expanded={openId === o.id}
            >
              <span className="font-mono text-sm font-bold text-clay">{o.number}</span>
              <span className="min-w-[140px] flex-1 truncate text-sm font-medium">
                {o.customerName} · {o.city}
              </span>
              <span className="text-xs text-ink/50">
                {new Date(o.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {" · "}
                {o.items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
              <span className="text-sm font-bold">{formatMoney(o.total)}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[o.status]}`}
              >
                {o.status}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={`text-ink/40 transition-transform ${openId === o.id ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {openId === o.id && (
              <div className="grid gap-6 border-t border-ink/10 bg-sand/20 px-5 py-5 md:grid-cols-[1.3fr_1fr]">
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/50">Items</h3>
                  <ul className="space-y-2.5 text-sm">
                    {o.items.map((i) => (
                      <li key={i.id} className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span
                            aria-hidden
                            className="inline-block h-5 w-5 shrink-0 rounded border border-black/10"
                            style={{ backgroundColor: i.colorHex }}
                          />
                          <span className="truncate">
                            {i.quantity}× {i.name}{" "}
                            <span className="text-ink/40">({i.colorName})</span>
                          </span>
                        </span>
                        <span className="shrink-0 font-semibold">
                          {formatMoney(i.price * i.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-4 space-y-1.5 border-t border-dashed border-ink/20 pt-3 text-sm">
                    <div className="flex justify-between text-ink/60">
                      <dt>Subtotal</dt><dd>{formatMoney(o.subtotal)}</dd>
                    </div>
                    {o.discount != null && o.discount > 0 && (
                      <div className="flex justify-between font-medium text-emerald-600">
                        <dt>Discount ({o.discountCode})</dt>
                        <dd>−{formatMoney(o.discount)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between text-ink/60">
                      <dt>Shipping</dt><dd>{o.shipping === 0 ? "FREE" : formatMoney(o.shipping)}</dd>
                    </div>
                    <div className="flex justify-between font-bold">
                      <dt>Total (cash on delivery)</dt><dd>{formatMoney(o.total)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink/50">
                      Customer
                    </h3>
                    <p className="text-sm leading-relaxed text-ink/70">
                      <strong className="text-ink">{o.customerName}</strong><br />
                      {o.address}, {o.city}<br />
                      {o.phone}<br />
                      {o.email}
                    </p>
                    {o.notes && (
                      <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs italic text-ink/60">
                        “{o.notes}”
                      </p>
                    )}
                  </div>

                  <a
                    href={waLink(
                      o.phone,
                      `Hello ${o.customerName}! Your Empty Corner order ${o.number} (${formatMoney(
                        o.total
                      )} cash on delivery) is being prepared. We'll confirm delivery soon 🏡`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white transition hover:brightness-95"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1 0 12.04 2Zm5.8 14.2c-.25.7-1.45 1.35-2 1.4-.5.05-1.15.25-3.85-.8-3.25-1.3-5.3-4.6-5.45-4.8-.15-.2-1.3-1.75-1.3-3.35s.85-2.35 1.15-2.65c.3-.3.65-.4.85-.4h.6c.2 0 .45-.05.7.55.25.6.85 2.1.9 2.25.05.15.1.3 0 .5-.1.2-.15.35-.3.55l-.45.5c-.15.15-.3.3-.15.6.15.3.7 1.2 1.5 1.95 1.05.95 1.9 1.25 2.2 1.4.3.15.45.1.65-.05.2-.15.75-.85.95-1.15.2-.3.4-.25.65-.15.25.1 1.65.8 1.95.95.3.15.5.2.55.35.05.1.05.75-.2 1.45Z" />
                    </svg>
                    WhatsApp customer
                  </a>

                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink/50">
                      Update status
                    </h3>
                    <select
                      value={o.status}
                      disabled={busy}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="input cursor-pointer font-semibold"
                      aria-label={`Status for order ${o.number}`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card p-14 text-center text-sm text-ink/50">
            No orders with this status yet.
          </div>
        )}
      </div>
    </div>
  );
}
