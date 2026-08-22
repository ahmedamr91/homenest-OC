import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import { customStatusSchema } from "@/lib/validators";
import { requireAdmin, readJson } from "@/lib/admin-guard";

export const runtime = "nodejs";

type Params = { params: { id: string } };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const body = await readJson(req);
  if (body == null)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = customStatusSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  try {
    await db.customRequest.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    const existing = await db.customRequest.findUnique({
      where: { id },
      select: { imagePath: true },
    });
    if (!existing)
      return NextResponse.json({ error: "Request not found." }, { status: 404 });

    // Best-effort cleanup of the stored photo
    if (existing.imagePath) {
      try {
        await new UTApi().deleteFiles(existing.imagePath);
      } catch {}
    }

    await db.customRequest.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }
}
