"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { HomeContent } from "@/lib/settings";

export default function HomeForm({ initial }: { initial: HomeContent }) {
  const router = useRouter();
  const [heroBadge, setHeroBadge] = useState(initial.heroBadge);
  const [headlineStart, setHeadlineStart] = useState(initial.headlineStart);
  const [headlineAccent, setHeadlineAccent] = useState(initial.headlineAccent);
  const [headlineEnd, setHeadlineEnd] = useState(initial.headlineEnd);
  const [heroText, setHeroText] = useState(initial.heroText);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroBadge,
          headlineStart,
          headlineAccent,
          headlineEnd,
          heroText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="card space-y-4 p-6">
        <h2 className="font-semibold">Hero section</h2>

        <div>
          <label htmlFor="badge" className="label">
            Badge (small pill above the title)
          </label>
          <input
            id="badge"
            maxLength={60}
            value={heroBadge}
            onChange={(e) => setHeroBadge(e.target.value)}
            className="input"
            placeholder="New season · New colors"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="hStart" className="label">
              Headline — start
            </label>
            <input
              id="hStart"
              maxLength={120}
              value={headlineStart}
              onChange={(e) => setHeadlineStart(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="hAccent" className="label">
              Accent word (colored)
            </label>
            <input
              id="hAccent"
              maxLength={40}
              value={headlineAccent}
              onChange={(e) => setHeadlineAccent(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="hEnd" className="label">
              Headline — end
            </label>
            <input
              id="hEnd"
              maxLength={120}
              value={headlineEnd}
              onChange={(e) => setHeadlineEnd(e.target.value)}
              className="input"
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-ink/50">
          Headline renders as: &ldquo;{headlineStart}{" "}
          <em className="text-clay">{headlineAccent}</em> {headlineEnd}&rdquo;
        </p>

        <div>
          <label htmlFor="htext" className="label">
            Subtitle
          </label>
          <textarea
            id="htext"
            rows={3}
            maxLength={300}
            value={heroText}
            onChange={(e) => setHeroText(e.target.value)}
            className="input resize-y"
          />
        </div>
      </section>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="card space-y-4 p-6">
          <h2 className="font-semibold">Live preview</h2>
          <div className="rounded-xl bg-sand/60 p-5">
            <p className="mb-3 inline-block rounded-full bg-clay/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-clay">
              {heroBadge}
            </p>
            <p className="font-display text-2xl leading-snug text-ink">
              {headlineStart}{" "}
              <span className="italic text-clay">{headlineAccent}</span>{" "}
              {headlineEnd}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">
              {heroText}
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? "Saving…" : "Save homepage"}
          </button>
        </div>
      </aside>
    </div>
  );
}
