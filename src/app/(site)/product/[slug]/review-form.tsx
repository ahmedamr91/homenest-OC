"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ productId }: { productId: number }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name: fd.get("name"),
          rating,
          comment: fd.get("comment") || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send review.");
      setStatus("done");
      setMessage(data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        {message}
      </p>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary !px-5 !py-2 text-xs">
        ✍ Write a review
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl2 border border-ink/10 bg-white p-5">
      <div>
        <span className="label">Your rating *</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
              className={`text-2xl leading-none transition ${
                i <= (hover || rating) ? "text-amber-500 scale-110" : "text-ink/20"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="rname" className="label">Name *</label>
        <input id="rname" name="name" required minLength={2} maxLength={80} className="input" />
      </div>
      <div>
        <label htmlFor="rcomment" className="label">Your review</label>
        <textarea id="rcomment" name="comment" rows={3} maxLength={1000} className="input resize-none"
          placeholder="What did you like about it?" />
      </div>
      {status === "error" && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{message}</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={status === "sending"} className="btn-primary !px-6 !py-2.5 text-sm">
          {status === "sending" ? "Sending…" : "Submit review"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 text-sm font-semibold text-ink/50 hover:text-clay">
          Cancel
        </button>
      </div>
    </form>
  );
}
