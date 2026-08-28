"use client";

import { useState } from "react";

type Item = { title: string; content: string | null };

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function ProductAccordions({ items }: { items: Item[] }) {
  const visible = items.filter((i) => i.content && i.content.trim().length > 0);
  const [open, setOpen] = useState<number | null>(0);

  if (visible.length === 0) return null;

  return (
    <div className="mt-8 space-y-3">
      {visible.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div key={item.title} className="overflow-hidden rounded-xl border border-ink/15 bg-white">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : idx)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-[15px] font-semibold text-ink">{item.title}</span>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${isOpen ? "border-[#D22928] bg-[#D22928] text-white" : "border-ink/15 text-ink/60"}`}>
                <Chevron open={isOpen} />
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <div className="border-t border-ink/10 px-5 py-4 text-sm leading-relaxed text-ink/70 whitespace-pre-wrap">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
