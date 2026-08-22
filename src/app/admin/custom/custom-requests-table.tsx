"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  formatMoney,
  CUSTOM_STATUSES,
  CUSTOM_STATUS_STYLES,
} from "@/lib/utils";

type Request = {
  id: number;
  reference: string;
  customerName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
  budget: number | null;
  imagePath: string | null;
  status: string;
  createdAt: string;
  colors: string[];
};

export default function CustomRequestsTable({ initial }: { initial: Request[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("ALL");

  async function updateStatus(id: number, status: string) {
    setBusy(true);
    await fetch(`/api/admin/custom-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  const filtered =
    filter === "ALL" ? initial : initial.filter((r) => r.status === filter);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {["ALL", ...CUSTOM_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              filter === s
                ? "bg-ink text-cream"
                : "border border-ink/15 bg-white text-ink/60 hover:border-clay"
            }`}
          >
            {s.replace("_", " ")}
            {s !== "ALL" && (
              <span className="ml-1.5 opacity-60">
                {initial.filter((r) => r.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-14 text-center text-sm text-ink/50">
          No custom requests with this status yet.
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="card overflow-hidden">
            <button
              onClick={() => setOpenId(openId === r.id ? null : r.id)}
              aria-expanded={openId === r.id}
              className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-left transition hover:bg-sand/40"
            >
              {r.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.imagePath}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg border border-ink/10 object-cover"
                />
              ) : (
                <span className="h-12 w-12 shrink-0 rounded-lg bg-sand" />
              )}
              <span className="min-w-[180px] flex-1">
                <span className="block truncate text-sm font-semibold">{r.title}</span>
                <span className="font-mono text-xs text-clay">{r.reference}</span>
              </span>
              <span className="text-sm text-ink/70">{r.customerName}</span>
              <span className="text-xs text-ink/50">
                {new Date(r.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex -space-x-1">
                {r.colors.slice(0, 4).map((hex, i) => (
                  <span
                    key={`${r.id}-${i}`}
                    className="h-4 w-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${CUSTOM_STATUS_STYLES[r.status]}`}
              >
                {r.status.replace("_", " ")}
              </span>
            </button>

            {openId === r.id && (
              <div className="grid gap-6 border-t border-ink/10 bg-sand/20 px-5 py-5 md:grid-cols-[300px_1fr_240px]">
                {r.imagePath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.imagePath}
                    alt={`Inspiration for ${r.title}`}
                    className="max-h-72 w-full rounded-xl border border-ink/10 object-cover"
                  />
                )}

                <div className="min-w-0 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-ink/50">The piece</h3>
                    <p className="mt-1.5 font-semibold">{r.title}</p>
                    {r.budget != null && (
                      <p className="mt-1 text-sm">
                        Customer budget:{" "}
                        <strong>{formatMoney(r.budget)}</strong>
                      </p>
                    )}
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/70">
                      {r.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-ink/50">
                      Colors ({r.colors.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {r.colors.map((hex, i) => (
                        <a
                          key={`${r.id}-c-${i}`}
                          href={`https://www.colorhexa.com/${hex.slice(1)}`}
                          target="_blank"
                          rel="noreferrer"
                          title={`Open ${hex} details`}
                          className="flex items-center gap-2 rounded-full border border-ink/15 bg-white px-3 py-1.5 font-mono text-xs transition hover:border-clay"
                        >
                          <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                          {hex.toUpperCase()}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-ink/50">Customer</h3>
                    <p className="text-sm leading-relaxed text-ink/70">
                      <strong className="text-ink">{r.customerName}</strong><br />
                      {r.phone}<br />
                      {r.email}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-ink/50">Status</h3>
                    <select
                      value={r.status}
                      disabled={busy}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      className="input cursor-pointer font-semibold"
                      aria-label={`Status for ${r.reference}`}
                    >
                      {CUSTOM_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() =>
                      window.confirm(`Delete request ${r.reference}?`) &&
                      fetch(`/api/admin/custom-requests/${r.id}`, { method: "DELETE" }).then(() =>
                        router.refresh()
                      )
                    }
                    className="btn-danger w-full"
                  >
                    Delete request
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
