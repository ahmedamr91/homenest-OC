import Link from "next/link";
import Logo from "./logo";

export default async function Footer() {
  const { getSiteSettings } = await import("@/lib/settings");
  const settings = await getSiteSettings();
  return (
    <footer className="mt-24 border-t border-ink/10 bg-sand/60">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/60">
            Thoughtfully sourced home accessories that turn everyday rooms into
            warm, lived-in spaces. Or send us your idea and we&apos;ll craft it.
          </p>
          <Link
            href="/custom"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-clay px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-clay-dark"
          >
            ✦ Make it yours
          </Link>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-ink/50">Shop</h3>
          <ul className="space-y-2.5 text-sm text-ink/70">
            <li><Link href="/shop" className="hover:text-clay">All Products</Link></li>
            <li><Link href="/custom" className="hover:text-clay">Custom Orders</Link></li>
            <li><Link href="/shop?category=lighting" className="hover:text-clay">Lighting</Link></li>
            <li><Link href="/shop?category=vases-planters" className="hover:text-clay">Vases &amp; Planters</Link></li>
            <li><Link href="/shop?category=cushions-throws" className="hover:text-clay">Cushions &amp; Throws</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-ink/50">Company</h3>
          <ul className="space-y-2.5 text-sm text-ink/70">
            <li><Link href="/about" className="hover:text-clay">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-clay">Contact</Link></li>
            <li><Link href="/admin/login" className="hover:text-clay">Admin Panel</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-ink/50">Good to know</h3>
          <ul className="space-y-2.5 text-sm text-ink/70">
            <li>Free shipping over EGP {settings.freeShippingThreshold.toLocaleString()}</li>
            <li>Cash on delivery available</li>
            <li>{settings.returnsDays}-day easy returns</li>
            <li>Secure checkout</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10 py-5 text-center text-xs text-ink/50">
        © {new Date().getFullYear()} Empty Corner Home Accessories. All rights reserved.
      </div>
    </footer>
  );
}
