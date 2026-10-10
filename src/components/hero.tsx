import Image from "next/image";
import { banglaDate, toBn } from "@/lib/format";

export function Hero({ productCount }: { productCount: number }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="grid items-center gap-8 rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-10 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-primary">{banglaDate()}</p>
          <h1 className="text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
            আজকের বাজারের দাম এক নজরে
          </h1>
          <p className="max-w-xl text-base text-base-content/70">
            চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারভিত্তিক বিস্তারিত, গড়,
            সর্বনিম্ন-সর্বাধিক এবং দামের পরিবর্তন এক জায়গায়।
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Anchor link (same page), not a route change */}
            <a href="#সব-পণ্য" className="btn btn-primary btn-sm sm:btn-md font-semibold">
              সব পণ্য দেখুন ↓
            </a>
            {/* <div className="rounded-xl border border-base-300 bg-base-200 px-4 py-2">
              <p className="text-xs text-base-content/60">পণ্য</p>
              <p className="text-2xl font-bold text-primary">{toBn(productCount)}</p>
              <p className="text-xs text-base-content/60">টি নিত্যদিনের পণ্য</p>
            </div> */}
          </div>
        </div>

        <div className="flex justify-center">
          <Image
            src="/images/hero-basket.png"
            alt="সবজি ও ফলের ঝুড়ি"
            width={315}
            height={263}
            priority
            className="h-auto w-full max-w-xs"
          />
        </div>
      </div>
    </section>
  );
}
