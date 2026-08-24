import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/validators";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = await rateLimit(`review:${getClientIp(req.headers)}`, 3, 60_000);
  if (!rl.ok)
    return NextResponse.json(
      { error: "Too many reviews. Please wait a minute." },
      { status: 429 }
    );

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid review." },
      { status: 400 }
    );
  }

  const product = await db.product.findUnique({
    where: { id: parsed.data.productId },
    select: { published: true },
  });
  if (!product?.published)
    return NextResponse.json({ error: "Product not found." }, { status: 404 });

  // Queued for moderation — visible after admin approval
  await db.review.create({
    data: {
      productId: parsed.data.productId,
      name: parsed.data.name,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Thank you! Your review will appear after a quick check.",
  });
}
