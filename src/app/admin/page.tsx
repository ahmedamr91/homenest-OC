import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney, STATUS_STYLES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const since = new Date(Date.now() - 13 * 86_400_000);
  since.setHours(0, 0, 0, 0);

  const [
    orderCount,
    productCount,
    categoryCount,
    revenueAgg,
    recentOrders,
    lowStock,
    newCustom,
    pendingReviews,
    recentByDay,
    bestSellers,
    subscribers,
  ] = await Promise.all([
    db.order.count(),
    db.product.count(),
    db.category.count(),
    db.order.aggregate({ _sum: { total: true } }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    db.product.findMany({
      where: { published: true, stock: { lte: 10 } },
      orderBy: { stock: "asc" },
      take: 5,
      include: { colors: true },
    }),
    db.customRequest.count({ where: { status: "NEW" } }),
    db.review.count({ where: { approved: false } }),
    db.order.findMany({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select: { createdAt: true, total: true },
    }),
    db.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    db.subscriber.count(),
  ]);

  // Build a 14-day series (EGP)
  const days: { label: string; total: number }[] = [];
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    days.push({ label: d.toLocaleDateString("en-EG", { weekday: "narrow" }), total: 0 });
  }
  const byDay = new Map<string, number>();
  for (const row of recentByDay) {
    const k = dayKey(new Date(row.createdAt));
    byDay.set(k, (byDay.get(k) || 0) + (row.total || 0));
  }
  days.forEach((d, idx) => {
    const k = dayKey(new Date(Date.now() - (13 - idx) * 86_400_000));
    d.total = byDay.get(k) || 0;
  });
  const maxDay = Math.max(...days.map((d) => d.total), 1);

  const bestItems = await Promise.all(
    bestSellers.map(async (b) => {
      const p = await db.product.findUnique({
        where: { id: b.productId },
        select: { name: true },
      });
      return { name: p?.name || "Deleted product", qty: b._sum.quantity || 0 };
    })
  );
  const maxQty = Math.max(...bestItems.map((b) => b.qty), 1);

  const revenue = revenueAgg._sum.total || 0;
  const pending = await db.order.count({ where: { status: "PENDING" } });

  const stats = [
    ["Total revenue", formatMoney(revenue), `${orderCount} orders · ${pending} pending`],
    ["Products", String(productCount), `${categoryCount} categories`],
    ["Needs attention", String(pendingReviews + newCustom), `${pendingReviews} reviews · ${newCustom} custom requests`],
    ["Newsletter", String(subscribers), "subscribers"],
  ] as const;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, note]) => (
          <div key={label} className="card p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-ink/50">{label}</div>
            <div className="mt-2 font-display text-3xl text-ink">{value}</div>
            <div className="mt-1 text-xs text-ink/50">{note}</div>
          </div>
        ))}
      </div>

      {/* 14-day revenue chart */}
      <section className="card mt-8 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Revenue — last 14 days</h2>
          <span className="text-xs text-ink/50">cancelled orders excluded</span>
        </div>
        <div className="flex h-40 items-end gap-1.5">
          {days.map((d, i) => (
            <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className={`w-full rounded-t-md transition-all ${d.total > 0 ? "bg-clay group-hover:bg-clay-dark" : "bg-sand"}`}
                style={{ height: d.total > 0 ? `${Math.max(6, (d.total / maxDay) * 100)}%` : "3px" }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[10px] font-bold text-cream group-hover:block">
                {formatMoney(d.total)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-ink/40">
          <span>14 days ago</span>
          <span>Today</span>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-clay hover:underline">
              View all →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink/50">
              No orders yet. They&apos;ll appear here as customers check out.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-ink/50">
                  <th className="px-6 py-3 font-bold">Order</th>
                  <th className="px-6 py-3 font-bold">Customer</th>
                  <th className="px-6 py-3 font-bold">Total</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-ink/5 last:border-0 hover:bg-sand/40">
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs font-semibold text-clay">{o.number}</span>
                      <div className="mt-0.5 text-xs text-ink/50">{o.items.length} item(s)</div>
                    </td>
                    <td className="px-6 py-3.5">
                      {o.customerName}
                      <div className="text-xs text-ink/50">{o.city}</div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold">{formatMoney(o.total)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <div className="space-y-6">
          <section className="card overflow-hidden self-start">
            <div className="border-b border-ink/10 px-6 py-4">
              <h2 className="font-semibold">Best sellers</h2>
            </div>
            {bestItems.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-ink/50">No sales data yet.</p>
            ) : (
              <ul className="space-y-3 px-6 py-4">
                {bestItems.map((b, i) => (
                  <li key={i}>
                    <div className="flex justify-between text-sm">
                      <span className="min-w-0 truncate pr-2 font-medium">{b.name}</span>
                      <span className="shrink-0 font-bold text-clay">{b.qty}×</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand">
                      <div className="h-full rounded-full bg-clay" style={{ width: `${(b.qty / maxQty) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card overflow-hidden self-start">
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <h2 className="font-semibold">Low stock alerts</h2>
              <span className="rounded-full bg-clay/10 px-2.5 py-1 text-[11px] font-bold text-clay">≤ 10 left</span>
            </div>
            {lowStock.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-ink/50">
                All products are well stocked. 🎉
              </p>
            ) : (
              <ul className="divide-y divide-ink/5">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-6 py-3.5">
                    <span
                      aria-hidden
                      className="h-9 w-9 shrink-0 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${p.colors[0]?.hex || "#D6C3A5"}cc, ${p.colors[0]?.hex || "#D6C3A5"})`,
                      }}
                    />
                    <div className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/products/new" className="card p-5 transition hover:shadow-lift">
          <div className="font-semibold text-clay">＋ Add a new product</div>
          <p className="mt-1 text-sm text-ink/60">With photos and its colors.</p>
        </Link>
        <Link href="/admin/discounts" className="card p-5 transition hover:shadow-lift">
          <div className="font-semibold text-clay">🎟️ Create a promo code</div>
          <p className="mt-1 text-sm text-ink/60">Run a campaign or sale.</p>
        </Link>
        <Link href="/admin/custom" className="card p-5 transition hover:shadow-lift">
          <div className="font-semibold text-clay">✦ Custom requests</div>
          <p className="mt-1 text-sm text-ink/60">
            Review customer ideas.
            {newCustom > 0 && (
              <span className="ml-1 rounded-full bg-clay px-2 py-0.5 text-[11px] font-bold text-white">
                {newCustom} new
              </span>
            )}
          </p>
        </Link>
        <Link href="/admin/orders" className="card p-5 transition hover:shadow-lift">
          <div className="font-semibold text-clay">Manage orders</div>
          <p className="mt-1 text-sm text-ink/60">Confirm, ship and track deliveries.</p>
        </Link>
      </div>
    </div>
  );
}
