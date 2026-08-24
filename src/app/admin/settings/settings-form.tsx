"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ShippingSettings } from "@/lib/settings";

export default function SettingsForm({
  initial,
}: {
  initial: ShippingSettings;
}) {
  const router = useRouter();
  const [threshold, setThreshold] = useState(String(initial.freeShippingThreshold));
  const [flatFee, setFlatFee] = useState(String(initial.flatShippingFee));
  const [cityFees, setCityFees] = useState<Record<string, number>>({
    ...initial.cityFees,
  });
  const [returnsDays, setReturnsDays] = useState(String(initial.returnsDays));
  const [returnsNote, setReturnsNote] = useState(initial.returnsNote);
  const [whatsappBot, setWhatsappBot] = useState(initial.whatsappBot);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedCities = useMemo(() => Object.keys(cityFees).sort(), [cityFees]);

  function setFee(city: string, value: string) {
    setCityFees((prev) => ({ ...prev, [city]: value === "" ? 0 : Number(value) }));
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const payload: ShippingSettings = {
        freeShippingThreshold: Number(threshold) || 0,
        flatShippingFee: Number(flatFee) || 0,
        cityFees,
        returnsDays: Number(returnsDays) || 0,
        returnsNote: returnsNote.trim() || "30 days, no questions asked",
        whatsappBot,
      };
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save settings.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="card p-6">
          <h2 className="mb-1 font-semibold">Shipping</h2>
          <p className="mb-5 text-sm text-ink/60">
            Fees per governorate. Free shipping overrides every fee when the
            order total passes the threshold.
          </p>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="threshold" className="label">
                Free shipping threshold (EGP)
              </label>
              <input
                id="threshold"
                type="number"
                min="0"
                step="1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="input"
              />
              <p className="mt-1 text-xs text-ink/50">Orders above this ship free</p>
            </div>
            <div>
              <label htmlFor="flat" className="label">
                Fallback flat fee (EGP)
              </label>
              <input
                id="flat"
                type="number"
                min="0"
                step="1"
                value={flatFee}
                onChange={(e) => setFlatFee(e.target.value)}
                className="input"
              />
              <p className="mt-1 text-xs text-ink/50">
                Used for cities without a custom fee
              </p>
            </div>
          </div>

          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/50">
            Fee per governorate (EGP)
          </h3>
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCities.map((city) => (
              <div
                key={city}
                className="flex items-center justify-between gap-2 rounded-lg border border-ink/10 bg-sand/30 px-3 py-1.5"
              >
                <span className="truncate text-sm">{city}</span>
                <input
                  type="number"
                  min="0"
                  value={cityFees[city]}
                  onChange={(e) => setFee(city, e.target.value)}
                  aria-label={`Shipping fee for ${city}`}
                  className="w-20 shrink-0 rounded-md border border-ink/15 bg-white px-2 py-1 text-right text-sm focus:border-clay focus:outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-5 font-semibold">Returns policy</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="rdays" className="label">
                Return window (days)
              </label>
              <input
                id="rdays"
                type="number"
                min="0"
                max="365"
                value={returnsDays}
                onChange={(e) => setReturnsDays(e.target.value)}
                className="input"
              />
              <p className="mt-1 text-xs text-ink/50">
                Shown on product pages, home and footer
              </p>
            </div>
            <div>
              <label htmlFor="rnote" className="label">
                Policy text (shown to customers)
              </label>
              <input
                id="rnote"
                maxLength={200}
                value={returnsNote}
                onChange={(e) => setReturnsNote(e.target.value)}
                className="input"
                placeholder="30 days, no questions asked"
              />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-1 font-semibold">WhatsApp bot</h2>
          <p className="mb-4 text-sm text-ink/60">
            Auto-replies to customers who message your WhatsApp Business
            number: order status by order number, catalog link, and a
            hand-off note for anything else.
          </p>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={whatsappBot}
              onChange={(e) => setWhatsappBot(e.target.checked)}
              className="h-4 w-4 accent-[#B4552D]"
            />
            Enable the WhatsApp bot
          </label>
          <p className="mt-2 text-xs text-ink/50">
            Requires the WhatsApp env vars to be configured on the server —
            otherwise the bot stays silent even when enabled.
          </p>
        </section>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="card space-y-4 p-6">
          <h2 className="font-semibold">Preview</h2>
          <ul className="space-y-2 rounded-xl bg-sand/60 p-4 text-sm leading-relaxed text-ink/70">
            <li>
              Free shipping over{" "}
              <strong>EGP {(Number(threshold) || 0).toLocaleString()}</strong>
            </li>
            <li>
              Fallback fee:{" "}
              <strong>EGP {(Number(flatFee) || 0).toFixed(0)}</strong> · Cairo:{" "}
              <strong>EGP {(cityFees["Cairo"] ?? 0).toFixed(0)}</strong> · Aswan:{" "}
              <strong>EGP {(cityFees["Aswan"] ?? 0).toFixed(0)}</strong>
            </li>
            <li>{returnsNote.trim()}</li>
          </ul>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          <p className="text-center text-[11px] text-ink/50">
            Applies instantly to checkout, product pages and emails.
          </p>
        </div>
      </aside>
    </div>
  );
}
