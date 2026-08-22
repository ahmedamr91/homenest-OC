"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/utils";

type Discount = {
  id: number;
  code: string;
  type: string;
  value: number;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
};

export default function DiscountManager({ initial }: { initial: Discount[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "FIXED",
    value: "",
    minOrder: "",
    maxUses: "",
    expiresAt: "",
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrder: form.minOrder === "" ? null : Number(form.minOrder),
          maxUses: form.maxUses === "" ? null : Number(form.maxUses),
          expiresAt:
            form.expiresAt === ""
              ? null
              : new Date(form.expiresAt + "T23:59:59").toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create the code.");
      setForm({ code: "", type: "PERCENT", value: "", minOrder: "", maxUses: "", expiresAt: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(d: Discount) {
    await fetch(`/api/admin/discounts/${d.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !d.active }),
    }).catch(() => {});
    router.refresh();
  }

  async function remove(id: number, code: string) {
    if (!window.confirm(`Delete code ${code}?`)) return;
    await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" }).catch(() => {});
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-sand/40 text-left text-xs uppercase tracking-wider text-ink/50">
              <th className="px-5 py-3.5 font-bold">Code</th>
              <th className="px-4 py-3.5 font-bold">Discount</th>
              <th className="px-4 py-3.5 font-bold">Min order</th>
              <th className="px-4 py-3.5 font-bold">Used</th>
              <th className="px-4 py-3.5 font-bold">Expires</th>
              <th className="px-4 py-3.5 font-bold">Status</th>
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initial.map((d) => (
              <tr key={d.id} className={`border-b border-ink/5 last:border-0 ${d.active ? "" : "opacity-50"}`}>
                <td className="px-5 py-3.5 font-mono font-bold text-clay">{d.code}</td>
                <td className="px-4 py-3.5 font-semibold">
                  {d.type === "PERCENT" ? `${d.value}%` : formatMoney(d.value)}
                </td>
                <td className="px-4 py-3.5 text-ink/70">
                  {d.minOrder != null ? formatMoney(d.minOrder) : "—"}
                </td>
                <td className="px-4 py-3.5">
                  {d.usedCount}
                  {d.maxUses != null && <span className="text-ink/40"> / {d.maxUses}</span>}
                </td>
                <td className="px-4 py-3.5 text-ink/60">
                  {d.expiresAt
                    ? new Date(d.expiresAt).toLocaleDateString("en-EG")
                    : "Never"}
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => toggle(d)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                      d.active
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-ink/10 text-ink/60 hover:bg-ink/20"
                    }`}
                  >
                    {d.active ? "Active" : "Off"}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => remove(d.id, d.code)}
                    disabled={busy}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {initial.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-ink/50">
                  No codes yet — create your first promo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <form onSubmit={create} className="card space-y-4 p-6">
          <h2 className="font-semibold">New discount code</h2>
          <div>
            <label htmlFor="dcode" className="label">Code *</label>
            <input
              id="dcode"
              required
              minLength={3}
              maxLength={40}
              pattern="[A-Za-z0-9_-]+"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="input font-mono uppercase"
              placeholder="SUMMER25"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dtype" className="label">Type *</label>
              <select
                id="dtype"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENT" | "FIXED" })}
                className="input cursor-pointer"
              >
                <option value="PERCENT">% off</option>
                <option value="FIXED">EGP off</option>
              </select>
            </div>
            <div>
              <label htmlFor="dvalue" className="label">
                {form.type === "PERCENT" ? "Percent *" : "Amount EGP *"}
              </label>
              <input
                id="dvalue"
                type="number"
                required
                min={form.type === "PERCENT" ? 1 : 0.01}
                max={form.type === "PERCENT" ? 90 : undefined}
                step={form.type === "PERCENT" ? 1 : 0.01}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="input"
                placeholder={form.type === "PERCENT" ? "10" : "100"}
              />
            </div>
          </div>
          <div>
            <label htmlFor="dmin" className="label">Minimum order (EGP)</label>
            <input id="dmin" type="number" min="0" step="0.01" value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="input" placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dmax" className="label">Max uses</label>
              <input id="dmax" type="number" min="1" value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="input" placeholder="∞" />
            </div>
            <div>
              <label htmlFor="dexp" className="label">Expires</label>
              <input id="dexp" type="date" value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="input" />
            </div>
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
          )}
          <button type="submit" disabled={busy} className="btn-primary w-full !py-2.5">
            {busy ? "Creating…" : "Create code"}
          </button>
        </form>
      </aside>
    </div>
  );
}
