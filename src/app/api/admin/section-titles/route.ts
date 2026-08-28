import { NextResponse } from "next/server";
import { getSectionTitles, saveSectionTitles, DEFAULT_SECTION_TITLES } from "@/lib/settings";
import { requireAdmin, readJson } from "@/lib/admin-guard";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const data = await getSectionTitles();
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const body = await readJson<{ shopByRoom: string; featuredFavorites: string }>(req);
  if (!body || typeof body.shopByRoom !== "string" || typeof body.featuredFavorites !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  const next = {
    shopByRoom: body.shopByRoom.trim() || DEFAULT_SECTION_TITLES.shopByRoom,
    featuredFavorites: body.featuredFavorites.trim() || DEFAULT_SECTION_TITLES.featuredFavorites,
  };
  if (next.shopByRoom.length > 80 || next.featuredFavorites.length > 80) {
    return NextResponse.json({ error: "Titles too long (max 80)." }, { status: 400 });
  }
  await saveSectionTitles(next);
  revalidateStorefront();
  return NextResponse.json({ ok: true });
}
