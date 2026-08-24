import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import {
  customRequestSchema,
  IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
} from "@/lib/validators";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

function customRef(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `HN-C-${t}-${r}`;
}

// Sniff real file signature — never trust the browser's content type
function detectImageType(buf: Buffer): "jpeg" | "png" | "webp" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  )
    return "png";
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  )
    return "webp";
  return null;
}

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = await rateLimit(`custom:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a minute." },
      { status: 429 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Please attach a photo of your idea." },
      { status: 400 }
    );
  }
  // 4MB cap keeps us safely under Vercel's serverless body limit
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image is too large (max 4MB)." },
      { status: 400 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Image file is empty." }, { status: 400 });
  }

  let colorsRaw: unknown;
  try {
    colorsRaw = JSON.parse(String(form.get("colors") || "[]"));
  } catch {
    return NextResponse.json({ error: "Invalid colors data." }, { status: 400 });
  }

  const budgetRaw = String(form.get("budget") || "").trim();
  const parsed = customRequestSchema.safeParse({
    customerName: form.get("customerName"),
    email: form.get("email"),
    phone: form.get("phone"),
    title: form.get("title"),
    description: form.get("description"),
    budget: budgetRaw === "" ? null : Number(budgetRaw),
    colors: colorsRaw,
  });
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ||
          "Please check the form and try again.",
      },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(buffer);
  if (!type || !IMAGE_MIME_TYPES.includes(file.type as never)) {
    return NextResponse.json(
      { error: "Only JPG, PNG or WebP images are accepted." },
      { status: 400 }
    );
  }

  const reference = customRef();

  try {
    // Upload to UploadThing cloud storage (UPLOADTHING_TOKEN required)
    const utapi = new UTApi();
    const upload = await utapi.uploadFiles(
      new File([new Uint8Array(buffer)], `${reference}.${type}`, {
        type: `image/${type === "jpeg" ? "jpeg" : type}`,
      })
    );

    if (!upload.data) {
      console.error("UploadThing error:", upload.error);
      return NextResponse.json(
        { error: "Could not store your image. Please try again." },
        { status: 502 }
      );
    }

    const imageUrl = upload.data.ufsUrl ?? upload.data.url;

    await db.customRequest.create({
      data: {
        reference,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        title: data.title,
        description: data.description,
        budget: data.budget ?? null,
        imagePath: imageUrl,
        colors: { create: data.colors.map((hex) => ({ hex })) },
      },
    });

    return NextResponse.json({ ok: true, reference }, { status: 201 });
  } catch (e) {
    console.error("Custom request failed:", e);
    return NextResponse.json(
      { error: "Could not save your request. Please try again." },
      { status: 500 }
    );
  }
}
