"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

/** C3 — Update Information: changes the user's display name via Better Auth updateUser. */
export function ProfileUpdateForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("নাম কমপক্ষে ২ অক্ষরের হতে হবে।");
      toast.error("ফর্মের তথ্য ঠিক করে আবার চেষ্টা করুন।");
      return;
    }
    setError(null);

    setLoading(true);
    const { error: updateError } = await authClient.updateUser({ name: trimmed });
    setLoading(false);

    if (updateError) {
      setError("তথ্য আপডেট করা যায়নি, আবার চেষ্টা করুন।");
      toast.error("তথ্য আপডেট করা যায়নি, আবার চেষ্টা করুন।");
      return;
    }

    toast.success("আপনার তথ্য আপডেট হয়েছে।");
    router.push("/profile");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {error && (
        <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="update-name" className="text-sm font-medium">
          নাম
        </label>
        <input
          id="update-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(error)}
          className="input w-full rounded-lg border-base-300 bg-base-100 focus:border-primary focus:outline-primary"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => router.push("/profile")} className="btn btn-ghost font-semibold">
          বাতিল
        </button>
        <button type="submit" disabled={loading} className="btn btn-primary font-semibold">
          {loading && <span className="loading loading-spinner loading-sm" />}
          তথ্য আপডেট করুন
        </button>
      </div>
    </form>
  );
}
