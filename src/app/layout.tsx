import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";

export const metadata: Metadata = {
  title: {
    default: "Empty Corner — Modern Home Accessories",
    template: "%s · Empty Corner",
  },
  description:
    "Thoughtfully sourced home accessories: lighting, vases, textiles, mirrors and more. Or send us your idea and we'll craft it. Free shipping over EGP 3,000.",
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
