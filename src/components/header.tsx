"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./cart-context";
import Logo from "./logo";

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 7h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

type NavCategory = { name: string; slug: string };

export default function Header({
  freeThreshold = 3000,
  categories = [],
}: {
  freeThreshold?: number;
  categories?: NavCategory[];
}) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);

  const nav: { href: string; label: string; accent?: boolean }[] = [
    { href: "/shop", label: "Shop All" },
    ...categories.map((c) => ({
      href: `/shop?category=${c.slug}`,
      label: c.name,
    })),
    { href: "/custom", label: "Make Yours", accent: true },
  ];

  return (
    <>
      <div className="bg-ink text-center text-[11px] sm:text-xs tracking-widest uppercase text-cream/90 py-2 px-4">
        Free shipping on orders over EGP {freeThreshold.toLocaleString()} · Cash on delivery across Egypt
      </div>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo height={56} />

          <nav className="hidden md:flex items-center gap-7">
            {nav.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`text-sm font-medium transition ${
                  n.accent
                    ? "rounded-full bg-clay/10 px-4 py-1.5 font-semibold text-clay hover:bg-clay hover:text-white"
                    : `hover:text-clay ${
                        pathname === n.href.split("?")[0] ? "text-clay" : "text-ink/80"
                      }`
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative rounded-full p-2.5 text-ink transition hover:bg-sand"
            >
              <CartIcon />
              {ready && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              className="rounded-full p-2.5 text-ink transition hover:bg-sand md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-ink/10 bg-cream md:hidden">
            <div className="container-page flex flex-col py-3">
              {nav.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm font-medium text-ink/80 hover:text-clay"
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
