import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/validators";
import { requireAdmin } from "@/lib/admin-guard";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

function detectImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return "png";
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  )
    return "webp";
  return null;
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const rl = await rateLimit(`imgup:${getClientIp(req.headers)}`, 30, 60_000);
  if (!rl.ok)
    return NextResponse.json({ error: "Slow down." }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES)
    return NextResponse.json(
      { error: "Image too large (max 4MB)." },
      { status: 400 }
    );

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(buffer);
  if (!type || !IMAGE_MIME_TYPES.includes(file.type as never))
    return NextResponse.json(
      { error: "Only JPG, PNG or WebP images are accepted." },
      { status: 400 }
    );

  try {
    const utapi = new UTApi();
    const name = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${type}`;
    const upload = await utapi.uploadFiles(
      new File([new Uint8Array(buffer)], name, {
        type: `image/${type === "jpeg" ? "jpeg" : type}`,
      })
    );
    if (!upload.data)
      return NextResponse.json(
        { error: "Upload failed. Try again." },
        { status: 502 }
      );
    return NextResponse.json({
      ok: true,
      url: upload.data.ufsUrl ?? upload.data.url,
    });
  } catch (e) {
    console.error("Product image upload failed:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
