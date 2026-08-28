import Header from "@/components/header";
import Footer from "@/components/footer";
import TrafficTracker from "./traffic-tracker";
import { getAnnouncementBar, getSiteSettings } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, bar] = await Promise.all([getSiteSettings(), getAnnouncementBar()]);
  return (
    <>
      <TrafficTracker />
      <Header freeThreshold={settings.freeShippingThreshold} announcementText={bar.text} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
    </>
  );
}
