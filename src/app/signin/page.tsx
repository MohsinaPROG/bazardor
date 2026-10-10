import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { SignInForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/session";
import { safeCallbackUrl } from "@/lib/auth-messages";

export const metadata: Metadata = { title: "সাইন ইন" };

type Props = { searchParams: Promise<{ notice?: string; callbackUrl?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  if (await getCurrentUser()) redirect("/");

  const { notice, callbackUrl } = await searchParams;

  return (
    <AuthShell
      title="সাইন ইন"
      subtitle="বিস্তারিত দাম, বাজার তুলনা ও প্রোফাইল দেখতে অ্যাকাউন্টে ঢুকুন।"
      footer={
        <>
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            সাইন আপ করুন
          </Link>
        </>
      }
    >
      <SignInForm callbackUrl={safeCallbackUrl(callbackUrl)} notice={notice} />
    </AuthShell>
  );
}
