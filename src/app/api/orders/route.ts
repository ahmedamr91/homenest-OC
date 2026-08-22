import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators";
import { orderNumber, shippingFor } from "@/lib/utils";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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
        item.colorId != null ? product.colors.find((c) => c.id === item.colorId) : undefined;
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

    const subtotal =
      Math.round(lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100;
    const shipping = shippingFor(subtotal);
    const total = subtotal + shipping;

    const order = await db.$transaction(async (tx) => {
      // Decrement stock atomically; abort if insufficient
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
          shipping,
          total,
          items: { create: lines },
        },
      });
    });

    return NextResponse.json({ ok: true, number: order.number });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not place the order.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
