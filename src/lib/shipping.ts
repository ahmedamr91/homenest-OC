// Egypt governorate shipping zones — edit fees here anytime.
import { SHIPPING_FEE, SHIPPING_THRESHOLD } from "./utils";

export const EG_CITIES = [
  "Cairo",
  "Giza",
  "Qalyubia",
  "Alexandria",
  "Beheira",
  "Gharbia",
  "Dakahlia",
  "Damietta",
  "Kafr El Sheikh",
  "Sharqia",
  "Monufia",
  "Port Said",
  "Ismailia",
  "Suez",
  "Fayoum",
  "Beni Suef",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "Matrouh",
  "New Valley",
  "North Sinai",
  "South Sinai",
] as const;

export type EgCity = (typeof EG_CITIES)[number];

const ZONES: Record<string, number> = {
  // Greater Cairo
  Cairo: 50,
  Giza: 55,
  Qalyubia: 60,
  // Alexandria & Delta
  Alexandria: 65,
  Beheira: 65,
  Gharbia: 65,
  Dakahlia: 65,
  Damietta: 70,
  "Kafr El Sheikh": 65,
  Sharqia: 65,
  Monufia: 60,
  // Canal & Middle Egypt
  "Port Said": 75,
  Ismailia: 75,
  Suez: 75,
  Fayoum: 70,
  "Beni Suef": 70,
  Minya: 75,
  // Upper Egypt
  Asyut: 80,
  Sohag: 85,
  Qena: 90,
  Luxor: 95,
  Aswan: 100,
  // Remote / coastal
  "Red Sea": 110,
  Matrouh: 110,
  "New Valley": 120,
  "North Sinai": 110,
  "South Sinai": 110,
};

export function getCityFee(city: string, subtotalAfterDiscount: number): number {
  if (subtotalAfterDiscount >= SHIPPING_THRESHOLD) return 0;
  return ZONES[city] ?? SHIPPING_FEE;
}
