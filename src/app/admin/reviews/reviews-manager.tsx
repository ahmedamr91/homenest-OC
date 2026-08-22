"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Review = {
  id: number;
  productName: string;
  name: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  createdAt: string;
};

export default function ReviewsManager({ initial }: { initial: Review[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "ALL">("PENDING");

  async function act(id: number, action: "approve" | "delete") {
    if (action === "delete" && !window.confirm("Delete this review?")) return;
    setBusy(true);
    await fetch(`/api/admin/reviews/${id}`, { method: action === "approve" ? "PATCH" : "DELETE" }).catch(
      () => {}
    );
    setBusy(false);
    router.refresh();
  }

  const filtered = initial.filter((r) =>
    filter === "ALL" ? true : filter === "PENDING" ? !r.approved : r.approved
  );

  const pendingCount = initial.filter((r) => !r.approved).length;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["PENDING", "APPROVED", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              filter === f
                ? "bg-ink text-cream"
                : "border border-ink/15 bg-white text-ink/60 hover:border-clay"
            }`}
          >
            {f}
            <span className="ml-1.5 opacity-60">
              {f === "ALL"
                ? initial.length
                : f === "PENDING"
                  ? pendingCount
                  : initial.length - pendingCount}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-14 text-center text-sm text-ink/50">
          Nothing here — {filter === "PENDING" ? "no reviews waiting for approval." : `no ${filter.toLowerCase()} reviews.`}
        </div>
      )}

      <ul className="space-y-3">
        {filtered.map((r) => (
          <li key={r.id} className={`card flex flex-wrap items-center gap-x-5 gap-y-2 p-4 ${r.approved ? "" : "border-l-4 border-l-amber-400"}`}>
            <span className="text-sm tracking-tight" aria-label={`${r.rating} stars`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= r.rating ? "text-amber-500" : "text-ink/20"}>
                  ★
                </span>
              ))}
            </span>
            <span className="min-w-[160px] flex-1">
              <span className="block truncate text-sm font-semibold">{r.productName}</span>
              <span className="text-xs text-ink/50">by {r.name}</span>
            </span>
            {r.comment && (
              <span className="min-w-[200px] flex-1 truncate text-sm italic text-ink/60" title={r.comment}>
                “{r.comment}”
              </span>
            )}
            <span className="text-xs text-ink/40">
              {new Date(r.createdAt).toLocaleDateString("en-EG", { month: "short", day: "numeric" })}
            </span>
            <span className="flex gap-2">
              {!r.approved && (
                <button
                  onClick={() => act(r.id, "approve")}
                  disabled={busy}
                  className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-200 disabled:opacity-50"
                >
                  ✓ Approve
                </button>
              )}
              <button
                onClick={() => act(r.id, "delete")}
                disabled={busy}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
