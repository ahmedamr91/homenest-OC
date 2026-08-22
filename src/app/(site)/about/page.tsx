import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="font-display text-5xl text-ink">Our story</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-ink/70">
        <p>
          Empty Corner began with a simple belief: the objects we live with should be
          as considered as the spaces they occupy. We curate home accessories —
          lighting, textiles, vases, mirrors and storage — that bring warmth,
          texture and quiet character into everyday rooms.
        </p>
        <p>
          Every product is available in a range of carefully chosen colors, so
          whether your space is warm terracotta or calm sage, you&apos;ll find
          pieces that belong. What you see is what ships: honest materials,
          honest prices, delivered to your door.
        </p>
        <div className="grid gap-4 pt-6 sm:grid-cols-3">
          {[["2k+", "Happy homes"], ["21+", "Curated products"], ["30d", "Easy returns"]].map(
            ([n, l]) => (
              <div key={l} className="rounded-xl2 bg-white p-6 text-center shadow-card">
                <div className="font-display text-3xl text-clay">{n}</div>
                <div className="mt-1 text-sm text-ink/60">{l}</div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
