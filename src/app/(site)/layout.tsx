import Header from "@/components/header";
import Footer from "@/components/footer";
import TrafficTracker from "./traffic-tracker";
import { getSiteSettings } from "@/lib/settings";
import { db } from "@/lib/db";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    db.category.findMany({
      where: { products: { some: { published: true } } },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ]);
  return (
    <>
      <TrafficTracker />
      <Header freeThreshold={settings.freeShippingThreshold} categories={categories} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
    </>
  );
}
