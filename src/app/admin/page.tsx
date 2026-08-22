import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney, STATUS_STYLES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orderCount, productCount, categoryCount, revenueAgg, recentOrders, lowStock] =
    await Promise.all([
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
    ]);

  const revenue = revenueAgg._sum.total || 0;
  const pending = await db.order.count({ where: { status: "PENDING" } });
  const newCustom = await db.customRequest.count({ where: { status: "NEW" } });

  const stats = [
    ["Total revenue", formatMoney(revenue), "All orders combined"],
    ["Orders", String(orderCount), `${pending} awaiting confirmation`],
    ["Products", String(productCount), `${categoryCount} categories`],
  ] as const;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map(([label, value, note]) => (
          <div key={label} className="card p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-ink/50">{label}</div>
            <div className="mt-2 font-display text-3xl text-ink">{value}</div>
            <div className="mt-1 text-xs text-ink/50">{note}</div>
          </div>
        ))}
      </div>

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
                      <Link href={`/admin/orders`} className="font-mono text-xs font-semibold text-clay">
                        {o.number}
                      </Link>
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

        <section className="card overflow-hidden self-start">
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
            <h2 className="font-semibold">Low stock alerts</h2>
            <span className="rounded-full bg-clay/10 px-2.5 py-1 text-[11px] font-bold text-clay">≤ 10 left</span>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink/50">
              All products are well stocked. 🎉
            </p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-6 py-3.5">
                  <span
                    aria-hidden
                    className="h-9 w-9 shrink-0 rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${p.colors[0]?.hex || "#D6C3A5"}cc, ${p.colors[0]?.hex || "#D6C3A5"})` }}
                  />
                  <div className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/products/new" className="card p-5 transition hover:shadow-lift">
          <div className="font-semibold text-clay">＋ Add a new product</div>
          <p className="mt-1 text-sm text-ink/60">With its available colors.</p>
        </Link>
        <Link href="/admin/orders" className="card p-5 transition hover:shadow-lift">
          <div className="font-semibold text-clay">Manage orders</div>
          <p className="mt-1 text-sm text-ink/60">Confirm, ship and track deliveries.</p>
        </Link>
        <Link href="/admin/custom" className="card p-5 transition hover:shadow-lift">
          <div className="font-semibold text-clay">✦ Custom requests</div>
          <p className="mt-1 text-sm text-ink/60">
            Review customer ideas and quote them.
            {newCustom > 0 && (
              <span className="ml-1 rounded-full bg-clay px-2 py-0.5 text-[11px] font-bold text-white">
                {newCustom} new
              </span>
            )}
          </p>
        </Link>
        <Link href="/admin/categories" className="card p-5 transition hover:shadow-lift">
          <div className="font-semibold text-clay">Organize categories</div>
          <p className="mt-1 text-sm text-ink/60">Keep the catalog tidy.</p>
        </Link>
      </div>
    </div>
  );
}
