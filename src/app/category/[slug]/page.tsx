import Link from "next/link";
import type { Metadata } from "next";
import { SortableProductList } from "@/components/sortable-product-list";
import { getCategories, getProducts } from "@/lib/products";
import { toBn } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  return { title: category ? category.name : "বিভাগ পাওয়া যায়নি" };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [{ categories }, { products }] = await Promise.all([getCategories(), getProducts()]);

  const category = categories.find((c) => c.slug === slug);
  const items = products.filter((p) => p.categorySlug === slug);

  // Invalid slug or empty category -> friendly 404-style empty state
  if (!category || items.length === 0) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
        <p className="text-6xl font-bold text-primary">৪০৪</p>
        <h1 className="text-2xl font-bold">এই বিভাগে কোনো পণ্য পাওয়া যায়নি</h1>
        <p className="text-base-content/70">বিভাগের ঠিকানাটি ভুল হতে পারে, অথবা এখন কোনো তথ্য নেই।</p>
        <Link href="/" className="btn btn-primary btn-sm font-semibold sm:btn-md">
          হোম পেজে ফিরে যান
        </Link>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6">
        <span
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-base-200 text-3xl"
        >
          {category.emoji}
        </span>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{category.name}</h1>
          <p className="text-sm text-base-content/60">
            {toBn(items.length)}টি পণ্যের আজকের দাম ও পরিবর্তন
          </p>
        </div>
      </header>

      <SortableProductList products={items} />
    </div>
  );
}
