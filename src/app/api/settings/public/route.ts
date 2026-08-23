import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";

// Public read-only settings for client-side checkout/cart calculations.
export async function GET() {
  const s = await getSiteSettings();
  return NextResponse.json({
    freeShippingThreshold: s.freeShippingThreshold,
    flatShippingFee: s.flatShippingFee,
    cityFees: s.cityFees,
    returnsDays: s.returnsDays,
    returnsNote: s.returnsNote,
  });
}
