import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

function baseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/custom",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  try {
    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      db.category.findMany({ select: { slug: true } }),
    ]);

    return [
      ...staticRoutes,
      ...categories.map((c) => ({
        url: `${base}/shop?category=${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...products.map((p) => ({
        url: `${base}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
