import Header from "@/components/header";
import Footer from "@/components/footer";
import TrafficTracker from "./traffic-tracker";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <TrafficTracker />
      <Header />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
    </>
  );
}
