"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires one tiny POST per storefront page view (skips admin/api).
export default function TrafficTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const t = setTimeout(() => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => {});
    }, 400); // slight delay so real browsing is counted, instant bounces less so
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
