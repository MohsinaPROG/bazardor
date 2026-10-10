import { Hero } from "@/components/hero";
import { PriceSection } from "@/components/price-section";
import { ProductCard } from "@/components/product-card";
import { toBn } from "@/lib/format";
import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

/** Top N products by price change, risers (desc) or fallers (asc). */
const topRisers = (list: Product[], n: number) =>
  list
    .filter((p) => p.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, n);

const topFallers = (list: Product[], n: number) =>
  list
    .filter((p) => p.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, n);

export default async function HomePage() {
  const { products, source } = await getProducts();

  return (
    <>
      <Hero productCount={products.length} />

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
        {source === "fallback" && (
          <div role="status" className="alert alert-warning text-sm">
            এই মুহূর্তে লাইভ ডেটা পাওয়া যাচ্ছে না — নমুনা দাম দেখানো হচ্ছে।
          </div>
        )}

        <PriceSection
          title="আজ দাম বেড়েছে"
          symbol="▲"
          products={topRisers(products, 6)}
          emptyText="আজ দাম বেড়েছে এমন কোনো পণ্য নেই।"
        />

        <PriceSection
          title="আজ দাম কমেছে"
          symbol="▼"
          products={topFallers(products, 6)}
          emptyText="আজ দাম কমেছে এমন কোনো পণ্য নেই।"
        />

        <section id="সব-পণ্য" className="scroll-mt-44 space-y-4">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">সব পণ্য</h2>
            <p className="text-sm text-base-content/60">
              মোট {toBn(products.length)}টি পণ্য দেখানো হচ্ছে
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
