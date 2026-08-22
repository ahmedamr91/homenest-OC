// Live infrastructure usage for the /admin/infra dashboard.
import { UTApi } from "uploadthing/server";
import { Prisma } from "@prisma/client";
import { db } from "./db";

export type Usage = {
  used: number; // bytes (or count for emails)
  limit: number;
  label: string;
  unit: "bytes" | "count";
};

function decodeTokenKey(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return json.apiKey || null;
  } catch {
    return null;
  }
}

export async function getPhotoStorage(): Promise<{
  ok: boolean;
  bytes: number;
  files: number;
  error?: string;
}> {
  try {
    const res = await new UTApi().listFiles({ limit: 999 });
    const files = res.files;
    const bytes = files.reduce((s, f) => s + (f.size || 0), 0);
    return { ok: true, bytes, files: files.length };
  } catch (e) {
    return { ok: false, bytes: 0, files: 0, error: String(e) };
  }
}

export async function getDbSizeBytes(): Promise<number | null> {
  // PostgreSQL only — returns null on SQLite dev setups
  try {
    const rows = await db.$queryRaw<[{ size: bigint }]>(
      Prisma.sql`SELECT pg_database_size(current_database()) as size`
    );
    return Number(rows[0]?.size ?? 0);
  } catch {
    return null;
  }
}

export async function getTrafficStats() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const since30 = new Date(now.getTime() - 29 * 86_400_000);

  const [rows, monthAgg] = await Promise.all([
    db.pageViewDay.findMany({
      where: { day: { gte: since30 } },
      orderBy: { day: "asc" },
    }),
    db.pageViewDay.aggregate({
      where: { day: { gte: monthStart } },
      _sum: { views: true },
    }),
  ]);

  // Fill a 30-day series
  const series: { label: string; views: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86_400_000);
    const key = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );
    series.push({
      label: d.toLocaleDateString("en-EG", { day: "numeric", month: "short" }),
      views: rows.find((r) => r.day.getTime() === key.getTime())?.views || 0,
    });
  }

  const thisMonth = monthAgg._sum.views || 0;
  return { thisMonth, series };
}

export async function getInfraStats() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    dbSize,
    photos,
    orderCount,
    productCount,
    reviewCount,
    customCount,
    subscriberCount,
    emailsThisMonth,
  ] = await Promise.all([
    getDbSizeBytes(),
    getPhotoStorage(),
    db.order.count(),
    db.product.count(),
    db.review.count(),
    db.customRequest.count(),
    db.subscriber.count(),
    db.emailLog.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  return { dbSize, photos, orderCount, productCount, reviewCount, customCount, subscriberCount, emailsThisMonth };
}
