import { NextResponse } from "next/server";
import { z } from "zod";
import { getSlides, saveSlides } from "@/lib/settings";
import { requireAdmin, readJson } from "@/lib/admin-guard";
import { revalidateStorefront } from "@/lib/revalidate";

const slideSchema = z.object({
  imageUrl: z
    .string()
    .trim()
    .min(1)
    .max(1000)
    .refine((v) => /^https?:\/\//.test(v) || v.startsWith("/"), {
      message: "Image must be a URL or a /path",
    }),
  headline: z.string().trim().max(80).default(""),
  subtext: z.string().trim().max(200).default(""),
  buttonText: z.string().trim().min(1).max(40),
  href: z.string().trim().min(1).max(300),
  theme: z.enum(["dark", "light"]).optional(),
});

const slidesSchema = z.object({
  slides: z.array(slideSchema).max(6),
});

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  return NextResponse.json({ slides: await getSlides() });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await readJson(req);
  if (body == null)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = slidesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid data." },
      { status: 400 }
    );
  }

  await saveSlides(parsed.data.slides);
  revalidateStorefront();
  return NextResponse.json({ ok: true, slides: parsed.data.slides });
}
