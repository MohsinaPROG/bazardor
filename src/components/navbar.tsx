import Link from "next/link";
import { getCategories } from "@/lib/products";
import { getCurrentUser } from "@/lib/session";
import { banglaDate } from "@/lib/format";
import { CategoryNav } from "./category-nav";
import { UserMenu } from "./user-menu";

export async function Navbar() {
  const [user, { categories }] = await Promise.all([getCurrentUser(), getCategories()]);

  return (
    <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="বাজার দর — হোম পেজ">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-lg"
          >
            🛒
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-bold leading-tight sm:text-xl">বাজার দর</span>
            <span className="block truncate text-xs text-base-content/60">{banglaDate()}</span>
          </span>
        </Link>

        {user ? (
          <UserMenu name={user.name} email={user.email} />
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/signin" className="btn btn-ghost btn-sm font-semibold sm:btn-md">
              সাইন ইন
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm font-semibold sm:btn-md">
              সাইন আপ
            </Link>
          </div>
        )}
      </div>

      <div className="border-t border-base-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <CategoryNav categories={categories} />
        </div>
      </div>
    </header>
  );
}
