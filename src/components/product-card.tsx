import Link from "next/link";
import type { Product } from "@/lib/types";
import { changeInfo, formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const change = changeInfo(product.changePercent);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-2xl border border-base-300 bg-base-100 p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-xl bg-base-200 text-2xl"
        >
          {product.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold group-hover:text-primary">{product.name}</h3>
          <p className="text-sm text-base-content/60">{product.unit}</p>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2 border-t border-base-200 pt-3">
        <div>
          <p className="text-xs text-base-content/60">আজকের দাম</p>
          <p className="text-lg font-bold">{formatPrice(product.price)}</p>
        </div>
        <span className={`badge badge-sm border-0 px-2 py-3 font-semibold ${change.badgeClass}`}>
          {change.label}
        </span>
      </div>
    </Link>
  );
}
