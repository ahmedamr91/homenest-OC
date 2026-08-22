import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";

export const metadata: Metadata = {
  title: {
    default: "HOMENEST — Modern Home Accessories",
    template: "%s · HOMENEST",
  },
  description:
    "Thoughtfully sourced home accessories: lighting, vases, textiles, mirrors and more. Or send us your idea and we'll craft it. Free shipping over $75.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
