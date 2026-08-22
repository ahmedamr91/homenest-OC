export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

export const SHIPPING_THRESHOLD = 3000; // free shipping above this (EGP)
export const SHIPPING_FEE = 60;

export function shippingFor(subtotal: number): number {
  return subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
}

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-700",
};

export function orderNumber(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `HN-${t}-${r}`;
}

export const CUSTOM_STATUSES = [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "IN_PRODUCTION",
  "COMPLETED",
  "REJECTED",
] as const;

export type CustomStatus = (typeof CUSTOM_STATUSES)[number];

export const CUSTOM_STATUS_STYLES: Record<string, string> = {
  NEW: "bg-clay/10 text-clay",
  REVIEWING: "bg-amber-100 text-amber-800",
  QUOTED: "bg-blue-100 text-blue-800",
  IN_PRODUCTION: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
};
