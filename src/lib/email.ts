// Email service — gracefully no-ops when RESEND_API_KEY is not configured.
import { db } from "./db";
import { ADMIN_EMAIL } from "./site-config";

type MailInput = { to: string; subject: string; html: string; type: string };

const FROM = "HOMENEST <onboarding@resend.dev>";

async function logEmail(to: string, subject: string, type: string, delivered: boolean) {
  try {
    await db.emailLog.create({ data: { to, subject, type, delivered } });
  } catch {}
}

async function send({ to, subject, html, type }: MailInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email skipped — no RESEND_API_KEY] to=${to} subject="${subject}"`);
    void logEmail(to, subject, type, false);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[email failed]", await res.text());
      void logEmail(to, subject, type, false);
      return false;
    }
    void logEmail(to, subject, type, true);
    return true;
  } catch (e) {
    console.error("[email error]", e);
    void logEmail(to, subject, type, false);
    return false;
  }
}

const wrap = (title: string, body: string) => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#FAF6F0;padding:24px;border-radius:16px">
  <div style="font-size:22px;font-weight:bold;color:#221B15;margin-bottom:4px">HOME<span style="color:#B4552D">NEST</span></div>
  <h2 style="color:#221B15;margin-top:12px">${title}</h2>
  ${body}
  <p style="color:#8a837b;font-size:12px;margin-top:28px">HOMENEST — Modern Home Accessories</p>
</div>`;

export async function sendOrderConfirmation(o: {
  number: string;
  customerName: string;
  email: string;
  city: string;
  total: number;
  items: { name: string; colorName: string; quantity: number }[];
}) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;color:#444">${i.quantity}× ${i.name} <span style="color:#999">(${i.colorName})</span></td></tr>`
    )
    .join("");
  return send({
    type: "order_confirmation",
    to: o.email,
    subject: `Order ${o.number} received — HOMENEST`,
    html: wrap(
      `Thank you, ${o.customerName}! 🏡`,
      `<p>Your order has been received and is being prepared.</p>
       <table>${rows}</table>
       <p style="font-size:18px"><strong>Total (cash on delivery): EGP ${o.total.toFixed(2)}</strong></p>
       <p style="color:#666">Delivering to: ${o.city}. We'll call you shortly to confirm.</p>`
    ),
  });
}

export async function sendNewOrderAlert(o: {
  number: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  total: number;
  discountCode?: string | null;
  lowStock: { name: string; stock: number }[];
}) {
  const low = o.lowStock.length
    ? `<div style="background:#FEF3C7;padding:10px;border-radius:8px;margin-top:14px">
        <strong>⚠ Low stock alert:</strong><br/>${o.lowStock
          .map((l) => `${l.name} — only ${l.stock} left`)
          .join("<br/>")}
       </div>`
    : "";
  return send({
    type: "admin_alert",
    to: process.env.ALERTS_TO || ADMIN_EMAIL,
    subject: `🔔 New order ${o.number} — EGP ${o.total.toFixed(2)}`,
    html: wrap(
      "New order received!",
      `<p><strong>${o.customerName}</strong> · ${o.phone}<br/>
       ${o.address}, ${o.city}</p>
       <p><strong>Cash total: EGP ${o.total.toFixed(2)}</strong>${
         o.discountCode ? ` · code <code>${o.discountCode}</code>` : ""
       }</p>
       ${low}
       <p><a href="/admin/orders" style="color:#B4552D">Open admin panel →</a></p>`
    ),
  });
}

export async function sendWelcomeEmail(email: string) {
  return send({
    type: "welcome",
    to: email,
    subject: "Welcome to HOMENEST — your 10% inside",
    html: wrap(
      "Welcome to the family! 🏡",
      `<p>You're on the list for early access to new collections and color drops.</p>
       <p>Use code <code style="background:#F0E9DF;padding:4px 10px;border-radius:6px;font-weight:bold">WELCOME10</code>
       for <strong>10% off</strong> your first order.</p>`
    ),
  });
}

export async function sendLowStockDigest(items: { name: string; stock: number }[]) {
  if (!items.length) return false;
  return send({
    type: "low_stock",
    to: process.env.ALERTS_TO || ADMIN_EMAIL,
    subject: `⚠ ${items.length} product(s) running low`,
    html: wrap(
      "Low stock digest",
      `<ul>${items.map((i) => `<li><strong>${i.name}</strong> — ${i.stock} left</li>`).join("")}</ul>
       <p><a href="/admin/products" style="color:#B4552D">Restock now →</a></p>`
    ),
  });
}
