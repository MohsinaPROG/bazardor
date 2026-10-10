import { marketStats } from "./market";
import type { Category, Market, Product } from "./types";

/**
 * Offline fallback used when the product API cannot be reached.
 * Category slugs and names follow the Figma file; prices are sample values.
 */
export const FALLBACK_CATEGORIES: Category[] = [
  { slug: "chal", name: "চাল", emoji: "🍚" },
  { slug: "dal", name: "ডাল", emoji: "🫘" },
  { slug: "tel", name: "তেল", emoji: "🫙" },
  { slug: "sabji", name: "সবজি", emoji: "🥔" },
  { slug: "mach", name: "মাছ", emoji: "🐟" },
  { slug: "mangsho", name: "মাংস", emoji: "🍗" },
  { slug: "dim", name: "ডিম", emoji: "🥚" },
  { slug: "moshla", name: "মসলা", emoji: "🌶️" },
];

type Seed = {
  slug: string;
  name: string;
  emoji: string;
  unit: string;
  category: string;
  price: number;
  change: number;
};

const SEEDS: Seed[] = [
  { slug: "swarnamachi-chal", name: "স্বর্ণমাছি চাল", emoji: "🍚", unit: "প্রতি কেজি", category: "chal", price: 148, change: 2.1 },
  { slug: "miniket-chal", name: "মিনিকেট চাল", emoji: "🍚", unit: "প্রতি কেজি", category: "chal", price: 92, change: -1.4 },
  { slug: "batam-chal", name: "বাটাম সাইজ চাল", emoji: "🍚", unit: "প্রতি কেজি", category: "chal", price: 66, change: 3.1 },
  { slug: "nazirshail-chal", name: "নাজিরশাইল চাল", emoji: "🍚", unit: "প্রতি কেজি", category: "chal", price: 118, change: 0 },
  { slug: "masur-dal", name: "মসুর ডাল", emoji: "🫘", unit: "প্রতি কেজি", category: "dal", price: 135, change: -2.9 },
  { slug: "mug-dal", name: "মুগ ডাল", emoji: "🫘", unit: "প্রতি কেজি", category: "dal", price: 150, change: 1.2 },
  { slug: "soyabean-tel", name: "সয়াবিন তেল", emoji: "🫙", unit: "প্রতি লিটার", category: "tel", price: 178, change: -0.5 },
  { slug: "sorisha-tel", name: "সরিষার তেল", emoji: "🫙", unit: "প্রতি লিটার", category: "tel", price: 320, change: 1.6 },
  { slug: "alu", name: "আলু", emoji: "🥔", unit: "প্রতি কেজি", category: "sabji", price: 42, change: -2.6 },
  { slug: "peyaj", name: "পেঁয়াজ", emoji: "🧅", unit: "প্রতি কেজি", category: "sabji", price: 68, change: 5.6 },
  { slug: "dhenros", name: "ঢেঁড়স", emoji: "🥒", unit: "প্রতি কেজি", category: "sabji", price: 60, change: 1.4 },
  { slug: "ilish", name: "ইলিশ মাছ", emoji: "🐟", unit: "প্রতি কেজি", category: "mach", price: 1850, change: -2.9 },
  { slug: "broiler-murgi", name: "ব্রয়লার মুরগি", emoji: "🍗", unit: "প্রতি কেজি", category: "mangsho", price: 205, change: 0.8 },
  { slug: "farmer-dim", name: "ফার্মের ডিম", emoji: "🥚", unit: "প্রতি ডজন", category: "dim", price: 150, change: -1.7 },
  { slug: "lal-morich", name: "লাল মরিচের গুঁড়া", emoji: "🌶️", unit: "প্রতি কেজি", category: "moshla", price: 420, change: 0.3 },
];

const MARKET_SEED = [
  { name: "মাঠ বাজার", division: "ময়মনসিংহ", factor: 0.97 },
  { name: "কারওয়ান বাজার", division: "ঢাকা", factor: 1.03 },
  { name: "খুলনা কাঁচাবাজার", division: "খুলনা", factor: 1 },
  { name: "চট্টগ্রাম বাজার", division: "চট্টগ্রাম", factor: 1.06 },
];

function buildMarkets(price: number): Market[] {
  return MARKET_SEED.map((m) => {
    const avg = Math.round(price * m.factor);
    return {
      name: m.name,
      division: m.division,
      min: Math.round(avg * 0.94),
      max: Math.round(avg * 1.08),
      avg,
    };
  });
}

export const FALLBACK_PRODUCTS: Product[] = SEEDS.map((s, index) => {
  const markets = buildMarkets(s.price);
  const stats = marketStats(markets, s.price);
  const category = FALLBACK_CATEGORIES.find((c) => c.slug === s.category);
  return {
    id: String(index + 1),
    slug: s.slug,
    name: s.name,
    emoji: s.emoji,
    unit: s.unit,
    categorySlug: s.category,
    categoryName: category?.name ?? "",
    summary: `${s.name} — বাজারভিত্তিক আজকের দামের সারসংক্ষেপ`,
    price: s.price,
    changePercent: s.change,
    ...stats,
    markets,
  };
});
