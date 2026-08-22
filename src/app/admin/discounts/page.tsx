import { db } from "@/lib/db";
import DiscountManager from "./discount-manager";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const discounts = await db.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Discount codes</h1>
      <p className="mt-1 text-sm text-ink/60">
        Create promo codes for campaigns. Usage is tracked and validated
        server-side at checkout.
      </p>
      <DiscountManager
        initial={discounts.map((d) => ({
          id: d.id,
          code: d.code,
          type: d.type,
          value: d.value,
          minOrder: d.minOrder,
          maxUses: d.maxUses,
          usedCount: d.usedCount,
          active: d.active,
          expiresAt: d.expiresAt ? d.expiresAt.toISOString() : null,
        }))}
      />
    </div>
  );
}
