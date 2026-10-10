import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <p className="text-7xl font-bold text-primary">৪০৪</p>
      <h1 className="text-2xl font-bold">পৃষ্ঠাটি পাওয়া যায়নি</h1>
      <p className="text-base-content/70">
        আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি হয়তো সরিয়ে ফেলা হয়েছে বা ঠিকানাটি ভুল।
      </p>
      <Link href="/" className="btn btn-primary btn-sm font-semibold sm:btn-md">
        হোম পেজে ফিরে যান
      </Link>
    </section>
  );
}
