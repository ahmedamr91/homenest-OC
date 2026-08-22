"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
};

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed.");
  return data.url;
}

export default function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          imageUrl: newImageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create category.");
      setName("");
      setDescription("");
      setNewImageUrl(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleNewPhoto(files: FileList | null) {
    if (!files?.[0]) return;
    setError(null);
    setUploading(true);
    try {
      setNewImageUrl(await uploadImage(files[0]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function changePhoto(id: number, files: FileList | null) {
    if (!files?.[0]) return;
    setError(null);
    setBusy(true);
    try {
      const url = await uploadImage(files[0]);
      await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this category?")) return;
    setError(null);
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not delete.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-sand/40 text-left text-xs uppercase tracking-wider text-ink/50">
              <th className="px-5 py-3.5 font-bold">Category</th>
              <th className="px-4 py-3.5 font-bold">Products</th>
              <th className="px-4 py-3.5 font-bold">Photo</th>
              <th className="px-4 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initial.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0 hover:bg-sand/40">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.imageUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sand font-display text-base text-clay">
                        {c.name.charAt(0)}
                      </span>
                    )}
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">{c.productCount}</td>
                <td className="px-4 py-3.5">
                  <label
                    className={`inline-block cursor-pointer rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-semibold transition hover:border-clay hover:text-clay ${
                      busy ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {c.imageUrl ? "Replace photo" : "＋ Upload photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        void changePhoto(c.id, e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => remove(c.id)}
                    disabled={busy}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {initial.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-ink/50">
                  No categories yet — add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {error && (
          <p role="alert" className="m-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <form onSubmit={addCategory} className="card space-y-4 p-6">
          <h2 className="font-semibold">Add a category</h2>

          <div>
            <span className="label">Photo</span>
            {newImageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-ink/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={newImageUrl} alt="" className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setNewImageUrl(null)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/20 bg-sand/30 px-4 py-8 text-center transition hover:border-clay ${
                  uploading ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <span className="text-sm font-semibold">
                  {uploading ? "Uploading…" : "📷 Click to upload"}
                </span>
                <span className="text-[11px] text-ink/50">JPG / PNG / WebP · max 4MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    void handleNewPhoto(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          <div>
            <label htmlFor="catname" className="label">Name *</label>
            <input
              id="catname"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. Candles & Scents"
            />
          </div>
          <div>
            <label htmlFor="catdesc" className="label">Description</label>
            <textarea
              id="catdesc"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              placeholder="Optional short description"
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full !py-2.5">
            {busy ? "Adding…" : "Add category"}
          </button>
        </form>
      </aside>
    </div>
  );
}
