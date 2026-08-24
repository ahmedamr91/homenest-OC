import crypto from "crypto";

// WhatsApp Cloud API configuration. The bot is dormant until all env vars
// are present AND an admin enables it in Settings.
export function whatsappConfig() {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
    appSecret: process.env.WHATSAPP_APP_SECRET || "",
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "",
  };
}

export function isWhatsAppConfigured(): boolean {
  const c = whatsappConfig();
  return Boolean(
    c.phoneNumberId && c.accessToken && c.appSecret && c.verifyToken
  );
}

/** Verify Meta's X-Hub-Signature-256 header against the raw request body. */
export function verifySignature(rawBody: string, header: string | null): boolean {
  const { appSecret } = whatsappConfig();
  if (!appSecret) return false;
  if (!header?.startsWith("sha256=")) return false;
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  const received = header.slice("sha256=".length);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  const { phoneNumberId, accessToken } = whatsappConfig();
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        text: { body },
      }),
    }
  );
  if (!res.ok) {
    console.error("WhatsApp send failed:", res.status, await res.text());
  }
}
