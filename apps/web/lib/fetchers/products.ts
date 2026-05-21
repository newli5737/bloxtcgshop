import { apiFetch } from "../api";
import type { CatalogProduct } from "../../components/product/ProductCard";

type ProductDetail = {
  slug: string;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  status: string;
  images: Array<{ url: string; altText: string | null }>;
  cardDetails: {
    hp: number | null;
    cardNumber: string | null;
    rarity: string | null;
    cardType: string | null;
    illustrator: string | null;
    setNumber: string | null;
  } | null;
  pokemon: Array<{ slug: string; nameEn: string }>;
};

export async function fetchProductList(
  params: Record<string, string | number | boolean | undefined | null>,
): Promise<{ data: CatalogProduct[]; meta: Record<string, unknown> | null }> {
  const res = await apiFetch<CatalogProduct[]>("products", { params });
  return { data: res.data, meta: res.meta ?? null };
}

export async function fetchProductDetail(slug: string, locale: string): Promise<ProductDetail> {
  const res = await apiFetch<ProductDetail>(`products/${slug}`, { params: { locale } });
  return res.data;
}

export type { ProductDetail };
