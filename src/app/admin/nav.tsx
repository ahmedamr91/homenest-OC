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
  { href: "/admin/home", label: "Homepage", icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/admin/infra", label: "Infrastructure", icon: "M4 6a2 2 0 114 0v12a2 2 0 11-4 0V6zM14 8a2 2 0 114 0v10a2 2 0 11-4 0V8z" },
  { href: "/admin/settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" },
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
