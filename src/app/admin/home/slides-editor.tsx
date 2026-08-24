"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { HeroSlide } from "@/lib/settings";

type Category = { name: string; slug: string };

const CUSTOM = "__custom__";

function linkToValue(href: string, categories: Category[]): string {
  if (href === "/shop") return "/shop";
  const cat = categories.find((c) => href === `/shop?category=${c.slug}`);
  return cat ? `/shop?category=${cat.slug}` : CUSTOM;
}

export default function SlidesEditor({
  initial,
  categories,
}: {
  initial: HeroSlide[];
  categories: Category[];
}) {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlide[]>(initial);
  const [uploading, setUploading] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(i: number, patch: Partial<HeroSlide>) {
    setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function move(i: number, dir: -1 | 1) {
    setSlides((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function uploadImage(i: number, files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setError(null);
    if (f.size > 4 * 1024 * 1024) {
      setError("Image is over 4MB.");
      return;
    }
    setUploading(i);
    try {
      const fd = new FormData();
      fd.set("file", f);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      update(i, { imageUrl: data.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setError(null);
    if (slides.some((s) => !s.imageUrl || !s.buttonText || !s.href)) {
      setError("Every slide needs an image, button text and a link.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save slides.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card mt-6 p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-semibold">Hero slideshow</h2>
        <span className="text-xs text-ink/50">{slides.length}/6 slides</span>
      </div>
      <p className="mb-5 text-sm text-ink/60">
        Full-width rotating banners. Use wide landscape images (1600×700 or
        similar). When at least one slide exists it replaces the hero text
        section; delete all slides to bring it back.
      </p>

      <div className="space-y-5">
        {slides.map((s, i) => (
          <div key={i} className="rounded-xl border border-ink/10 bg-sand/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-ink/50">
                Slide {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded px-2 py-1 text-sm text-ink/60 transition hover:bg-white disabled:opacity-30">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1} aria-label="Move down" className="rounded px-2 py-1 text-sm text-ink/60 transition hover:bg-white disabled:opacity-30">↓</button>
                <button type="button" onClick={() => setSlides((p) => p.filter((_, idx) => idx !== i))} aria-label="Remove slide" className="rounded px-2 py-1 text-sm text-red-500 transition hover:bg-red-50">✕</button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
              <div>
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-ink/10 bg-white">
                  {s.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={s.imageUrl} alt={`Slide ${i + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink/40">No image</div>
                  )}
                </div>
                <label className="mt-2 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-ink/20 py-2 text-xs font-semibold text-ink/60 transition hover:border-clay hover:text-clay">
                  {uploading === i ? "Uploading…" : s.imageUrl ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      void uploadImage(i, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor={`s-headline-${i}`}>Headline (optional)</label>
                  <input id={`s-headline-${i}`} maxLength={80} value={s.headline} onChange={(e) => update(i, { headline: e.target.value })} className="input" placeholder="Summer collection is here" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor={`s-sub-${i}`}>Subtext (optional)</label>
                  <input id={`s-sub-${i}`} maxLength={200} value={s.subtext} onChange={(e) => update(i, { subtext: e.target.value })} className="input" placeholder="Handmade pieces in every color" />
                </div>
                <div>
                  <label className="label" htmlFor={`s-btn-${i}`}>Button text *</label>
                  <input id={`s-btn-${i}`} maxLength={40} value={s.buttonText} onChange={(e) => update(i, { buttonText: e.target.value })} className="input" placeholder="Shop Lighting" />
                </div>
                <div>
                  <label className="label" htmlFor={`s-theme-${i}`}>Text color</label>
                  <select
                    id={`s-theme-${i}`}
                    value={s.theme === "light" ? "light" : "dark"}
                    onChange={(e) => update(i, { theme: e.target.value as "dark" | "light" })}
                    className="input cursor-pointer"
                  >
                    <option value="dark">Light text (dark artwork)</option>
                    <option value="light">Dark text (light artwork)</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor={`s-link-${i}`}>Links to *</label>
                  <select
                    id={`s-link-${i}`}
                    value={linkToValue(s.href, categories)}
                    onChange={(e) => {
                      const v = e.target.value;
                      update(i, { href: v === CUSTOM ? "" : v });
                    }}
                    className="input cursor-pointer"
                  >
                    <option value="/shop">Shop All</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={`/shop?category=${c.slug}`}>{c.name}</option>
                    ))}
                    <option value={CUSTOM}>Custom URL…</option>
                  </select>
                  {linkToValue(s.href, categories) === CUSTOM && (
                    <input
                      value={s.href}
                      onChange={(e) => update(i, { href: e.target.value })}
                      className="input mt-2"
                      placeholder="/shop?color=Blue"
                      maxLength={300}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length < 6 && (
        <button
          type="button"
          onClick={() =>
            setSlides((p) => [
              ...p,
              { imageUrl: "", headline: "", subtext: "", buttonText: "Shop now", href: "/shop" },
            ])
          }
          className="mt-4 w-full rounded-xl border-2 border-dashed border-ink/20 py-3 text-sm font-semibold text-ink/60 transition hover:border-clay hover:text-clay"
        >
          ＋ Add a slide
        </button>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary mt-5">
        {saving ? "Saving…" : "Save slideshow"}
      </button>
    </section>
  );
}
