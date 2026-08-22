import { db } from "@/lib/db";
import OrdersTable from "./orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Orders</h1>
      <p className="mt-1 text-sm text-ink/60">
        {orders.length} order(s) · click a row to expand details and update status
      </p>
      <OrdersTable
        initial={orders.map((o) => ({
          id: o.id,
          number: o.number,
          customerName: o.customerName,
          email: o.email,
          phone: o.phone,
          address: o.address,
          city: o.city,
          notes: o.notes,
          subtotal: o.subtotal,
          discountCode: o.discountCode,
          discount: o.discount,
          shipping: o.shipping,
          total: o.total,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
          items: o.items.map((i) => ({
            id: i.id,
            name: i.name,
            colorName: i.colorName,
            colorHex: i.colorHex,
            price: i.price,
            quantity: i.quantity,
          })),
        }))}
      />
    </div>
  );
}
