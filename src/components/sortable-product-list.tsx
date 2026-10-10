"use client";

import { useMemo, useState } from "react";
import type { Product, SortMode } from "@/lib/types";
import { toBn } from "@/lib/format";
import { ProductCard } from "./product-card";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "default", label: "ডিফল্ট" },
  { value: "asc", label: "দাম: কম থেকে বেশি" },
  { value: "desc", label: "দাম: বেশি থেকে কম" },
];

/** Sorts on the numeric price (Bengali digits are already parsed to numbers). */
function sortProducts(list: Product[], mode: SortMode): Product[] {
  if (mode === "default") return list;
  return [...list].sort((a, b) => (mode === "asc" ? a.price - b.price : b.price - a.price));
}

export function SortableProductList({ products }: { products: Product[] }) {
  const [mode, setMode] = useState<SortMode>("default");
  const sorted = useMemo(() => sortProducts(products, mode), [products, mode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-base-content/60">মোট {toBn(products.length)}টি পণ্য দেখানো হচ্ছে</p>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-base-content/70">সাজান</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as SortMode)}
            className="select select-sm w-56 rounded-lg bg-base-100 font-medium"
            aria-label="পণ্য সাজানোর পদ্ধতি"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
