import type { Market } from "./types";

/** Min / max / average summary across all markets for one product. */
export function marketStats(markets: Market[], fallbackPrice: number) {
  if (markets.length === 0) {
    return { min: fallbackPrice, max: fallbackPrice, avg: fallbackPrice };
  }
  const min = Math.min(...markets.map((m) => m.min));
  const max = Math.max(...markets.map((m) => m.max));
  const avg = Math.round(markets.reduce((sum, m) => sum + m.avg, 0) / markets.length);
  return { min, max, avg };
}
