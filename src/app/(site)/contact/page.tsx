import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="font-display text-5xl text-ink">Get in touch</h1>
      <p className="mt-4 max-w-lg leading-relaxed text-ink/70">
        Questions about an order, a product color, or a bulk purchase? We reply
        within one business day.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          ["Email", "hello@emptycorner.shop", "For orders & general questions"],
          ["Phone / WhatsApp", "+20 100 000 0000", "Sun–Thu, 9am–6pm"],
          ["Showroom", "14 Nile Corniche, Cairo", "Visits by appointment"],
          ["Returns", "returns@emptycorner.shop", "30 days, no questions asked"],
        ].map(([title, value, note]) => (
          <div key={title} className="rounded-xl2 bg-white p-6 shadow-card">
            <div className="text-xs font-bold uppercase tracking-widest text-clay">{title}</div>
            <div className="mt-2 font-semibold">{value}</div>
            <div className="mt-1 text-sm text-ink/60">{note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
