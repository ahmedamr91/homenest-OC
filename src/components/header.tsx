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
}: {
  freeThreshold?: number;
  categories?: NavCategory[];
}) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <div className="bg-[#9B1B1B] text-center text-[11px] sm:text-xs tracking-widest uppercase text-[#FFCB27]/90 py-2 px-4">
        Free shipping on orders over EGP {freeThreshold.toLocaleString()} · Cash on delivery across Egypt
      </div>
      <header className="sticky top-0 z-40 border-b border-[#9B1B1B] bg-[#D22928] backdrop-blur">
        <div className="container-page flex h-20 items-center justify-between gap-4">
          <Logo height={80} yellow />

          <nav className="hidden md:flex items-center gap-10">
            {nav.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`relative pb-1 text-[13px] font-bold uppercase tracking-[0.18em] transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:rounded-full after:bg-[#FFCB27] after:transition-all after:duration-300 ${
                  isActive(n.href)
                    ? "text-[#FFCB27] after:w-full"
                    : "text-[#FFCB27]/75 after:w-0 hover:text-[#FFCB27] hover:after:w-full"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/custom"
              className="inline-flex items-center rounded-full bg-[#FFCB27] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#D22928] transition hover:bg-[#FFE08A] sm:px-4 sm:py-2 sm:text-xs"
            >
              Make it yours
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative rounded-full p-2.5 text-[#FFCB27] transition hover:bg-[#9B1B1B]"
            >
              <CartIcon />
              {ready && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FFCB27] px-1 text-[10px] font-bold text-[#D22928]">
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              className="rounded-full p-2.5 text-[#FFCB27] transition hover:bg-[#9B1B1B] md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-[#9B1B1B] bg-[#D22928] md:hidden">
            <div className="container-page flex flex-col py-3">
              {nav.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`py-2.5 text-sm font-bold uppercase tracking-[0.18em] ${
                    isActive(n.href) ? "text-[#FFCB27]" : "text-[#FFCB27]/85"
                  }`}
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
