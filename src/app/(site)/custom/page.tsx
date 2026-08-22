import type { Metadata } from "next";
import CustomRequestForm from "./custom-form";

export const metadata: Metadata = {
  title: "Make It Yours — Custom Orders",
  description:
    "Send us a photo of the piece you're dreaming of, pick your colors, and our makers will bring it to life.",
};

const STEPS = [
  {
    n: "1",
    title: "Share your idea",
    text: "Upload a photo or sketch of the piece you want, and tell us about it.",
  },
  {
    n: "2",
    title: "Pick your colors",
    text: "Choose up to six colors so it matches your space perfectly.",
  },
  {
    n: "3",
    title: "We craft & quote",
    text: "Our team reviews every request and replies within 48 hours with a plan and price.",
  },
];

export default function CustomOrderPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 inline-block rounded-full bg-clay/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-clay">
          Custom orders
        </p>
        <h1 className="font-display text-5xl leading-tight text-balance text-ink sm:text-6xl">
          Make it <span className="italic text-clay">yours</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-ink/60">
          Found inspiration somewhere? Want a lamp in sage instead of sand?
          Send us a photo, describe your dream piece, choose the colors —
          we&apos;ll make it real.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="card p-6 text-center">
            <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-lg text-cream">
              {s.n}
            </div>
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{s.text}</p>
          </div>
        ))}
      </div>

      <CustomRequestForm />
    </div>
  );
}
