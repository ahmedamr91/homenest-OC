import { db } from "@/lib/db";
import CustomRequestsTable from "./custom-requests-table";

export const dynamic = "force-dynamic";

export default async function AdminCustomPage() {
  const requests = await db.customRequest.findMany({
    include: { colors: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">
        Custom orders
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        {requests.length} customer request(s) · review photos, colors and
        descriptions, then update status as you quote and craft
      </p>
      <CustomRequestsTable
        initial={requests.map((r) => ({
          id: r.id,
          reference: r.reference,
          customerName: r.customerName,
          email: r.email,
          phone: r.phone,
          title: r.title,
          description: r.description,
          budget: r.budget,
          imagePath: r.imagePath,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          colors: r.colors.map((c) => c.hex),
        }))}
      />
    </div>
  );
}
