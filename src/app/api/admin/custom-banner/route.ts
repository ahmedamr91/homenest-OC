import { NextResponse } from "next/server";
import { z } from "zod";
import { getCustomBanner, saveCustomBanner } from "@/lib/settings";
import { requireAdmin, readJson } from "@/lib/admin-guard";
import { revalidateStorefront } from "@/lib/revalidate";

const bannerSchema = z.object({
  imageUrl: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => v === "" || /^https?:\/\//.test(v) || v.startsWith("/"), {
      message: "Image must be empty, a URL or a /path",
    }),
  badge: z.string().trim().max(40),
  headlineStart: z.string().trim().min(1).max(80),
  headlineAccent: z.string().trim().max(80),
  subtext: z.string().trim().max(300),
  buttonText: z.string().trim().min(1).max(40),
  href: z.string().trim().min(1).max(300),
});

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  return NextResponse.json({ banner: await getCustomBanner() });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await readJson(req);
  if (body == null)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid data." },
      { status: 400 }
    );
  }

  await saveCustomBanner(parsed.data);
  revalidateStorefront();
  return NextResponse.json({ ok: true, banner: parsed.data });
}
