"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { productArt } from "@/lib/art";

type Color = { name: string; hex: string };
type Category = { id: number; name: string };

export type ProductFormValues = {
  id?: number;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  featured: boolean;
  published: boolean;
  imageUrl: string | null;
  categoryId: number | null;
  colors: { id?: number; name: string; hex: string }[];
  images: string[];
};

const PALETTE = [
  ["#B4552D", "Terracotta"], ["#C06A42", "Clay"], ["#D6C3A5", "Sand"],
  ["#EDE6DA", "Off-White"], ["#9CAF88", "Sage"], ["#4A5D43", "Forest"],
  ["#5C6B73", "Slate Blue"], ["#2B2926", "Charcoal"], ["#C19A6B", "Camel"],
  ["#A67C52", "Brass"], ["#C99A3C", "Mustard"], ["#7A7570", "Smoke Grey"],
];

export default function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial: ProductFormValues;
}) {
  const router = useRouter();
  const isEdit = !!initial.id;

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(String(initial.price || ""));
  const [comparePrice, setComparePrice] = useState(
    initial.comparePrice != null ? String(initial.comparePrice) : ""
  );
  const [stock, setStock] = useState(String(initial.stock));
  const [featured, setFeatured] = useState(initial.featured);
  const [published, setPublished] = useState(initial.published);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl || "");
  const [categoryId, setCategoryId] = useState<number | null>(
    initial.categoryId ?? categories[0]?.id ?? null
  );
  const [colors, setColors] = useState<Color[]>(
    initial.colors.map((c) => ({ name: c.name, hex: c.hex }))
  );
  const [images, setImages] = useState<string[]>(initial.images);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const room = 8 - images.length;
    if (room <= 0) {
      setError("Maximum 8 photos per product.");
      return;
    }
    setUploading(true);
    const list = Array.from(files).slice(0, room);
    for (const f of list) {
      if (f.size > 4 * 1024 * 1024) {
        setError(`"${f.name}" is over 4MB — skipped.`);
        continue;
      }
      try {
        const fd = new FormData();
        fd.set("file", f);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Upload failed.");
          continue;
        }
        setImages((prev) => (prev.length < 8 ? [...prev, data.url] : prev));
      } catch {
        setError("Upload failed. Check your connection.");
      }
    }
    setUploading(false);
  }

  function setColor(i: number, patch: Partial<Color>) {
    setColors((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (colors.length > 0 && colors.some((c) => !c.name.trim())) {
      setError("Every color needs a name (e.g. “Terracotta”).");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/products/${initial.id}` : "/api/admin/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            price: Number(price),
            comparePrice: comparePrice === "" ? null : Number(comparePrice),
            stock: Number(stock),
            featured,
            published,
            imageUrl: imageUrl.trim() === "" ? null : imageUrl.trim(),
            categoryId,
            colors,
            images,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save the product.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      setSaving(false);
    }
  }

  const previewArt = productArt(
    colors.length ? colors.map((c) => c.hex) : ["#D6C3A5"],
    initial.id || 0
  );

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="card p-6">
          <h2 className="mb-5 font-semibold">Basics</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Product name *</label>
              <input id="name" required minLength={2} maxLength={150} value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Ceramic Table Lamp" />
            </div>
            <div>
              <label htmlFor="desc" className="label">Description * <span className="normal-case text-ink/40">(min 10 chars)</span></label>
              <textarea id="desc" required minLength={10} maxLength={5000} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-y" placeholder="What makes this piece special?" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="price" className="label">Price ($) *</label>
                <input id="price" type="number" step="0.01" min="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="input" />
              </div>
              <div>
                <label htmlFor="cmp" className="label">Compare-at price</label>
                <input id="cmp" type="number" step="0.01" min="0" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} className="input" placeholder="Optional" />
              </div>
              <div>
                <label htmlFor="stock" className="label">Stock *</label>
                <input id="stock" type="number" min="0" step="1" required value={stock} onChange={(e) => setStock(e.target.value)} className="input" />
              </div>
            </div>
            <div>
              <label htmlFor="cat" className="label">Category *</label>
              <select id="cat" value={categoryId ?? ""} onChange={(e) => setCategoryId(Number(e.target.value))} className="input cursor-pointer">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="img" className="label">Image URL <span className="normal-case text-ink/40">(optional — leave empty to use generated art)</span></label>
              <input id="img" type="url" maxLength={1000} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input" placeholder="https://…" />
            </div>
            <div className="flex flex-wrap gap-5 pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-[#B4552D]" />
                Published (visible in store)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-[#B4552D]" />
                Featured on homepage
              </label>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-semibold">Product photos</h2>
            <span className="text-xs text-ink/50">{images.length}/8</span>
          </div>
          <p className="mb-4 text-sm text-ink/60">
            Upload real photos (JPG/PNG/WebP, max 4MB each). Shoppers see them in a gallery.
          </p>

          {images.length > 0 && (
            <div className="mb-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((url, i) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-ink/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-clay px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/20 py-4 text-sm font-semibold transition hover:border-clay hover:text-clay ${images.length >= 8 || uploading ? "pointer-events-none opacity-50" : ""}`}>
            {uploading ? "Uploading…" : images.length === 0 ? "📷 Upload photos" : "＋ Add more photos"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                void uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </section>

        <section className="card p-6">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-semibold">Available colors</h2>
            <span className="text-xs text-ink/50">{colors.length}/12</span>
          </div>
          <p className="mb-5 text-sm text-ink/60">
            Shoppers pick one of these when adding to cart. The first color is shown by default.
          </p>

          <div className="space-y-3">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl border border-ink/10 bg-sand/30 p-3">
                <input
                  type="color"
                  value={c.hex}
                  onChange={(e) => setColor(i, { hex: e.target.value })}
                  aria-label={`Color ${i + 1} picker`}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-ink/15 bg-white p-1"
                />
                <input
                  value={c.name}
                  onChange={(e) => setColor(i, { name: e.target.value })}
                  maxLength={50}
                  placeholder={`Color ${i + 1} name`}
                  className="input flex-1 !py-2"
                />
                <button
                  type="button"
                  onClick={() => setColors((p) => p.filter((_, idx) => idx !== i))}
                  aria-label={`Remove color ${i + 1}`}
                  className="rounded-lg px-2.5 py-2 text-sm text-red-500 transition hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {colors.length < 12 && (
            <button
              type="button"
              onClick={() => setColors((p) => [...p, { name: "", hex: PALETTE[(p.length * 3 + 1) % PALETTE.length][0] }])}
              className="mt-4 w-full rounded-xl border-2 border-dashed border-ink/20 py-3 text-sm font-semibold text-ink/60 transition hover:border-clay hover:text-clay"
            >
              ＋ Add a color
            </button>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-ink/50">
              Quick palette
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {PALETTE.map(([hex, pname]) => (
                <button
                  key={hex}
                  type="button"
                  title={pname}
                  onClick={() =>
                    colors.length < 12 &&
                    setColors((p) => [...p, { name: pname, hex }])
                  }
                  className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1 text-xs transition hover:border-clay"
                >
                  <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                  {pname}
                </button>
              ))}
            </div>
          </details>
        </section>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
        <section className="card overflow-hidden">
          <div className="aspect-square bg-sand/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewArt} alt="Product preview" className="h-full w-full object-cover" />
          </div>
          <div className="border-t border-ink/10 px-4 py-3 text-center text-xs text-ink/50">
            Live preview with your selected colors
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="w-full rounded-full py-2.5 text-center text-sm font-semibold text-ink/60 transition hover:text-clay"
        >
          Cancel
        </button>
      </aside>
    </form>
  );
}
