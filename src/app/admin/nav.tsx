"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/admin/products", label: "Products", icon: "M4 7h16M4 12h16M4 17h16" },
  { href: "/admin/categories", label: "Categories", icon: "M4 6h16M4 6a2 2 0 104 0M4 12h16m0 0a2 2 0 104 0m-4 0H4m16 6H4m16 0a2 2 0 104 0" },
  { href: "/admin/orders", label: "Orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/admin/discounts", label: "Discounts", icon: "M7 7h.01M7 3h5a2 2 0 011.4.6l7.1 7.1a2 2 0 010 2.8l-5 5a2 2 0 01-2.8 0L3.6 11.4A2 2 0 013 10V5a2 2 0 012-2z" },
  { href: "/admin/reviews", label: "Reviews", icon: "M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8-5-3.6-5 3.6 1.9-5.8L4 8.8h6.1z" },
  { href: "/admin/custom", label: "Custom Orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout(e: React.MouseEvent) {
    e.preventDefault();
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap gap-1 lg:flex-col">
      {links.map((l) => {
        const active =
          l.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-clay text-white"
                : "text-cream/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={l.icon} />
            </svg>
            {l.label}
          </Link>
        );
      })}
      <button
        onClick={logout}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-cream/70 transition hover:bg-white/10 hover:text-white"
      >
        Log out
      </button>
    </nav>
  );
}
