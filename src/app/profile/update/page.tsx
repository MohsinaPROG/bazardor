import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { ProfileUpdateForm } from "@/components/profile-update-form";

export const metadata: Metadata = { title: "তথ্য আপডেট" };

export default async function ProfileUpdatePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?notice=login_required&callbackUrl=%2Fprofile%2Fupdate");

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8 sm:px-6">
      <nav className="text-sm text-base-content/60">
        <Link href="/profile" className="hover:text-primary">
          ← আমার প্রোফাইল
        </Link>
      </nav>

      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">তথ্য আপডেট করুন</h1>
        <p className="text-sm text-base-content/70">আপনার নাম পরিবর্তন করে সেভ করুন।</p>
      </header>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6">
        <ProfileUpdateForm initialName={user.name} />
      </div>
    </div>
  );
}
