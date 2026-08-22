"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
      setMessage(data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Try again.");
    }
  }

  if (status === "done") {
    return (
      <p className="mx-auto mt-7 max-w-md rounded-xl bg-cream/10 px-5 py-3 text-sm font-medium text-cream">
        ✓ {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
      <input
        type="email"
        name="email"
        required
        placeholder="Your email address"
        className="w-full rounded-full bg-cream/10 px-5 py-3 text-sm text-cream placeholder:text-cream/50 focus:border-clay focus:outline-none"
      />
      <button type="submit" disabled={status === "sending"} className="btn-primary shrink-0 !px-6 !bg-clay hover:!bg-clay-dark">
        {status === "sending" ? "…" : "Subscribe"}
      </button>
      {status === "error" && <p className="text-xs text-red-300 sm:sr-only">{message}</p>}
    </form>
  );
}
