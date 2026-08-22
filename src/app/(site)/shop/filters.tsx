"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  categories: { slug: string; name: string; count: number }[];
  colors: string[];
  current: Record<string, string>;
};

export default function ShopFilters({ categories, colors, current }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(current.q || "");

  function update(changes: Record<string, string | null>) {
    const params = new URLSearchParams(current);
    Object.entries(changes).forEach(([k, v]) => {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    });
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }

  function toggle(key: string, value: string) {
    update({ [key]: current[key] === value ? null : value });
  }

  return (
    <aside className="space-y-7 lg:sticky lg:top-24 lg:self-start">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ q });
        }}
      >
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="input"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-ink px-3.5 text-white transition hover:bg-clay"
            aria-label="Search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
        </div>
      </form>

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/50">
          Category
        </h3>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => update({ category: null })}
              className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                !current.category
                  ? "bg-clay/10 font-semibold text-clay"
                  : "text-ink/70 hover:bg-sand"
              }`}
            >
              All products
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => toggle("category", c.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition ${
                  current.category === c.slug
                    ? "bg-clay/10 font-semibold text-clay"
                    : "text-ink/70 hover:bg-sand"
                }`}
              >
                {c.name}
                <span className="text-xs text-ink/40">{c.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/50">
          Color
        </h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((name) => (
            <button
              key={name}
              onClick={() => toggle("color", name)}
              title={name}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                current.color === name
                  ? "bg-ink text-cream"
                  : "border border-ink/15 bg-white text-ink/70 hover:border-clay"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/50">
          Price range
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            update({
              min: String(fd.get("min") || ""),
              max: String(fd.get("max") || ""),
            });
          }}
          className="flex items-center gap-2"
        >
          <input
            name="min"
            type="number"
            min="0"
            defaultValue={current.min}
            placeholder="Min"
            className="input !px-3"
          />
          <span className="text-ink/40">–</span>
          <input
            name="max"
            type="number"
            min="0"
            defaultValue={current.max}
            placeholder="Max"
            className="input !px-3"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-ink px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-clay"
          >
            Go
          </button>
        </form>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/50">
          Sort by
        </h3>
        <select
          value={current.sort || "newest"}
          onChange={(e) => update({ sort: e.target.value })}
          className="input cursor-pointer"
          aria-label="Sort products"
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {(current.category || current.color || current.min || current.max || current.q) && (
        <button
          onClick={() => router.push("/shop")}
          className="text-sm font-semibold text-clay hover:underline"
        >
          ✕ Clear all filters
        </button>
      )}
    </aside>
  );
}
