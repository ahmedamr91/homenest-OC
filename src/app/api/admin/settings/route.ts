import { NextResponse } from "next/server";
import { z } from "zod";
import { getSiteSettings, saveSiteSettings } from "@/lib/settings";
import { requireAdmin, readJson } from "@/lib/admin-guard";
import { revalidateStorefront } from "@/lib/revalidate";

const cityFeesSchema = z.record(z.number().min(0).max(100000));

const settingsSchema = z.object({
  freeShippingThreshold: z.number().min(0).max(10000000),
  flatShippingFee: z.number().min(0).max(100000),
  cityFees: cityFeesSchema,
  returnsDays: z.number().int().min(0).max(365),
  returnsNote: z.string().trim().max(200),
});

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  return NextResponse.json({ settings: await getSiteSettings() });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await readJson(req);
  if (body == null)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid settings." },
      { status: 400 }
    );

  await saveSiteSettings(parsed.data);
  revalidateStorefront();
  return NextResponse.json({ ok: true, settings: parsed.data });
}
