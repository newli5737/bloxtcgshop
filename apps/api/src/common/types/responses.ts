import { ProductStatus } from "@pokemart/database";

// ─── Pagination ───
export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Product ───
export interface ProductListItem {
  id: string;
  slug: string;
  sku: string;
  name: string;
  price: number;
  salePrice: number | null;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  imageUrl: string | null;
  categoryName: string | null;
  setName: string | null;
  rarity: string | null;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  releaseDate: Date | null;
  images: Array<{ id: string; url: string; altText: string | null; isPrimary: boolean; sortOrder: number }>;
  cardDetails: Record<string, string | number | null> | null;
  pokemon: Array<{ id: string; slug: string; nameEn: string }>;
  category: CategoryResponse | null;
  cardSet: Record<string, string> | null;
  viewCount: number;
}

// ─── Category ───
export interface TranslationItem {
  id: string;
  locale: string;
  name: string;
}

export interface CategoryResponse {
  id: string;
  slug: string;
  iconUrl: string | null;
  sortOrder: number;
  parentId: string | null;
  translations: TranslationItem[];
  children?: CategoryResponse[];
}

export interface CreateCategoryDto {
  slug: string;
  sortOrder?: number;
  iconUrl?: string;
  parentId?: string;
  translations: Array<{ locale: string; name: string }>;
}

export interface UpdateCategoryDto {
  slug?: string;
  sortOrder?: number;
  iconUrl?: string;
  translations?: Array<{ locale: string; name: string }>;
}

// ─── Banner ───
export interface BannerTranslationItem {
  id: string;
  locale: string;
  title: string | null;
  altText: string | null;
}

export interface BannerResponse {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  translations: BannerTranslationItem[];
}

export interface CreateBannerDto {
  imageUrl: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
  translations: Array<{ locale: string; title?: string; altText?: string }>;
}

export interface UpdateBannerDto {
  imageUrl?: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  translations?: Array<{ locale: string; title?: string; altText?: string }>;
}

// ─── News ───
export interface NewsTranslationItem {
  id: string;
  locale: string;
  title: string;
  content: string;
}

export interface NewsResponse {
  id: string;
  slug: string;
  publishedAt: Date;
  isPublished: boolean;
  translations: NewsTranslationItem[];
}

export interface CreateNewsDto {
  slug: string;
  isPublished?: boolean;
  translations: Array<{ locale: string; title: string; content: string }>;
}

export interface UpdateNewsDto {
  slug?: string;
  isPublished?: boolean;
  translations?: Array<{ locale: string; title: string; content: string }>;
}

// ─── Admin ───
export interface AdminStats {
  totalProducts: number;
  totalCategories: number;
  outOfStock: number;
  newThisWeek: number;
}

export interface UploadResult {
  url: string;
}

export interface DeleteResult {
  id: string;
}

// ─── User ───
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
  locale: string;
  createdAt?: Date;
}

export interface WishlistProduct {
  id: string;
  slug: string;
  price: { toString(): string };
  salePrice: { toString(): string } | null;
  translations: Array<{ name: string }>;
  images: Array<{ url: string }>;
}

export interface WishlistEntry {
  userId: string;
  productId: string;
  createdAt: Date;
}

// ─── Event ───
export interface EventResponse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  prizeDescription: string | null;
  imageUrl: string | null;
  status: string;
  maxParticipants: number;
  winningNumber: number | null;
  drawDate: Date | null;
  drawnAt: Date | null;
  createdAt: Date;
  _count?: { registrations: number };
}

export interface EventRegistrationResponse {
  id: string;
  eventId: string;
  userId: string;
  luckyNumber: number;
  isWinner: boolean;
  createdAt: Date;
  user?: { id: string; email: string; name: string | null };
}

export interface EventDrawResult {
  winningNumber: number;
  winner: { id: string; email: string; name: string | null } | null;
}

// ─── Search ───
export interface SearchSuggestion {
  type: "product";
  slug: string;
  name: string;
}

// ─── Pokemon ───
export interface PokemonResponse {
  id: string;
  slug: string;
  nameEn: string;
  nameJa: string;
  spriteUrl: string;
}

// ─── CardSet ───
export interface CardSetResponse {
  id: string;
  slug: string;
  logoUrl: string | null;
  releaseDate: Date | null;
  translations: Array<{ id: string; locale: string; name: string }>;
}
