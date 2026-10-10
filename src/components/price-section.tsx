import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

type Props = {
  title: string;
  symbol: "▲" | "▼";
  products: Product[];
  emptyText: string;
};

export function PriceSection({ title, symbol, products, emptyText }: Props) {
  const toneClass = symbol === "▲" ? "text-success" : "text-error";

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
        <span aria-hidden="true" className={toneClass}>
          {symbol}
        </span>
        {title}
      </h2>

      {products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-center text-sm text-base-content/60">
          {emptyText}
        </p>
      )}
    </section>
  );
}
