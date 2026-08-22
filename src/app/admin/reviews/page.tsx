import { db } from "@/lib/db";
import ReviewsManager from "./reviews-manager";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    include: { product: { select: { name: true, slug: true } } },
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Reviews</h1>
      <p className="mt-1 text-sm text-ink/60">
        Approve genuine reviews to publish them on product pages. Delete the spam.
      </p>
      <ReviewsManager
        initial={reviews.map((r) => ({
          id: r.id,
          productName: r.product.name,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          approved: r.approved,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
