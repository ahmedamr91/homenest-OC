import Link from "next/link";
import { getAdminSession } from "@/lib/session";
import Logo from "@/components/logo";
import AdminNav from "./nav";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();

  // Unauthenticated visitors only ever see the login page here
  // (middleware redirects everything else).
  if (!session) {
    return <div className="min-h-screen bg-sand/50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-sand/50 lg:flex" id="admin-shell">
      <aside className="flex flex-col gap-6 border-b border-ink/10 bg-ink px-5 py-6 text-cream lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="rounded bg-cream/10 px-1.5 py-0.5 text-[10px] font-body font-bold uppercase tracking-widest text-cream/70">
            admin
          </span>
        </div>
        <AdminNav />
        <div className="mt-auto space-y-3 border-t border-white/10 pt-4 text-sm">
          <div className="text-cream/60">
            Signed in as
            <span className="block truncate font-semibold text-cream">
              {session.name} ({session.email})
            </span>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="text-cream/70 transition hover:text-white">
              ← Storefront
            </Link>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 p-5 sm:p-8">{children}</div>
    </div>
  );
}
