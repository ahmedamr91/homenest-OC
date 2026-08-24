import type { MetadataRoute } from "next";

function baseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/cart", "/checkout", "/order/"],
      },
    ],
    sitemap: `${baseUrl()}/sitemap.xml`,
  };
}
