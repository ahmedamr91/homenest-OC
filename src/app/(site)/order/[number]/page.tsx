import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney, STATUS_STYLES } from "@/lib/utils";
import { waLink, waPhone } from "@/lib/wa";
import OrderWhatsApp from "./order-whatsapp";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: { number: string };
}) {
  const order = await db.order.findUnique({
    where: { number: params.number },
    include: { items: true },
  });
  if (!order) notFound();

  const wa = waLink(
    order.phone,
    `Hi Empty Corner! I just placed order ${order.number} (${order.items.reduce(
      (s, i) => s + i.quantity,
      0
    )} items, EGP ${order.total.toFixed(0)} cash on delivery). Confirming my order 👋`
  );

  return (
    <div className="container-page flex flex-col items-center py-14">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h1 className="font-display text-4xl text-ink sm:text-5xl">Thank you!</h1>
      <p className="mt-3 max-w-md text-center text-sm text-ink/60">
        Your order has been received and is being prepared. We&apos;ll contact you
        shortly to confirm delivery.
      </p>

      <div className="card mt-10 w-full max-w-xl p-7">
        <div className="flex items-center justify-between border-b border-dashed border-ink/20 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-ink/50">Order number</div>
            <div className="mt-1 font-mono font-bold text-clay">{order.number}</div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[order.status]}`}
          >
            {order.status}
          </span>
        </div>

        <ul className="space-y-3 py-5 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2.5 text-ink/70">
                <span
                  className="inline-block h-6 w-6 shrink-0 rounded-md border border-black/10"
                  style={{ backgroundColor: item.colorHex }}
                  title={item.colorName}
                />
                <span className="truncate">
                  {item.quantity}× {item.name}{" "}
                  <span className="text-ink/40">({item.colorName})</span>
                </span>
              </span>
              <span className="shrink-0 font-semibold">
                {formatMoney(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2.5 border-t border-dashed border-ink/20 pt-4 text-sm">
          <div className="flex justify-between text-ink/60">
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between font-medium text-emerald-600">
              <dt>Discount ({order.discountCode})</dt>
              <dd>−{formatMoney(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-ink/60">
            <dt>Shipping to {order.city}</dt>
            <dd>{order.shipping === 0 ? "FREE" : formatMoney(order.shipping)}</dd>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold">
            <dt>Cash to pay on arrival</dt>
            <dd>{formatMoney(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-5 rounded-lg bg-sand/70 p-4 text-xs leading-relaxed text-ink/60">
          Delivering to: <strong className="text-ink">{order.customerName}</strong>,{" "}
          {order.address}, {order.city} · {order.phone}
        </div>
      </div>

      {wa && <OrderWhatsApp href={wa} />}

      <Link href="/shop" className="btn-secondary mt-4">
        Continue shopping
      </Link>
    </div>
  );
}
