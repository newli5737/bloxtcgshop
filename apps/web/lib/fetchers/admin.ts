/**
 * Admin data layer — all types and fetchers for admin CRUD operations.
 * Pages and hooks import from here. No raw fetch() calls outside this file.
 */
import { apiGet, apiMutate, apiUpload } from "../api";

// ────────────────────── Shared ──────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface DeleteResult { id: string }
export interface UploadResult { url: string }

// ────────────────────── Products ──────────────────────
export interface AdminProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  price: number;
  salePrice: number | null;
  stock: number;
  status: string;
  imageUrl: string | null;
  categoryName: string | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  description?: string | null;
  rarity?: string | null;
  setName?: string | null;
}

export interface CreateProductPayload {
  slug: string;
  sku: string;
  price: number;
  stock: number;
  salePrice?: number | null;
  categoryId?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  imageUrl?: string;
  translations: Array<{ locale: string; name: string; description?: string }>;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export const adminProducts = {
  list: (locale = "ja") => apiGet<AdminProduct[]>("products", { limit: 200, locale }),
  create: (data: CreateProductPayload) => apiMutate<AdminProduct>("products", "POST", data),
  update: (id: string, data: UpdateProductPayload) => apiMutate<AdminProduct>(`products/${id}`, "PATCH", data),
  remove: (id: string) => apiMutate<DeleteResult>(`products/${id}`, "DELETE"),
};

// ────────────────────── Categories ──────────────────────
export interface AdminCategory {
  id: string;
  slug: string;
  iconUrl: string | null;
  sortOrder: number;
  parentId: string | null;
  translations: Array<{ id: string; locale: string; name: string }>;
  children?: AdminCategory[];
}

export interface CreateCategoryPayload {
  slug: string;
  sortOrder?: number;
  iconUrl?: string;
  parentId?: string;
  translations: Array<{ locale: string; name: string }>;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export const adminCategories = {
  list: (locale = "ja") => apiGet<AdminCategory[]>("categories", { locale }),
  create: (data: CreateCategoryPayload) => apiMutate<AdminCategory>("categories", "POST", data),
  update: (id: string, data: UpdateCategoryPayload) => apiMutate<AdminCategory>(`categories/${id}`, "PATCH", data),
  remove: (id: string) => apiMutate<DeleteResult>(`categories/${id}`, "DELETE"),
};

// ────────────────────── Banners ──────────────────────
export interface AdminBanner {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  translations: Array<{ id: string; locale: string; title: string | null; altText: string | null }>;
}

export interface CreateBannerPayload {
  imageUrl: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  translations: Array<{ locale: string; title?: string; altText?: string }>;
}

export type UpdateBannerPayload = Partial<CreateBannerPayload>;

export const adminBanners = {
  list: (locale = "ja") => apiGet<AdminBanner[]>("banners/all", { locale }),
  create: (data: CreateBannerPayload) => apiMutate<AdminBanner>("banners", "POST", data),
  update: (id: string, data: UpdateBannerPayload) => apiMutate<AdminBanner>(`banners/${id}`, "PATCH", data),
  remove: (id: string) => apiMutate<DeleteResult>(`banners/${id}`, "DELETE"),
};

// ────────────────────── News ──────────────────────
export interface AdminNews {
  id: string;
  slug: string;
  publishedAt: string;
  isPublished: boolean;
  translations: Array<{ id: string; locale: string; title: string; content: string }>;
}

export interface CreateNewsPayload {
  slug: string;
  isPublished?: boolean;
  translations: Array<{ locale: string; title: string; content: string }>;
}

export type UpdateNewsPayload = Partial<CreateNewsPayload>;

export const adminNews = {
  list: async (locale = "vi"): Promise<AdminNews[]> => {
    const res = await apiGet<PaginatedResponse<AdminNews>>("news/admin/all", { locale, limit: 200 });
    return res.data;
  },
  create: (data: CreateNewsPayload) => apiMutate<AdminNews>("news", "POST", data),
  update: (id: string, data: UpdateNewsPayload) => apiMutate<AdminNews>(`news/${id}`, "PATCH", data),
  remove: (id: string) => apiMutate<DeleteResult>(`news/${id}`, "DELETE"),
};

// ────────────────────── Stats ──────────────────────
export interface AdminStats {
  totalProducts: number;
  totalCategories: number;
  outOfStock: number;
  newThisWeek: number;
}

export const adminStats = {
  get: () => apiGet<AdminStats>("admin/stats"),
};

// ────────────────────── Upload ──────────────────────
export const adminUpload = {
  file: (file: File) => apiUpload<UploadResult>("admin/upload", file),
};
