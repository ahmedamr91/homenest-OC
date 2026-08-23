// Site-wide editable settings, stored in the Setting table (JSON per key).
// Falls back to defaults when unset — the store always works out of the box.
import { db } from "./db";

export type ShippingSettings = {
  freeShippingThreshold: number;
  flatShippingFee: number;
  cityFees: Record<string, number>;
  returnsDays: number;
  returnsNote: string;
};

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  freeShippingThreshold: 3000,
  flatShippingFee: 60,
  cityFees: {
    Cairo: 50,
    Giza: 55,
    Qalyubia: 60,
    Alexandria: 65,
    Beheira: 65,
    Gharbia: 65,
    Dakahlia: 65,
    Damietta: 70,
    "Kafr El Sheikh": 65,
    Sharqia: 65,
    Monufia: 60,
    "Port Said": 75,
    Ismailia: 75,
    Suez: 75,
    Fayoum: 70,
    "Beni Suef": 70,
    Minya: 75,
    Asyut: 80,
    Sohag: 85,
    Qena: 90,
    Luxor: 95,
    Aswan: 100,
    "Red Sea": 110,
    Matrouh: 110,
    "New Valley": 120,
    "North Sinai": 110,
    "South Sinai": 110,
  },
  returnsDays: 30,
  returnsNote: "30 days, no questions asked",
};

const KEY = "shipping";

export async function getSiteSettings(): Promise<ShippingSettings> {
  try {
    const row = await db.setting.findUnique({ where: { key: KEY } });
    if (!row) return DEFAULT_SHIPPING_SETTINGS;
    const parsed = JSON.parse(row.value) as Partial<ShippingSettings>;
    return {
      ...DEFAULT_SHIPPING_SETTINGS,
      ...parsed,
      cityFees: { ...DEFAULT_SHIPPING_SETTINGS.cityFees, ...(parsed.cityFees || {}) },
    };
  } catch {
    return DEFAULT_SHIPPING_SETTINGS;
  }
}

export async function saveSiteSettings(
  next: ShippingSettings
): Promise<void> {
  await db.setting.upsert({
    where: { key: KEY },
    update: { value: JSON.stringify(next) },
    create: { key: KEY, value: JSON.stringify(next) },
  });
}

export function computeShipping(
  city: string | null | undefined,
  subtotalAfterDiscount: number,
  s: ShippingSettings
): number {
  if (subtotalAfterDiscount >= s.freeShippingThreshold) return 0;
  if (!city) return s.flatShippingFee;
  return s.cityFees[city] ?? s.flatShippingFee;
}
