import { NextResponse } from "next/server";
import { z } from "zod";
import { getHomeContent, saveHomeContent } from "@/lib/settings";
import { requireAdmin, readJson } from "@/lib/admin-guard";
import { revalidateStorefront } from "@/lib/revalidate";

const homeSchema = z.object({
  heroBadge: z.string().trim().min(1).max(60),
  headlineStart: z.string().trim().min(1).max(120),
  headlineAccent: z.string().trim().min(1).max(40),
  headlineEnd: z.string().trim().max(120),
  heroText: z.string().trim().min(1).max(300),
});

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  return NextResponse.json({ home: await getHomeContent() });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await readJson(req);
  if (body == null)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = homeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid data." },
      { status: 400 }
    );
  }

  await saveHomeContent(parsed.data);
  revalidateStorefront();
  return NextResponse.json({ ok: true, home: parsed.data });
}
