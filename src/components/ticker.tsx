import type { Product } from "@/lib/types";
import { changeInfo, formatPrice, unitShort } from "@/lib/format";

/** Infinite price marquee under the navbar. The list is duplicated for a seamless loop. */
export function Ticker({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  const loop = [...products, ...products];

  return (
    <div
      role="region"
      aria-label="আজকের দামের তালিকা"
      className="ticker-wrap overflow-hidden border-b border-base-300 bg-base-100"
    >
      <div className="flex w-max animate-ticker py-2.5">
        {loop.map((product, index) => {
          const change = changeInfo(product.changePercent);
          const isDuplicate = index >= products.length;
          return (
            <span
              key={`${product.id}-${index}`}
              aria-hidden={isDuplicate || undefined}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap px-5 text-sm"
            >
              <span aria-hidden="true">{product.emoji}</span>
              <span className="font-semibold">{product.name}</span>
              <span className="text-base-content/70">
                {formatPrice(product.price)}/{unitShort(product.unit)}
              </span>
              <span className={`font-semibold ${change.textClass}`}>{change.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
