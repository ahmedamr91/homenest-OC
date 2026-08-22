"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/utils";

type RowProduct = {
  id: number;
  name: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  published: boolean;
  featured: boolean;
  category: string;
  colors: { id: number; name: string; hex: string }[];
};

export default function ProductRow({ product }: { product: RowProduct }) {
  const router = useRouter();

  return (
    <tr className="border-b border-ink/5 last:border-0 hover:bg-sand/40">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-10 w-10 shrink-0 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${product.colors[0]?.hex || "#D6C3A5"}bb, ${product.colors[0]?.hex || "#D6C3A5"})`,
            }}
          />
          <span className="font-medium">{product.name}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-ink/70">{product.category}</td>
      <td className="px-4 py-3.5">
        <div className="flex -space-x-1">
          {product.colors.slice(0, 5).map((c) => (
            <span
              key={c.id}
              title={c.name}
              className="h-4 w-4 rounded-full border-2 border-white"
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <span className="ml-2 text-xs text-ink/50">{product.colors.length}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 font-semibold">{formatMoney(product.price)}</td>
      <td className="px-4 py-3.5">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            product.stock === 0
              ? "bg-red-100 text-red-700"
              : product.stock <= 10
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {product.stock}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            product.published ? "bg-emerald-100 text-emerald-800" : "bg-ink/10 text-ink/60"
          }`}
        >
          {product.published ? "Live" : "Hidden"}
        </span>
        {product.featured && (
          <span className="ml-1 rounded-full bg-clay/10 px-2 py-1 text-[11px] font-bold text-clay">★</span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/products/${product.id}`}
            className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-semibold transition hover:border-clay hover:text-clay"
          >
            Edit
          </Link>
          <button
            onClick={() =>
              window.confirm(`Delete "${product.name}"?`) &&
              fetch(`/api/admin/products/${product.id}`, { method: "DELETE" }).then(() =>
                router.refresh()
              )
            }
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
