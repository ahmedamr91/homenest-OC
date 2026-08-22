import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators";
import { orderNumber } from "@/lib/utils";
import { getCityFee } from "@/lib/shipping";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  sendNewOrderAlert,
  sendOrderConfirmation,
} from "@/lib/email";

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`order:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your details and try again." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  try {
    // Server-side price & stock validation — never trust client prices
    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const products = await db.product.findMany({
      where: { id: { in: productIds }, published: true },
      include: { colors: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more items are no longer available." },
        { status: 409 }
      );
    }

    const lines = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const color =
        item.colorId != null
          ? product.colors.find((c) => c.id === item.colorId)
          : undefined;
      if (item.colorId != null && !color) {
        throw new Error("Selected color is no longer available.");
      }
      if (product.stock < item.quantity) {
        throw new Error(`Only ${product.stock} of "${product.name}" left in stock.`);
      }
      return {
        productId: product.id,
        name: product.name,
        colorName: color?.name || "Default",
        colorHex: color?.hex || "#D6C3A5",
        price: product.price,
        quantity: item.quantity,
      };
    });

    const round2 = (n: number) => Math.round(n * 100) / 100;
    const subtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));

    // ── Discount validation (server-side, never trust client math) ──
    let discount = 0;
    let appliedCode: string | null = null;
    const requested = data.discountCode?.toUpperCase() || null;

    if (requested) {
      const dc = await db.discountCode.findUnique({ where: { code: requested } });
      if (!dc || !dc.active)
        throw new Error(`Promo code "${requested}" is not valid.`);
      if (dc.expiresAt && dc.expiresAt < new Date())
        throw new Error(`Promo code "${requested}" has expired.`);
      if (dc.maxUses != null && dc.usedCount >= dc.maxUses)
        throw new Error(`Promo code "${requested}" has reached its usage limit.`);
      if (dc.minOrder != null && subtotal < dc.minOrder)
        throw new Error(
          `Promo code "${requested}" needs a minimum order of EGP ${dc.minOrder.toFixed(2)}.`
        );
      discount =
        dc.type === "PERCENT"
          ? round2((subtotal * dc.value) / 100)
          : Math.min(dc.value, subtotal);
      appliedCode = dc.code;
    }

    const discountedSubtotal = round2(subtotal - discount);
    const shipping = getCityFee(data.city, discountedSubtotal);
    const total = round2(discountedSubtotal + shipping);

    const result = await db.$transaction(async (tx) => {
      for (const line of lines) {
        const updated = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(
            `Not enough stock for "${line.name}". Please adjust your cart.`
          );
        }
      }

      if (appliedCode) {
        await tx.discountCode.update({
          where: { code: appliedCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return tx.order.create({
        data: {
          number: orderNumber(),
          customerName: data.customerName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          notes: data.notes ?? null,
          subtotal,
          discountCode: appliedCode,
          discount,
          shipping,
          total,
          items: { create: lines },
        },
      });
    });

    // ── Notifications (non-blocking failures don't break the order) ──
    const lowStock = await db.product.findMany({
      where: { published: true, stock: { lte: 10 }, id: { in: productIds } },
      select: { name: true, stock: true },
    });

    void sendOrderConfirmation({
      number: result.number,
      customerName: result.customerName,
      email: result.email,
      city: result.city,
      total: result.total,
      items: lines,
    }).catch(() => {});

    void sendNewOrderAlert({
      number: result.number,
      customerName: result.customerName,
      phone: result.phone,
      address: result.address,
      city: result.city,
      total: result.total,
      discountCode: result.discountCode,
      lowStock,
    }).catch(() => {});

    return NextResponse.json({ ok: true, number: result.number });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not place the order.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
