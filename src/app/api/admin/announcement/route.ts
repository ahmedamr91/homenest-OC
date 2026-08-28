import { NextResponse } from "next/server";
import { getAnnouncementBar, saveAnnouncementBar, DEFAULT_ANNOUNCEMENT_BAR } from "@/lib/settings";
import { requireAdmin, readJson } from "@/lib/admin-guard";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const data = await getAnnouncementBar();
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const body = await readJson<{ text: string }>(req);
  if (!body || typeof body.text !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  const text = body.text.trim();
  if (!text) return NextResponse.json({ error: "Text required." }, { status: 400 });
  if (text.length > 150) return NextResponse.json({ error: "Max 150 chars." }, { status: 400 });
  const next = { text: text || DEFAULT_ANNOUNCEMENT_BAR.text };
  await saveAnnouncementBar(next);
  revalidateStorefront();
  return NextResponse.json({ ok: true });
}
