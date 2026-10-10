import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "./fallback-data";
import { marketStats } from "./market";
import type { Category, Market, Product } from "./types";

/**
 * API base URLs, tried in order. The optional env var lets you point at a
 * different deployment without touching code.
 */
const API_BASES = [
  process.env.BAZARDOR_API_URL,
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
].filter((v): v is string => Boolean(v));

async function apiGet(path: string): Promise<unknown> {
  let lastError: unknown = new Error("No API base configured");
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${base}${path}`);
      return await res.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

type Raw = Record<string, unknown>;

const isRecord = (v: unknown): v is Raw => typeof v === "object" && v !== null;

/**
 * Finds the list of records in any common response shape:
 * [ ... ], { data: [ ... ] }, { data: { products: [ ... ] } }, { result: { items: [ ... ] } }, ...
 * Searches up to 3 levels deep, so a wrapper object does not break parsing.
 */
function unwrapList(json: unknown, depth = 0): Raw[] {
  if (Array.isArray(json)) {
    const records = json.filter(isRecord);
    if (records.length > 0 || json.length === 0) return records;
  }
  if (isRecord(json) && depth < 3) {
    for (const value of Object.values(json)) {
      const found = unwrapList(value, depth + 1);
      if (found.length > 0) return found;
    }
  }
  return [];
}

/** First non-empty string among several possible field names (or nested {bn, en} objects). */
function pickText(raw: Raw, keys: string[]): string {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
    if (isRecord(value)) {
      const nested = value.bn ?? value.bangla ?? value.en ?? value.name;
      if (typeof nested === "string" && nested.trim()) return nested.trim();
    }
  }
  return "";
}

/** Bengali digits -> ASCII digits, so ১৪৮ and "১,৮৫০" parse as numbers. */
export function toAsciiNumber(input: string): number {
  const ascii = input
    .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");
  const n = Number(ascii);
  return Number.isFinite(n) ? n : 0;
}

function num(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") return toAsciiNumber(v);
  return 0;
}

/** Percent change. A string containing ▼ is treated as a fall. */
function changeNum(v: unknown): number {
  const value = Math.abs(num(v));
  if (typeof v === "string" && v.includes("▼")) return -value;
  if (typeof v === "string" && v.includes("▲")) return value;
  return num(v);
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" || typeof v === "number" ? String(v) : fallback;
}

const PRICE_KEYS = ["price", "current_price", "currentPrice", "today_price", "todayPrice", "today", "price_today", "avg_price", "rate"];
const CHANGE_KEYS = ["change", "change_percent", "changePercent", "percent", "percentage", "change_pct", "price_change", "priceChange"];

/** Finds a value under any of the keys, also inside nested objects (e.g. raw.prices.today). */
function findValue(raw: Raw, keys: string[], depth = 0): unknown {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== "" && !isRecord(value)) return value;
  }
  if (depth < 2) {
    for (const value of Object.values(raw)) {
      if (isRecord(value)) {
        const found = findValue(value, keys, depth + 1);
        if (found !== undefined) return found;
      }
    }
  }
  return undefined;
}

/** "kg" -> "প্রতি কেজি", "liter" -> "প্রতি লিটার" etc. */
function normalizeUnit(unit: string): string {
  const v = unit.trim().toLowerCase();
  if (!v) return "প্রতি কেজি";
  if (unit.startsWith("প্রতি")) return unit;
  if (/kg|kilo|কেজি/.test(v)) return "প্রতি কেজি";
  if (/^l$|liter|litre|লিটার/.test(v)) return "প্রতি লিটার";
  if (/dozen|ডজন/.test(v)) return "প্রতি ডজন";
  if (/^pc|piece|pcs|পিস/.test(v)) return "প্রতি পিস";
  return `প্রতি ${unit.trim()}`;
}

const NAME_KEYS = ["name", "name_bn", "nameBn", "bn_name", "title", "product_name", "productName", "label"];

function normalizeCategory(raw: Raw): Category | null {
  const name = pickText(raw, NAME_KEYS);
  const slug = str(raw.slug ?? raw.id ?? raw.key) || name;
  if (!slug || !name) return null;
  return { slug, name, emoji: str(raw.emoji ?? raw.icon, "🛒") };
}

function normalizeProduct(raw: Raw, index: number): Product | null {
  const name = pickText(raw, NAME_KEYS);
  if (!name) return null;

  // Markets: { market, division, min, max } — no avg, so use the midpoint
  const markets: Market[] = Array.isArray(raw.markets)
    ? raw.markets.filter(isRecord).map((m) => {
        const min = num(m.min ?? m.minimum);
        const max = num(m.max ?? m.maximum);
        const avg = num(m.avg ?? m.price ?? m.average) || Math.round((min + max) / 2);
        return {
          name: str(m.market ?? m.name),
          division: str(m.division ?? m.location),
          min,
          max,
          avg,
        };
      })
    : [];

  // Price: "today" in the API; change: { dir: "up" | "down", pct: number }
  const price = num(findValue(raw, PRICE_KEYS));
  const changeObj = isRecord(raw.change) ? raw.change : null;
  const changePercent = changeObj
    ? signedChange(changeObj)
    : changeNum(findValue(raw, CHANGE_KEYS));

  // Image field holds the emoji (e.g. "🍚"); ignore it if it is a URL
  const image = str(raw.emoji ?? raw.image ?? raw.categoryIcon ?? raw.icon);
  const emoji = image && !/^https?:|\//.test(image) ? image : "🛒";

  const stats = marketStats(markets, price);
  const slug = str(raw.slug ?? raw.id, String(index + 1));
  const categorySlug = str(raw.category_slug ?? raw.category);
  const category = isRecord(raw.category) ? raw.category : null;

  return {
    id: str(raw.id, String(index + 1)),
    slug,
    name,
    emoji,
    unit: normalizeUnit(pickText(raw, ["unit", "unit_name", "unitName"])),
    categorySlug: str(category?.slug, categorySlug),
    categoryName: str(raw.categoryNameBn ?? raw.category_name ?? category?.name),
    summary: str(raw.summary ?? raw.description ?? raw.subtitle) || `${name} — বাজারভিত্তিক আজকের দামের সারসংক্ষেপ`,
    price,
    changePercent,
    ...stats,
    markets,
  };
}

/** { dir: "down", pct: 2.9 } -> -2.9 ; { dir: "up", pct: 2.1 } -> 2.1 */
function signedChange(change: Raw): number {
  const pct = Math.abs(num(change.pct ?? change.percent));
  const dir = str(change.dir).toLowerCase();
  if (dir.includes("down") || dir.includes("fall")) return -pct;
  if (dir.includes("up") || dir.includes("rise")) return pct;
  return num(change.pct);
}

/** Logs as a warning (not an error) so the dev overlay does not treat the fallback as a crash. */
function warnFallback(what: string, reason: unknown) {
  const detail = reason instanceof Error ? reason.message : String(reason);
  console.warn(`[bazardor] ${what} unavailable, showing fallback data. Reason: ${detail}`);
}

export async function getProducts(): Promise<{
  products: Product[];
  source: "api" | "fallback";
}> {
  let json: unknown;
  try {
    json = await apiGet("/products");
  } catch (error) {
    warnFallback("Product API", error);
    return { products: FALLBACK_PRODUCTS, source: "fallback" };
  }

  const list = unwrapList(json)
    .map((raw, i) => normalizeProduct(raw, i))
    .filter((p): p is Product => p !== null);

  if (list.length > 0 && list.every((p) => p.price === 0)) {
    const keys = Object.keys(unwrapList(json)[0] ?? {}).join(", ");
    console.warn(`[bazardor] Every product price is 0. First product keys: ${keys}`);
  }

  if (list.length === 0) {
    const shape = isRecord(json) ? Object.keys(json).join(", ") : Array.isArray(json) ? "array" : typeof json;
    warnFallback("Product API", `response had no readable products (top-level: ${shape})`);
    return { products: FALLBACK_PRODUCTS, source: "fallback" };
  }
  return { products: list, source: "api" };
}

export async function getCategories(): Promise<{
  categories: Category[];
  source: "api" | "fallback";
}> {
  let json: unknown;
  try {
    json = await apiGet("/categories");
  } catch (error) {
    warnFallback("Category API", error);
    return { categories: FALLBACK_CATEGORIES, source: "fallback" };
  }

  const list = unwrapList(json)
    .map(normalizeCategory)
    .filter((c): c is Category => c !== null);

  if (list.length === 0) {
    warnFallback("Category API", "response had no readable categories");
    return { categories: FALLBACK_CATEGORIES, source: "fallback" };
  }
  return { categories: list, source: "api" };
}















// import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "./fallback-data";
// import { marketStats } from "./market";
// import type { Category, Market, Product } from "./types";

// /**
//  * API base URLs, tried in order. The optional env var lets you point at a
//  * different deployment without touching code.
//  */
// const API_BASES = [
//   process.env.BAZARDOR_API_URL,
//   "https://api.api-store.workers.dev/api/bazardor",
//   "https://api.abcz.workers.dev/api/bazardor",
// ].filter((v): v is string => Boolean(v));

// async function apiGet(path: string): Promise<unknown> {
//   let lastError: unknown = new Error("No API base configured");
//   for (const base of API_BASES) {
//     try {
//       const res = await fetch(`${base}${path}`, {
//         headers: { Accept: "application/json" },
//         next: { revalidate: 300 },
//         signal: AbortSignal.timeout(8000),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} from ${base}${path}`);
//       return await res.json();
//     } catch (error) {
//       lastError = error;
//     }
//   }
//   throw lastError;
// }

// type Raw = Record<string, unknown>;

// const isRecord = (v: unknown): v is Raw => typeof v === "object" && v !== null;

// /**
//  * Finds the list of records in any common response shape:
//  * [ ... ], { data: [ ... ] }, { data: { products: [ ... ] } }, { result: { items: [ ... ] } }, ...
//  * Searches up to 3 levels deep, so a wrapper object does not break parsing.
//  */
// function unwrapList(json: unknown, depth = 0): Raw[] {
//   if (Array.isArray(json)) {
//     const records = json.filter(isRecord);
//     if (records.length > 0 || json.length === 0) return records;
//   }
//   if (isRecord(json) && depth < 3) {
//     for (const value of Object.values(json)) {
//       const found = unwrapList(value, depth + 1);
//       if (found.length > 0) return found;
//     }
//   }
//   return [];
// }

// /** First non-empty string among several possible field names (or nested {bn, en} objects). */
// function pickText(raw: Raw, keys: string[]): string {
//   for (const key of keys) {
//     const value = raw[key];
//     if (typeof value === "string" && value.trim()) return value.trim();
//     if (typeof value === "number") return String(value);
//     if (isRecord(value)) {
//       const nested = value.bn ?? value.bangla ?? value.en ?? value.name;
//       if (typeof nested === "string" && nested.trim()) return nested.trim();
//     }
//   }
//   return "";
// }

// /** Bengali digits -> ASCII digits, so ১৪৮ and "১,৮৫০" parse as numbers. */
// export function toAsciiNumber(input: string): number {
//   const ascii = input
//     .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))
//     .replace(/,/g, "")
//     .replace(/[^\d.-]/g, "");
//   const n = Number(ascii);
//   return Number.isFinite(n) ? n : 0;
// }

// function num(v: unknown): number {
//   if (typeof v === "number") return Number.isFinite(v) ? v : 0;
//   if (typeof v === "string") return toAsciiNumber(v);
//   return 0;
// }

// /** Percent change. A string containing ▼ is treated as a fall. */
// function changeNum(v: unknown): number {
//   const value = Math.abs(num(v));
//   if (typeof v === "string" && v.includes("▼")) return -value;
//   if (typeof v === "string" && v.includes("▲")) return value;
//   return num(v);
// }

// function str(v: unknown, fallback = ""): string {
//   return typeof v === "string" || typeof v === "number" ? String(v) : fallback;
// }

// const NAME_KEYS = ["name", "name_bn", "nameBn", "bn_name", "title", "product_name", "productName", "label"];

// function normalizeCategory(raw: Raw): Category | null {
//   const name = pickText(raw, NAME_KEYS);
//   const slug = str(raw.slug ?? raw.id ?? raw.key) || name;
//   if (!slug || !name) return null;
//   return { slug, name, emoji: str(raw.emoji ?? raw.icon, "🛒") };
// }

// function normalizeProduct(raw: Raw, index: number): Product | null {
//   const name = pickText(raw, NAME_KEYS);
//   if (!name) return null;

//   const category = isRecord(raw.category) ? raw.category : null;
//   const markets: Market[] = Array.isArray(raw.markets)
//     ? raw.markets.filter(isRecord).map((m) => {
//         const avg = num(m.avg ?? m.price ?? m.average);
//         return {
//           name: str(m.name ?? m.market),
//           division: str(m.division ?? m.location),
//           min: num(m.min ?? m.minimum ?? avg),
//           max: num(m.max ?? m.maximum ?? avg),
//           avg,
//         };
//       })
//     : [];

//   const price = num(raw.price ?? raw.current_price ?? raw.today_price);
//   const stats = marketStats(markets, price);

//   return {
//     id: str(raw.id, String(index + 1)),
//     slug: str(raw.slug ?? raw.id, String(index + 1)),
//     name,
//     emoji: str(raw.emoji ?? raw.icon, "🛒"),
//     unit: str(raw.unit, "প্রতি কেজি"),
//     categorySlug: str(category?.slug ?? raw.category_slug ?? raw.category),
//     categoryName: str(category?.name ?? raw.category_name),
//     summary: str(raw.summary ?? raw.description ?? raw.subtitle),
//     price,
//     changePercent: changeNum(raw.change ?? raw.change_percent ?? raw.changePercent),
//     ...stats,
//     markets,
//   };
// }

// /** Logs as a warning (not an error) so the dev overlay does not treat the fallback as a crash. */
// function warnFallback(what: string, reason: unknown) {
//   const detail = reason instanceof Error ? reason.message : String(reason);
//   console.warn(`[bazardor] ${what} unavailable, showing fallback data. Reason: ${detail}`);
// }

// export async function getProducts(): Promise<{
//   products: Product[];
//   source: "api" | "fallback";
// }> {
//   let json: unknown;
//   try {
//     json = await apiGet("/products");
//   } catch (error) {
//     warnFallback("Product API", error);
//     return { products: FALLBACK_PRODUCTS, source: "fallback" };
//   }

//   const list = unwrapList(json)
//     .map((raw, i) => normalizeProduct(raw, i))
//     .filter((p): p is Product => p !== null);

//   if (list.length === 0) {
//     const shape = isRecord(json) ? Object.keys(json).join(", ") : Array.isArray(json) ? "array" : typeof json;
//     warnFallback("Product API", `response had no readable products (top-level: ${shape})`);
//     return { products: FALLBACK_PRODUCTS, source: "fallback" };
//   }
//   return { products: list, source: "api" };
// }

// export async function getCategories(): Promise<{
//   categories: Category[];
//   source: "api" | "fallback";
// }> {
//   let json: unknown;
//   try {
//     json = await apiGet("/categories");
//   } catch (error) {
//     warnFallback("Category API", error);
//     return { categories: FALLBACK_CATEGORIES, source: "fallback" };
//   }

//   const list = unwrapList(json)
//     .map(normalizeCategory)
//     .filter((c): c is Category => c !== null);

//   if (list.length === 0) {
//     warnFallback("Category API", "response had no readable categories");
//     return { categories: FALLBACK_CATEGORIES, source: "fallback" };
//   }
//   return { categories: list, source: "api" };
// }







// import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "./fallback-data";
// import { marketStats } from "./market";
// import type { Category, Market, Product } from "./types";

// /**
//  * API base URLs, tried in order. The optional env var lets you point at a
//  * different deployment without touching code.
//  */
// const API_BASES = [
//   process.env.BAZARDOR_API_URL,
//   //"https://api.api-store.workers.dev/api/bazardor",
//   "https://api.abcz.workers.dev/api/bazardor",
// ].filter((v): v is string => Boolean(v));

// async function apiGet(path: string): Promise<unknown> {
//   let lastError: unknown = new Error("No API base configured");
//   for (const base of API_BASES) {
//     try {
//       const res = await fetch(`${base}${path}`, {
//         headers: { Accept: "application/json" },
//         next: { revalidate: 300 },
//         signal: AbortSignal.timeout(8000),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} from ${base}${path}`);
//       return await res.json();
//     } catch (error) {
//       lastError = error;
//     }
//   }
//   throw lastError;
// }

// type Raw = Record<string, unknown>;

// const isRecord = (v: unknown): v is Raw => typeof v === "object" && v !== null;

// /** Accepts a bare array or an object wrapping the array under a common key. */
// function unwrapList(json: unknown): Raw[] {
//   if (Array.isArray(json)) return json.filter(isRecord);
//   if (isRecord(json)) {
//     for (const key of ["data", "products", "categories", "items", "result"]) {
//       const value = json[key];
//       if (Array.isArray(value)) return value.filter(isRecord);
//     }
//   }
//   return [];
// }

// /** Bengali digits -> ASCII digits, so ১৪৮ and "১,৮৫০" parse as numbers. */
// export function toAsciiNumber(input: string): number {
//   const ascii = input
//     .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))
//     .replace(/,/g, "")
//     .replace(/[^\d.-]/g, "");
//   const n = Number(ascii);
//   return Number.isFinite(n) ? n : 0;
// }

// function num(v: unknown): number {
//   if (typeof v === "number") return Number.isFinite(v) ? v : 0;
//   if (typeof v === "string") return toAsciiNumber(v);
//   return 0;
// }

// /** Percent change. A string containing ▼ is treated as a fall. */
// function changeNum(v: unknown): number {
//   const value = Math.abs(num(v));
//   if (typeof v === "string" && v.includes("▼")) return -value;
//   if (typeof v === "string" && v.includes("▲")) return value;
//   return num(v);
// }

// function str(v: unknown, fallback = ""): string {
//   return typeof v === "string" || typeof v === "number" ? String(v) : fallback;
// }

// function normalizeCategory(raw: Raw): Category | null {
//   const slug = str(raw.slug ?? raw.id ?? raw.name);
//   const name = str(raw.name ?? raw.name_bn ?? raw.title);
//   if (!slug || !name) return null;
//   return { slug, name, emoji: str(raw.emoji ?? raw.icon, "🛒") };
// }

// function normalizeProduct(raw: Raw, index: number): Product | null {
//   const name = str(raw.name ?? raw.name_bn ?? raw.title);
//   if (!name) return null;

//   const category = isRecord(raw.category) ? raw.category : null;
//   const markets: Market[] = Array.isArray(raw.markets)
//     ? raw.markets.filter(isRecord).map((m) => {
//         const avg = num(m.avg ?? m.price ?? m.average);
//         return {
//           name: str(m.name ?? m.market),
//           division: str(m.division ?? m.location),
//           min: num(m.min ?? m.minimum ?? avg),
//           max: num(m.max ?? m.maximum ?? avg),
//           avg,
//         };
//       })
//     : [];

//   const price = num(raw.price ?? raw.current_price ?? raw.today_price);
//   const stats = marketStats(markets, price);

//   return {
//     id: str(raw.id, String(index + 1)),
//     slug: str(raw.slug ?? raw.id, String(index + 1)),
//     name,
//     emoji: str(raw.emoji ?? raw.icon, "🛒"),
//     unit: str(raw.unit, "প্রতি কেজি"),
//     categorySlug: str(category?.slug ?? raw.category_slug ?? raw.category),
//     categoryName: str(category?.name ?? raw.category_name),
//     summary: str(raw.summary ?? raw.description ?? raw.subtitle),
//     price,
//     changePercent: changeNum(raw.change ?? raw.change_percent ?? raw.changePercent),
//     ...stats,
//     markets,
//   };
// }

// export async function getProducts(): Promise<{
//   products: Product[];
//   source: "api" | "fallback";
// }> {
//   try {
//     const list = unwrapList(await apiGet("/products"))
//       .map((raw, i) => normalizeProduct(raw, i))
//       .filter((p): p is Product => p !== null);
//     if (list.length === 0) throw new Error("API returned no products");
//     return { products: list, source: "api" };
//   } catch (error) {
//     console.error("[bazardor] Product API unavailable, using fallback data.", error);
//     return { products: FALLBACK_PRODUCTS, source: "fallback" };
//   }
// }

// export async function getCategories(): Promise<{
//   categories: Category[];
//   source: "api" | "fallback";
// }> {
//   try {
//     const list = unwrapList(await apiGet("/categories"))
//       .map(normalizeCategory)
//       .filter((c): c is Category => c !== null);
//     if (list.length === 0) throw new Error("API returned no categories");
//     return { categories: list, source: "api" };
//   } catch (error) {
//     console.error("[bazardor] Category API unavailable, using fallback data.", error);
//     return { categories: FALLBACK_CATEGORIES, source: "fallback" };
//   }
// }
