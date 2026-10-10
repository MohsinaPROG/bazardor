export type Market = {
  name: string;
  division: string;
  min: number;
  max: number;
  avg: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  unit: string;
  categorySlug: string;
  categoryName: string;
  summary: string;
  price: number;
  changePercent: number;
  min: number;
  max: number;
  avg: number;
  markets: Market[];
};

export type Category = {
  slug: string;
  name: string;
  emoji: string;
};

export type SortMode = "default" | "asc" | "desc";
