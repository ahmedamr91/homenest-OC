"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SectionTitles } from "@/lib/settings";

export default function SectionTitlesEditor({ initial }: { initial: SectionTitles }) {
  const router = useRouter();
  const [shopByRoom, setShopByRoom] = useState(initial.shopByRoom);
  const [featuredFavorites, setFeaturedFavorites] = useState(initial.featuredFavorites);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/section-titles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopByRoom, featuredFavorites }),
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
    <section className="card mt-6 p-6">
      <h2 className="font-semibold">Section titles (Pola Perca font)</h2>
      <p className="mb-5 text-sm text-ink/60">These titles use Pola Perca — edit them dynamically without code changes.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="shopByRoom" className="label">Shop by room &amp; mood — title</label>
          <input id="shopByRoom" maxLength={80} value={shopByRoom} onChange={(e) => setShopByRoom(e.target.value)} className="input font-display" placeholder="Shop by room & mood" />
        </div>
        <div>
          <label htmlFor="featured" className="label">Featured favorites — title</label>
          <input id="featured" maxLength={80} value={featuredFavorites} onChange={(e) => setFeaturedFavorites(e.target.value)} className="input font-display" placeholder="Featured favorites" />
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-sand/60 p-4">
        <p className="font-display text-lg text-ink">{shopByRoom || "—"}</p>
        <p className="font-display text-lg text-ink mt-1">{featuredFavorites || "—"}</p>
        <p className="text-xs text-ink/50 mt-2">Preview with Pola Perca</p>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary mt-5">{saving ? "Saving…" : "Save titles"}</button>
    </section>
  );
}
