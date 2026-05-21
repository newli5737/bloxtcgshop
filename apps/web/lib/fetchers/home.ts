import { apiFetch } from "../api";
import type { CatalogProduct } from "../../components/product/ProductCard";

type Banner = {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  translations: Array<{ title: string | null }>;
};

type NewsItem = {
  slug: string;
  publishedAt: string;
  translations: Array<{ title: string }>;
};

type Category = {
  slug: string;
  translations: Array<{ name: string }>;
  iconUrl: string | null;
};

type Pokemon = {
  slug: string;
  nameEn: string;
  spriteUrl: string | null;
};

export type HomePageData = {
  banners: Banner[];
  rankings: CatalogProduct[];
  newArrivals: CatalogProduct[];
  categories: Category[];
  pokemon: Pokemon[];
  news: NewsItem[];
};

export async function fetchHomePageData(locale: string): Promise<HomePageData> {
  const [banners, rankings, newArrivals, categories, pokemon, news] = await Promise.all([
    apiFetch<Banner[]>("banners", { params: { locale } }).then((r) => r.data),
    apiFetch<CatalogProduct[]>("rankings", { params: { type: "sales", limit: 10, locale } }).then((r) => r.data),
    apiFetch<CatalogProduct[]>("products", { params: { isNewArrival: true, limit: 10, locale } }).then((r) => r.data),
    apiFetch<Category[]>("categories", { params: { locale } }).then((r) => r.data),
    apiFetch<Pokemon[]>("pokemon").then((r) => r.data),
    apiFetch<NewsItem[]>("news", { params: { locale, limit: 5 } }).then((r) => r.data),
  ]);

  return { banners, rankings, newArrivals, categories, pokemon, news };
}

export type { Banner, NewsItem, Category, Pokemon };
