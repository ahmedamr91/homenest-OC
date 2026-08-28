"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AnnouncementBar } from "@/lib/settings";

export default function AnnouncementEditor({ initial }: { initial: AnnouncementBar }) {
  const router = useRouter();
  const [text, setText] = useState(initial.text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/announcement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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
      <h2 className="font-semibold">Announcement bar (top of site)</h2>
      <p className="mb-4 text-sm text-ink/60">This is the red strip above the menu: e.g. “Free shipping on orders over EGP 5,000 · Cash on delivery across Egypt”.</p>
      <label htmlFor="ann" className="label">Bar text *</label>
      <input id="ann" maxLength={150} value={text} onChange={(e) => setText(e.target.value)} className="input" placeholder="Free shipping on orders over EGP 5,000 · Cash on delivery across Egypt" />
      <div className="mt-3 rounded-lg bg-[#D22928] px-4 py-2 text-center text-xs uppercase tracking-widest text-[#FFCB27]">
        {text || "—"}
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary mt-5">{saving ? "Saving…" : "Save bar"}</button>
    </section>
  );
}
