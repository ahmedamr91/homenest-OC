import { Titan_One } from "next/font/google";

// Chunky rounded display face — matches the original "Empty! Corner!" logo lettering.
// Loaded at build time by next/font (no runtime requests).
export const brandFont = Titan_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-brand",
  display: "swap",
});
