"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CustomBanner } from "@/lib/settings";

export default function CustomBannerEditor({
  initial,
}: {
  initial: CustomBanner;
}) {
  const router = useRouter();
  const [banner, setBanner] = useState<CustomBanner>(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<CustomBanner>) {
    setBanner((prev) => ({ ...prev, ...patch }));
  }

  async function uploadImage(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setError(null);
    if (f.size > 4 * 1024 * 1024) {
      setError("Image is over 4MB.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", f);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      update({ imageUrl: data.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/custom-banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banner),
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
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-semibold">Custom orders banner</h2>
      </div>
      <p className="mb-5 text-sm text-ink/60">
        Premium full-width strip — now shorter & cinematic (380–440px tall).
        Best with wide images (2400×700, 21:9). Left text + right clay button.
      </p>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <div>
          <div className="relative aspect-[21/9] overflow-hidden rounded-lg border border-ink/10 bg-ink">
            {banner.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={banner.imageUrl} alt="Banner background" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-cream/50">
                No photo — plain dark banner
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-ink/10" />
          </div>
          <label className="mt-2 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-ink/20 py-2 text-xs font-semibold text-ink/60 transition hover:border-clay hover:text-clay">
            {uploading ? "Uploading…" : banner.imageUrl ? "Replace photo" : "Upload photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                void uploadImage(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {banner.imageUrl && (
            <button
              type="button"
              onClick={() => update({ imageUrl: "" })}
              className="mt-2 w-full rounded-lg py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
            >
              Remove photo
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="cb-badge">Badge (pill)</label>
            <input id="cb-badge" maxLength={40} value={banner.badge} onChange={(e) => update({ badge: e.target.value })} className="input" placeholder="New service" />
          </div>
          <div>
            <label className="label" htmlFor="cb-btn">Button text *</label>
            <input id="cb-btn" maxLength={40} value={banner.buttonText} onChange={(e) => update({ buttonText: e.target.value })} className="input" placeholder="Make it yours" />
          </div>
          <div>
            <label className="label" htmlFor="cb-h1">Headline — normal part</label>
            <input id="cb-h1" maxLength={80} value={banner.headlineStart} onChange={(e) => update({ headlineStart: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="cb-h2">Headline — accent (italic)</label>
            <input id="cb-h2" maxLength={80} value={banner.headlineAccent} onChange={(e) => update({ headlineAccent: e.target.value })} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="cb-sub">Subtext</label>
            <textarea id="cb-sub" rows={2} maxLength={300} value={banner.subtext} onChange={(e) => update({ subtext: e.target.value })} className="input resize-y" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="cb-href">Button links to *</label>
            <input id="cb-href" maxLength={300} value={banner.href} onChange={(e) => update({ href: e.target.value })} className="input" placeholder="/custom" />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary mt-5">
        {saving ? "Saving…" : "Save banner"}
      </button>
    </section>
  );
}
