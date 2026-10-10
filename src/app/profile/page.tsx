import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = { title: "আমার প্রোফাইল" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?notice=login_required&callbackUrl=%2Fprofile");

  const initial = user.name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">আমার প্রোফাইল</h1>
        <p className="text-sm text-base-content/70">আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।</p>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-content">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user.name}</p>
            <p className="truncate text-sm text-base-content/70">{user.email}</p>
          </div>
        </div>
        <div className="w-full sm:w-40">
          <SignOutButton className="btn btn-outline btn-error btn-sm w-full sm:btn-md" />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">তথ্য</h2>
          <Link href="/profile/update" className="btn btn-outline btn-sm font-semibold">
            আপডেট
          </Link>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-base-200 p-4">
            <dt className="text-base-content/60">নাম</dt>
            <dd className="mt-1 font-medium">{user.name}</dd>
          </div>
          <div className="rounded-xl bg-base-200 p-4">
            <dt className="text-base-content/60">ইমেইল</dt>
            <dd className="mt-1 font-medium break-all">{user.email}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
