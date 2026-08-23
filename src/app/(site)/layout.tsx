import Header from "@/components/header";
import Footer from "@/components/footer";
import TrafficTracker from "./traffic-tracker";
import { getSiteSettings } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  return (
    <>
      <TrafficTracker />
      <Header freeThreshold={settings.freeShippingThreshold} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
    </>
  );
}
