import { STORE_WHATSAPP } from "./site-config";

// Normalize any phone input to international digits for wa.me links
export function waPhone(raw: string): string {
  let d = raw.replace(/[^0-9]/g, "");
  // Egyptian local formats: 010… / 01… → +20
  if (d.startsWith("0")) d = `20${d.slice(1)}`;
  return d;
}

export function waLink(phone: string | null | undefined, text: string): string | null {
  const p = phone ? waPhone(phone) : STORE_WHATSAPP;
  if (!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}
