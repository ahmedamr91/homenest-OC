"use client";

import { useRef, useState } from "react";

const PALETTE: [string, string][] = [
  ["#B4552D", "Terracotta"],
  ["#C06A42", "Clay"],
  ["#D6C3A5", "Sand"],
  ["#EDE6DA", "Off-White"],
  ["#9CAF88", "Sage"],
  ["#4A5D43", "Forest"],
  ["#5C6B73", "Slate Blue"],
  ["#2B2926", "Charcoal"],
  ["#C19A6B", "Camel"],
  ["#A67C52", "Brass"],
  ["#C99A3C", "Mustard"],
  ["#DBA8A0", "Blush"],
];

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 4;

export default function CustomRequestForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileOk, setFileOk] = useState(false);
  const [colors, setColors] = useState<string[]>(["#B4552D"]);
  const [customHex, setCustomHex] = useState("#9CAF88");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  function toggleColor(hex: string) {
    setColors((prev) =>
      prev.includes(hex)
        ? prev.filter((c) => c !== hex)
        : prev.length >= 6
          ? prev
          : [...prev, hex]
    );
  }

  function handleFile(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Image is too large (max ${MAX_MB}MB).`);
      return;
    }
    setPreview(URL.createObjectURL(f));
    setFileName(f.name);
    setFileOk(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!fileRef.current?.files?.[0]) {
      setError("Please attach a photo of your idea.");
      return;
    }
    if (colors.length === 0) {
      setError("Pick at least one color for your piece.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    fd.set("colors", JSON.stringify(colors));
    // budget field is optional text
    if (!String(fd.get("budget") || "").trim()) fd.delete("budget");

    setSubmitting(true);
    try {
      const res = await fetch("/api/custom-requests", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send your request.");
      setReference(data.reference);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your request.");
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="mx-auto mt-12 max-w-xl">
        <div className="card p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="font-display text-3xl text-ink">Request received!</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
            Our makers are reviewing your idea. We&apos;ll get back to you at
            your email within 48 hours with next steps and a quote.
          </p>
          <div className="mt-6 rounded-xl bg-sand/70 px-6 py-4">
            <div className="text-xs font-bold uppercase tracking-widest text-ink/50">Your reference</div>
            <div className="mt-1 font-mono text-lg font-bold text-clay">{reference}</div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary mt-8"
          >
            Submit another idea
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-14 max-w-3xl">
      <div className="card space-y-8 p-7 sm:p-10">
        {/* Step 1 — image */}
        <section>
          <h2 className="mb-1 font-display text-xl">1 · Your inspiration</h2>
          <p className="mb-4 text-sm text-ink/60">
            A photo of the piece you want, a screenshot, or your own sketch.
          </p>

          {preview ? (
            <div className="relative overflow-hidden rounded-xl2 border border-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Your upload preview" className="max-h-80 w-full object-cover" />
              <div className="flex items-center justify-between gap-3 border-t border-ink/10 bg-white px-4 py-3">
                <span className="min-w-0 truncate text-sm text-ink/70">{fileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setFileOk(false);
                    setFileName(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="shrink-0 text-xs font-bold text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl2 border-2 border-dashed border-ink/20 bg-sand/30 px-6 py-12 text-center transition hover:border-clay hover:bg-sand/60"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files?.[0]);
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#B4552D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.5-3.5a2 2 0 0 0-2.8 0L6 20" />
              </svg>
              <span className="text-sm font-semibold text-ink">
                Click to upload or drag &amp; drop
              </span>
              <span className="text-xs text-ink/50">JPG, PNG or WebP · up to {MAX_MB}MB</span>
              <input
                ref={fileRef}
                type="file"
                name="image"
                accept={ACCEPTED.join(",")}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
              />
            </label>
          )}
        </section>

        {/* Step 2 — describe */}
        <section>
          <h2 className="mb-1 font-display text-xl">2 · Describe it</h2>
          <p className="mb-4 text-sm text-ink/60">
            What is it? Size, material, where it will live in your home…
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="label">What should we make? *</label>
              <input id="title" name="title" required minLength={2} maxLength={150} className="input"
                placeholder='e.g. "Ceramic table lamp like the photo, but rounder"' />
            </div>
            <div>
              <label htmlFor="description" className="label">Details *</label>
              <textarea id="description" name="description" required minLength={10} maxLength={3000} rows={5}
                className="input resize-y"
                placeholder="Describe the shape, size, material, finish… the more detail the better." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="budget" className="label">Budget (optional)</label>
                <input id="budget" name="budget" type="number" min="1" step="0.01" max="1000000" className="input" placeholder="$" />
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 — colors */}
        <section>
          <h2 className="mb-1 font-display text-xl">3 · Pick your colors</h2>
          <p className="mb-4 text-sm text-ink/60">
            Select up to six colors. Tap to select, tap again to remove.
          </p>

          <div className="flex flex-wrap gap-2">
            {PALETTE.map(([hex, name]) => (
              <button
                key={hex}
                type="button"
                onClick={() => toggleColor(hex)}
                aria-pressed={colors.includes(hex)}
                title={name}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  colors.includes(hex)
                    ? "border-clay bg-clay/10 text-clay"
                    : "border-ink/15 bg-white text-ink/70 hover:border-clay/50"
                }`}
              >
                <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                {name}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              type="color"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              aria-label="Custom color picker"
              className="h-10 w-12 cursor-pointer rounded-lg border border-ink/15 bg-white p-1"
            />
            <button
              type="button"
              onClick={() => toggleColor(customHex.toUpperCase())}
              disabled={colors.length >= 6}
              className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold transition hover:border-clay hover:text-clay disabled:opacity-40"
            >
              + Add custom color
            </button>
          </div>

          {colors.length > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-sand/50 p-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/50">Selected:</span>
              {colors.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => toggleColor(hex)}
                  title={`Remove ${hex}`}
                  className="group relative h-8 w-8 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10 transition hover:scale-110"
                  style={{ backgroundColor: hex }}
                >
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                    ✕
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Contact */}
        <section className="border-t border-ink/10 pt-7">
          <h2 className="mb-1 font-display text-xl">How can we reach you?</h2>
          <p className="mb-4 text-sm text-ink/60">
            We&apos;ll reply within 48 hours with a plan and quote.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label htmlFor="customerName" className="label">Full name *</label>
              <input id="customerName" name="customerName" required minLength={2} maxLength={120} className="input" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="email" className="label">Email *</label>
              <input id="email" name="email" type="email" required maxLength={200} className="input" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="phone" className="label">Phone *</label>
              <input id="phone" name="phone" required pattern="[+0-9\s()-]{6,}" title="Valid phone number" className="input" autoComplete="tel" placeholder="+20 100 000 0000" />
            </div>
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full !py-4 text-base">
          {submitting ? "Sending…" : "✦ Send my custom request"}
        </button>
        <p className="text-center text-[11px] leading-relaxed text-ink/50">
          🔒 Your photo and details are validated and stored securely. We only use
          them to craft and quote your piece.
        </p>
      </div>
    </form>
  );
}
