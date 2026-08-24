import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import {
  isWhatsAppConfigured,
  sendWhatsAppText,
  verifySignature,
  whatsappConfig,
} from "@/lib/whatsapp";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { formatMoney, siteUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Meta webhook verification handshake (called once when you set the webhook)
export async function GET(req: Request) {
  const { verifyToken } = whatsappConfig();
  const params = new URL(req.url).searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (!isWhatsAppConfigured())
    return new NextResponse("WhatsApp not configured.", { status: 503 });

  if (mode === "subscribe" && token && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

type IncomingText = { from: string; body: string };

function extractMessages(value: unknown): IncomingText[] {
  const out: IncomingText[] = [];
  const v = value as {
    messages?: { from?: string; type?: string; text?: { body?: string } }[];
  } | null;
  for (const m of v?.messages ?? []) {
    if (m.from && m.type === "text" && m.text?.body) {
      out.push({ from: m.from, body: m.text.body.trim() });
    }
  }
  return out;
}

const ORDER_RE = /HN-[A-Z0-9]+-[A-Z0-9]{3}/i;

const STATUS_TEXT: Record<string, string> = {
  PENDING: "received — we're reviewing it now",
  CONFIRMED: "confirmed and being prepared 📦",
  SHIPPED: "on its way to you 🚚",
  DELIVERED: "delivered. Thank you! 💛",
  CANCELLED: "cancelled",
};

function welcomeMessage(): string {
  return [
    "Hi! 👋 Thanks for messaging Empty Corner.",
    "",
    "🛍️ Browse the collection:",
    siteUrl() + "/shop",
    "",
    "📦 For an order update, send your order number",
    "(it looks like HN-XXXXXXX-XXX, from your confirmation email).",
    "",
    "For anything else, reply here and our team will get back to you.",
  ].join("\n");
}

export async function POST(req: Request) {
  const raw = await req.text();

  // Signature check — reject anything that isn't from Meta
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature.", { status: 401 });
  }

  // Always 200 to Meta once the signature is valid — non-200s cause retry storms
  try {
    const settings = await getSiteSettings();
    if (!isWhatsAppConfigured() || !settings.whatsappBot) {
      return NextResponse.json({ ok: true, skipped: "bot disabled" });
    }

    const payload = JSON.parse(raw) as {
      entry?: { changes?: { value?: unknown }[] }[];
    };

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const msg of extractMessages(change.value)) {
          const rl = await rateLimit(`wa:${msg.from}`, 20, 60_000);
          if (!rl.ok) continue;

          const orderMatch = msg.body.toUpperCase().match(ORDER_RE);
          if (orderMatch) {
            const order = await db.order.findUnique({
              where: { number: orderMatch[0].toUpperCase() },
              select: { number: true, status: true, total: true, city: true },
            });
            if (order) {
              await sendWhatsAppText(
                msg.from,
                [
                  `Order ${order.number}`,
                  `Status: ${STATUS_TEXT[order.status] ?? order.status}`,
                  `Total: ${formatMoney(order.total)} (cash on delivery)`,
                  "",
                  `Track online: ${siteUrl()}/order/${order.number}`,
                ].join("\n")
              );
            } else {
              await sendWhatsAppText(
                msg.from,
                `I couldn't find order ${orderMatch[0]}. Double-check the number from your confirmation email, or reply here and our team will help. 🙏`
              );
            }
          } else {
            await sendWhatsAppText(msg.from, welcomeMessage());
          }
        }
      }
    }
  } catch (e) {
    console.error("WhatsApp webhook error:", e);
  }

  return NextResponse.json({ ok: true });
}
