"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">কিছু একটা সমস্যা হয়েছে</h1>
      <p className="text-base-content/70">পৃষ্ঠাটি লোড করা যায়নি। আবার চেষ্টা করুন।</p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="btn btn-primary btn-sm sm:btn-md font-semibold">
          আবার চেষ্টা করুন
        </button>
        <Link href="/" className="btn btn-ghost btn-sm sm:btn-md font-semibold">
          হোম পেজে ফিরে যান
        </Link>
      </div>
    </section>
  );
}
