"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
};

export default function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create category.");
      setName("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
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
              <th className="px-4 py-3.5 font-bold">Slug</th>
              <th className="px-4 py-3.5 font-bold">Products</th>
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initial.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0 hover:bg-sand/40">
                <td className="px-5 py-3.5 font-medium">{c.name}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-ink/60">{c.slug}</td>
                <td className="px-4 py-3.5">{c.productCount}</td>
                <td className="px-5 py-3.5 text-right">
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
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <form onSubmit={addCategory} className="card space-y-4 p-6">
          <h2 className="font-semibold">Add a category</h2>
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
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="btn-primary w-full !py-2.5">
            {busy ? "Adding…" : "Add category"}
          </button>
        </form>
      </aside>
    </div>
  );
}
