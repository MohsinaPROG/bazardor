import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { changeInfo, formatPrice, toBn, unitShort } from "@/lib/format";
import { getCategories, getProducts } from "@/lib/products";
import { getCurrentUser } from "@/lib/session";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getProducts();
  const product = products.find((p) => p.slug === slug);
  return { title: product ? product.name : "পণ্য পাওয়া যায়নি" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  // Protected route: the middleware redirects first; this is the server-side check.
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/signin?notice=login_required&callbackUrl=${encodeURIComponent(`/product/${slug}`)}`);
  }

  const [{ products }, { categories }] = await Promise.all([getProducts(), getCategories()]);
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const change = changeInfo(product.changePercent);
  const category = categories.find((c) => c.slug === product.categorySlug);
  const yesterdayPrice = product.changePercent === 0 ? product.price : product.price / (1 + product.changePercent / 100);
  const delta = Math.round(Math.abs(product.price - yesterdayPrice));
  const deltaText =
    change.direction === "flat"
      ? "গতকালের তুলনায় দাম অপরিবর্তিত"
      : `গতকালের তুলনায় আজ দাম ${change.direction === "up" ? "বেড়েছে" : "কমেছে"} · ${toBn(delta)} টাকা`;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="text-sm text-base-content/60">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-primary">হোম</Link>
          </li>
          {category && (
            <li className="flex items-center gap-2">
              <span aria-hidden="true">›</span>
              <Link href={`/category/${category.slug}`} className="hover:text-primary">
                {category.name}
              </Link>
            </li>
          )}
          <li className="flex items-center gap-2 text-base-content">
            <span aria-hidden="true">›</span>
            <span aria-current="page">{product.name}</span>
          </li>
        </ol>
      </nav>

      {/* Summary */}
      <header className="flex flex-col gap-6 rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="grid size-20 shrink-0 place-items-center rounded-2xl bg-base-200 text-4xl"
          >
            {product.emoji}
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
            {product.summary && <p className="text-sm text-base-content/70">{product.summary}</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              {category && <span className="badge badge-outline">{category.name}</span>}
              <span className="badge badge-outline">{product.unit}</span>
            </div>
            <p className={`text-sm font-medium ${change.textClass}`}>{deltaText}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-base-200 px-6 py-4 text-left md:text-right">
          <p className="text-xs text-base-content/60">আজকের দাম</p>
          <p className="text-3xl font-bold">
            {toBn(Math.round(product.price))}{" "}
            <span className="text-base font-medium">টাকা / {unitShort(product.unit)}</span>
          </p>
          <span className={`badge mt-2 border-0 font-semibold ${change.badgeClass}`}>
            {change.label}
          </span>
        </div>
      </header>

      {/* Price summary */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">দামের সারসংক্ষেপ</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryStat label="সর্বনিম্ন দাম" value={formatPrice(product.min)} hint="সবচেয়ে কম দামের বাজার" />
          <SummaryStat label="সর্বাধিক দাম" value={formatPrice(product.max)} hint="সবচেয়ে বেশি দামের বাজার" />
          <SummaryStat label="গড় দাম" value={formatPrice(product.avg)} hint="সব বাজারের গড় মূল্য" />
        </div>
      </section>

      {/* Market table */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">বাজারভিত্তিক আজকের দাম</h2>
        <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr className="text-sm text-base-content/60">
                <th>বাজার</th>
                <th>বিভাগ</th>
                <th>সর্বনিম্ন</th>
                <th>সর্বাধিক</th>
                <th>গড়</th>
              </tr>
            </thead>
            <tbody>
              {product.markets.map((market) => (
                <tr key={market.name} className="hover:bg-base-200/60">
                  <td className="font-medium">{market.name}</td>
                  <td className="text-base-content/70">{market.division}</td>
                  <td>{formatPrice(market.min)}</td>
                  <td>{formatPrice(market.max)}</td>
                  <td className="font-semibold">{formatPrice(market.avg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
      <p className="text-sm text-base-content/60">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs text-base-content/60">{hint}</p>
    </div>
  );
}
