import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
// @ts-expect-error Next.js handles this global stylesheet import.
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Ticker } from "@/components/ticker";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { getProducts } from "@/lib/products";

const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "বাজার দর — আজকের বাজারের দাম", template: "%s | বাজার দর" },
  description: "চাল, ডাল, তেল, সবজি, মাছ, মাংস ও ডিমের আজকের দাম — বাজারভিত্তিক বিস্তারিত ও দামের পরিবর্তন।",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { products } = await getProducts();

  return (
    <html lang="bn" data-theme="bazardor" className={hind.variable}>
      <body className="flex min-h-screen flex-col bg-base-200 font-sans text-base-content antialiased">
        <Providers>
          <Navbar />
          <Ticker products={products} />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
