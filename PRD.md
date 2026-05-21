# 🎴 PokéMart — Pokemon Card Marketplace
## Product Requirements Document (PRD) & Technical Architecture

> **Version:** 1.0 | **Date:** May 2026 | **Status:** Draft for AI Agent Implementation

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Stories](#2-user-stories)
3. [Information Architecture & Site Map](#3-information-architecture--site-map)
4. [Functional Requirements](#4-functional-requirements)
5. [Technical Architecture](#5-technical-architecture)
6. [Project Structure](#6-project-structure)
7. [Database Schema (Prisma v6)](#7-database-schema-prisma-v6)
8. [API Design (NestJS)](#8-api-design-nestjs)
9. [Internationalization (i18n)](#9-internationalization-i18n)
10. [UI / UX Guidelines](#10-ui--ux-guidelines)
11. [Component Inventory](#11-component-inventory)
12. [Implementation Phases](#12-implementation-phases)
13. [Environment Variables](#13-environment-variables)
14. [Coding Conventions](#14-coding-conventions)

---

## 1. Product Overview

### 1.1 Summary

**PokéMart** là một website thương mại điện tử đa ngôn ngữ chuyên bán sản phẩm Pokémon Trading Card Game (TCG). Lấy cảm hứng từ [Pokémon Center Online](https://www.pokemoncenter-online.com/), nền tảng cho phép người dùng duyệt, tìm kiếm và mua các sản phẩm thẻ bài Pokémon bao gồm booster pack, battle deck, thẻ lẻ và phụ kiện.

**PokéMart** is a multilingual e-commerce website specialized in selling Pokémon Trading Card Game (TCG) products. Inspired by Pokémon Center Online, this platform enables users to browse, search, and purchase Pokémon cards including booster packs, battle decks, single cards, and accessories.

### 1.2 Goals

- Deliver a premium, visually engaging storefront for Pokémon TCG products
- Support multilingual browsing: **English (EN)**, **Vietnamese (VI)**, **Japanese (JA)**
- Implement a robust product catalog: sets, single cards, bundles, accessories
- Powerful search & filtering by set, type, rarity, Pokémon character
- Admin panel for product, inventory, and content management
- Lay the foundation for future cart/checkout (excluded from v1)

### 1.3 Scope

#### ✅ In Scope — v1.0

| Feature | Description |
|---|---|
| Homepage | Hero banners, featured products, new arrivals, rankings, news |
| Product Catalog | Listing, filters, sorting, pagination |
| Product Detail | Images, description, specs, stock status, wishlist |
| Category Browsing | Hierarchical categories with icons |
| Card Set Browsing | Browse by expansion set |
| Pokémon Browsing | Browse by Pokémon character |
| Search | Full-text search with instant suggestions |
| Rankings | Top-selling / most popular products |
| News & Announcements | List + detail pages |
| Authentication | Register, Login, OAuth (Google), password reset |
| Wishlist / Favorites | Save products (auth required) |
| Admin Panel | Product/category/banner/news CRUD |
| Multilingual | EN / VI / JA via next-intl |
| Responsive Design | Mobile-first, works on all screen sizes |

#### ❌ Out of Scope — v1.0

- Shopping cart & checkout
- Payment processing
- Order management & shipping
- Product reviews & ratings
- Real-time stock notifications

---

## 2. User Stories

### 2.1 Guest User

- As a guest, I can browse all products without logging in
- As a guest, I can search and filter products by category, set, rarity, type, and Pokémon
- As a guest, I can view product detail pages with images, descriptions, prices, and stock status
- As a guest, I can switch the interface language between EN, VI, and JA
- As a guest, I can view rankings (top-selling / most popular)
- As a guest, I can read news and announcements
- As a guest, I can register for a new account

### 2.2 Authenticated User

- As a user, I can log in with email/password or Google OAuth
- As a user, I can add/remove products to my wishlist
- As a user, I can view and update my profile (name, avatar, preferred language)
- As a user, I can see my wishlist and browsing history

### 2.3 Admin User

- As an admin, I can create, edit, and delete products with multilingual fields
- As an admin, I can manage categories (tree structure), card sets, and Pokémon tags
- As an admin, I can manage stock/inventory levels per product
- As an admin, I can create and manage hero banners (upload, schedule, reorder)
- As an admin, I can publish/unpublish news and announcements
- As an admin, I can view product rankings and basic analytics

---

## 3. Information Architecture & Site Map

### 3.1 Route Map

```
/[locale]/                          → Homepage
/[locale]/products                  → All Products (listing + filters)
/[locale]/products/[slug]           → Product Detail
/[locale]/categories                → All Categories overview
/[locale]/categories/[slug]         → Category Product Listing
/[locale]/sets                      → All Card Sets
/[locale]/sets/[slug]               → Set Product Listing
/[locale]/pokemon                   → Browse by Pokémon
/[locale]/pokemon/[name]            → Products featuring a Pokémon
/[locale]/rankings                  → Rankings Page
/[locale]/news                      → News List
/[locale]/news/[slug]               → News Detail
/[locale]/search?q=                 → Search Results
/[locale]/auth/login                → Login
/[locale]/auth/register             → Register
/[locale]/auth/forgot-password      → Password Reset
/[locale]/profile                   → User Profile (auth required)
/[locale]/wishlist                  → Wishlist (auth required)
/[locale]/admin                     → Admin Dashboard (admin role)
/[locale]/admin/products            → Admin Products List
/[locale]/admin/products/new        → Create Product
/[locale]/admin/products/[id]       → Edit Product
/[locale]/admin/categories          → Manage Categories
/[locale]/admin/sets                → Manage Card Sets
/[locale]/admin/banners             → Manage Banners
/[locale]/admin/news                → Manage News
```

### 3.2 Navigation Structure

**Primary Navigation:**
- Browse by Pokémon (icon grid)
- Browse by Category (dropdown mega menu)
- New Arrivals
- Featured / Special Collections
- Rankings

**Header Utilities:**
- Language Switcher (EN | VI | JA) — flag + code
- Search bar (expands on focus)
- Wishlist icon (count badge)
- Login / User avatar dropdown

**Footer:**
- Site map links (categories, sets, quick links)
- Social media icons (X, Instagram, YouTube, Facebook)
- Language switcher
- Legal links (Terms, Privacy Policy)

---

## 4. Functional Requirements

### 4.1 Homepage

- **Hero Carousel** — full-width banners, autoplay 5s, swipe on mobile, dot indicators, manual prev/next
- **Pokémon Quick-Nav** — horizontal scrollable row of Pokémon sprite icons (top 15+), click to filter
- **Category Grid** — icon + label tiles for top-level categories
- **New Arrivals** — latest 10 products in a horizontal scroll or grid
- **Featured Collections** — curated promotional banners with links
- **Rankings Widget** — top 10 bestsellers as numbered list with thumbnail
- **News Section** — latest 5 news items with date + title

### 4.2 Product Listing (`/products`, `/categories/[slug]`, etc.)

- **Grid / List view toggle** — persisted in localStorage
- **Pagination** — 24 items per page, URL-based page param
- **Sort options:** Newest | Price ↑ | Price ↓ | Popularity | Name A–Z
- **Filter Sidebar:**
  - Category (checkbox tree)
  - Card Set (checkbox list)
  - Rarity (COMMON → RARE_SECRET)
  - Card Type (Fire, Water, Grass, Psychic, etc.)
  - Pokémon character
  - Price range (min/max slider)
  - In Stock only (toggle)
- **Active filter chips** shown above results with individual remove
- **ProductCard:** image (hover zoom) | name | set name | price | stock badge | heart icon

### 4.3 Product Detail Page

- **Image Gallery** — multiple images, click to enlarge lightbox, thumbnail strip
- **Product Info:**
  - Name, set name, release date, rarity badge
  - Price (with sale price strikethrough if applicable)
  - Stock status badge: `In Stock` | `Low Stock (< 5)` | `Out of Stock` | `Pre-order`
- **Card Details section** (for single cards): HP, Card Number, Card Type, Illustrator, Set Number
- **Description** — multilingual rich text
- **"Add to Wishlist"** button (prompts login if guest)
- **"Add to Cart"** button — rendered but disabled with tooltip "Coming Soon"
- **Related Products** — same set or same Pokémon (max 8, carousel on mobile)
- **Breadcrumb** navigation

### 4.4 Search

- **Global search bar** in header — instant suggestions via debounced API call (300ms)
- **Search Results page** `/search?q=` with full filter panel (same as product listing)
- **Searchable fields:** product name, set name, Pokémon name, SKU
- **Highlighted match** in suggestion dropdown
- **Empty state** with suggestions (trending, new arrivals)

### 4.5 Authentication

- **Register:** email + password + display name → email verification link
- **Login:** email/password + Google OAuth button
- **Password reset** via email (6-hour expiry link)
- **Token strategy:** JWT access token (15 min) + refresh token (7 days) in httpOnly cookies
- **Roles:** `GUEST` | `USER` | `ADMIN`
- **Protected routes** redirect to `/auth/login` with `callbackUrl`

### 4.6 Wishlist

- Heart icon on every ProductCard and Product Detail page (filled/empty toggle)
- `/wishlist` page: product grid with remove button
- **Authenticated users:** persisted to `Wishlist` DB table
- **Guests:** stored in `localStorage`, merged on login

### 4.7 Admin Panel

- **Dashboard** — total products, total categories, out-of-stock count, new this week
- **Products CRUD** — form with: multilingual name/description, images (drag-drop upload), price, sale price, stock, category, card set, Pokémon tags, card details
- **Category CRUD** — tree view, parent/child, icon upload, multilingual name
- **Card Sets CRUD** — name, release date, logo
- **Banners** — image upload, link URL, date range scheduling, drag-to-reorder
- **News CRUD** — TipTap rich text editor, multilingual title/content, publish toggle
- **Stock management** — quick stock update table

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend Framework | **Next.js 14** (App Router) | SSR + SSG + ISR |
| UI Library | **React 19** | Server & Client Components |
| Styling | **Tailwind CSS 3.x** | Utility-first, mobile-first |
| Component Library | **shadcn/ui** | Accessible, themeable |
| Backend | **NestJS 10+** | Modular REST API |
| ORM | **Prisma v6** | Type-safe PostgreSQL client |
| Database | **PostgreSQL 16** | Primary data store |
| Auth | **NextAuth.js v5 + JWT** | Sessions + Google OAuth |
| i18n | **next-intl** | Namespace-based, App Router native |
| File Storage | **Cloudinary** (or S3) | Product & banner images |
| Search | **PostgreSQL FTS** → **Meilisearch** (v2) | Full-text search |
| Cache | **Redis** | Rankings TTL, session store |
| Validation | **Zod** (FE) + **class-validator** (BE) | End-to-end type safety |
| State Management | **Zustand** + **TanStack Query** | Client state + server state |
| API Client | **ky** or **axios** | Typed fetch wrapper |
| Testing | **Vitest** + **Playwright** | Unit + E2E |
| Package Manager | **pnpm** | Workspace monorepo |
| Monorepo Tool | **Turborepo** | Build caching + task pipeline |

### 5.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                      │
│  Next.js 14 (App Router)  ·  React 19  ·  Tailwind CSS  │
│  next-intl (EN/VI/JA)     ·  shadcn/ui ·  Zustand       │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / REST
┌──────────────────────────▼──────────────────────────────┐
│                    NestJS API Server                      │
│   /v1/products  /v1/auth  /v1/search  /v1/admin  ...     │
│   JwtAuthGuard  ·  RolesGuard  ·  ValidationPipe         │
└───────────┬──────────────────────┬──────────────────────┘
            │ Prisma v6            │ Redis
┌───────────▼──────┐    ┌──────────▼──────────┐
│   PostgreSQL 16   │    │   Redis (Cache)      │
│   Primary Store   │    │   Rankings, Sessions │
└──────────────────┘    └──────────────────────┘
            │
┌───────────▼──────────┐
│  Cloudinary / S3      │
│  Images & Media       │
└──────────────────────┘
```

---

## 6. Project Structure

### 6.1 Monorepo Layout

```
pokemart/
├── apps/
│   ├── web/                        # Next.js 14 frontend
│   └── api/                        # NestJS backend
├── packages/
│   ├── database/                   # Prisma schema + migrations + seed
│   ├── types/                      # Shared TypeScript interfaces/types
│   └── config/                     # Shared ESLint, TS, Tailwind config
├── locales/
│   ├── en/                         # English translation files
│   ├── vi/                         # Vietnamese translation files
│   └── ja/                         # Japanese translation files
├── docker-compose.yml              # PostgreSQL + Redis local dev
├── turbo.json                      # Turborepo pipeline config
├── pnpm-workspace.yaml
└── README.md
```

### 6.2 Frontend — `apps/web/`

```
apps/web/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # Root locale layout (i18n provider, header, footer)
│   │   ├── page.tsx                # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx            # Product listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Product detail
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── sets/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── pokemon/
│   │   │   ├── page.tsx
│   │   │   └── [name]/page.tsx
│   │   ├── rankings/
│   │   │   └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── news/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── wishlist/
│   │   │   └── page.tsx
│   │   └── admin/
│   │       ├── layout.tsx          # Admin layout (sidebar nav)
│   │       ├── page.tsx            # Dashboard
│   │       ├── products/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── categories/page.tsx
│   │       ├── sets/page.tsx
│   │       ├── banners/page.tsx
│   │       └── news/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── revalidate/route.ts
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn/ui re-exports + custom variants
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Nav.tsx
│   │   ├── MobileMenu.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductImageGallery.tsx
│   │   ├── StockBadge.tsx
│   │   ├── RarityBadge.tsx
│   │   └── WishlistButton.tsx
│   ├── home/
│   │   ├── HeroBanner.tsx
│   │   ├── PokemonQuickNav.tsx
│   │   ├── CategoryGrid.tsx
│   │   ├── RankingsWidget.tsx
│   │   └── NewArrivalsSection.tsx
│   ├── filters/
│   │   ├── FilterSidebar.tsx
│   │   ├── FilterChips.tsx
│   │   ├── PriceRangeSlider.tsx
│   │   └── SortDropdown.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   └── SearchSuggestions.tsx
│   └── admin/
│       ├── ProductForm.tsx
│       ├── ImageUploader.tsx
│       ├── BannerManager.tsx
│       └── StatsCard.tsx
├── lib/
│   ├── api.ts                      # Typed API client (ky/axios wrapper)
│   ├── auth.ts                     # NextAuth config
│   ├── i18n.ts                     # next-intl config
│   └── utils.ts                    # cn(), formatPrice(), etc.
├── hooks/
│   ├── useProducts.ts              # TanStack Query hooks
│   ├── useWishlist.ts
│   ├── useSearch.ts
│   └── useAuth.ts
├── store/
│   ├── uiStore.ts                  # Zustand: sidebar open, view mode, etc.
│   └── wishlistStore.ts            # Zustand: guest wishlist
├── types/
│   └── index.ts                    # Frontend-specific types
├── middleware.ts                   # next-intl locale middleware
├── next.config.ts
└── tailwind.config.ts
```

### 6.3 Backend — `apps/api/`

```
apps/api/src/
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts      # POST /auth/register, /login, /refresh, /logout
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── google.strategy.ts
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       └── login.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts     # GET/PATCH /users/me, wishlist endpoints
│   │   ├── users.service.ts
│   │   └── dto/update-user.dto.ts
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── dto/
│   │       ├── create-product.dto.ts
│   │       ├── update-product.dto.ts
│   │       └── filter-products.dto.ts
│   ├── categories/
│   ├── card-sets/
│   ├── pokemon/
│   ├── banners/
│   ├── news/
│   ├── rankings/
│   ├── search/
│   └── admin/
│       └── admin.controller.ts     # GET /admin/stats
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts      # @Roles(Role.ADMIN)
│   │   └── public.decorator.ts     # @Public()
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts  # Wrap response in { data }
│   │   └── logging.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── pipes/
│       └── parse-int.pipe.ts
├── prisma/
│   └── prisma.service.ts           # PrismaClient singleton
└── main.ts                         # Bootstrap, global prefix /v1, CORS, Swagger
```

---

## 7. Database Schema (Prisma v6)

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────────

enum Role {
  USER
  ADMIN
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
  PRE_ORDER
}

enum CardRarity {
  COMMON
  UNCOMMON
  RARE
  RARE_HOLO
  RARE_ULTRA
  RARE_SECRET
  SPECIAL
}

// ─── USER & AUTH ──────────────────────────────────────────

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  name         String?
  passwordHash String?
  role         Role       @default(USER)
  avatarUrl    String?
  locale       String     @default("en")
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  wishlistItems Wishlist[]
  sessions      Session[]

  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// ─── PRODUCT ──────────────────────────────────────────────

model Product {
  id          String        @id @default(cuid())
  slug        String        @unique
  sku         String        @unique
  price       Decimal       @db.Decimal(10, 2)
  salePrice   Decimal?      @db.Decimal(10, 2)
  stock       Int           @default(0)
  status      ProductStatus @default(ACTIVE)
  releaseDate DateTime?
  isFeatured  Boolean       @default(false)
  isNewArrival Boolean      @default(false)
  salesCount  Int           @default(0)
  viewCount   Int           @default(0)
  categoryId  String
  cardSetId   String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  category     Category             @relation(fields: [categoryId], references: [id])
  cardSet      CardSet?             @relation(fields: [cardSetId], references: [id])
  translations ProductTranslation[]
  images       ProductImage[]
  pokemonTags  ProductPokemon[]
  cardDetails  CardDetail?
  wishlistItems Wishlist[]

  @@map("products")
}

model ProductTranslation {
  id          String  @id @default(cuid())
  productId   String
  locale      String  // "en" | "vi" | "ja"
  name        String
  description String? @db.Text

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, locale])
  @@map("product_translations")
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  url       String
  altText   String?
  isPrimary Boolean @default(false)
  sortOrder Int     @default(0)

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

model CardDetail {
  id          String     @id @default(cuid())
  productId   String     @unique
  hp          Int?
  cardNumber  String?
  rarity      CardRarity?
  cardType    String?    // "Fire" | "Water" | "Grass" | "Psychic" | ...
  illustrator String?
  setNumber   String?

  product Product @relation(fields: [productId], references: [id])

  @@map("card_details")
}

// ─── CATEGORY ─────────────────────────────────────────────

model Category {
  id        String  @id @default(cuid())
  slug      String  @unique
  iconUrl   String?
  parentId  String?
  sortOrder Int     @default(0)

  parent       Category?            @relation("CategoryTree", fields: [parentId], references: [id])
  children     Category[]           @relation("CategoryTree")
  translations CategoryTranslation[]
  products     Product[]

  @@map("categories")
}

model CategoryTranslation {
  id         String @id @default(cuid())
  categoryId String
  locale     String
  name       String

  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([categoryId, locale])
  @@map("category_translations")
}

// ─── CARD SET ─────────────────────────────────────────────

model CardSet {
  id          String    @id @default(cuid())
  slug        String    @unique
  logoUrl     String?
  releaseDate DateTime?

  translations CardSetTranslation[]
  products     Product[]

  @@map("card_sets")
}

model CardSetTranslation {
  id        String @id @default(cuid())
  cardSetId String
  locale    String
  name      String

  cardSet CardSet @relation(fields: [cardSetId], references: [id], onDelete: Cascade)

  @@unique([cardSetId, locale])
  @@map("card_set_translations")
}

// ─── POKÉMON ──────────────────────────────────────────────

model Pokemon {
  id        String  @id @default(cuid())
  slug      String  @unique   // "pikachu", "charizard", ...
  dexNo     Int?    @unique
  nameEn    String
  nameVi    String?
  nameJa    String?
  spriteUrl String?

  products ProductPokemon[]

  @@map("pokemon")
}

model ProductPokemon {
  productId String
  pokemonId String

  product Product @relation(fields: [productId], references: [id])
  pokemon Pokemon @relation(fields: [pokemonId], references: [id])

  @@id([productId, pokemonId])
  @@map("product_pokemon")
}

// ─── BANNER ───────────────────────────────────────────────

model Banner {
  id        String    @id @default(cuid())
  imageUrl  String
  linkUrl   String?
  sortOrder Int       @default(0)
  isActive  Boolean   @default(true)
  startsAt  DateTime?
  endsAt    DateTime?

  translations BannerTranslation[]

  @@map("banners")
}

model BannerTranslation {
  id       String  @id @default(cuid())
  bannerId String
  locale   String
  title    String?
  altText  String?

  banner Banner @relation(fields: [bannerId], references: [id], onDelete: Cascade)

  @@unique([bannerId, locale])
  @@map("banner_translations")
}

// ─── NEWS ─────────────────────────────────────────────────

model News {
  id          String   @id @default(cuid())
  slug        String   @unique
  publishedAt DateTime @default(now())
  isPublished Boolean  @default(true)

  translations NewsTranslation[]

  @@map("news")
}

model NewsTranslation {
  id      String @id @default(cuid())
  newsId  String
  locale  String
  title   String
  content String @db.Text

  news News @relation(fields: [newsId], references: [id], onDelete: Cascade)

  @@unique([newsId, locale])
  @@map("news_translations")
}

// ─── WISHLIST ─────────────────────────────────────────────

model Wishlist {
  userId    String
  productId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  product Product @relation(fields: [productId], references: [id])

  @@id([userId, productId])
  @@map("wishlist")
}
```

---

## 8. API Design (NestJS)

### 8.1 Conventions

```
Base URL:    https://api.pokemart.com/v1
Auth header: Authorization: Bearer <access_token>
Locale:      Accept-Language: en | vi | ja  (or ?locale= query param)

Response envelope:
{
  "data": T,
  "meta": { "total": number, "page": number, "limit": number, "totalPages": number },
  "error": null
}

Error response:
{
  "data": null,
  "error": { "code": string, "message": string, "details": object }
}
```

### 8.2 Endpoint Reference

#### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | — | List products (filter + sort + paginate) |
| `GET` | `/products/:slug` | — | Product detail by slug |
| `POST` | `/products` | ADMIN | Create product |
| `PATCH` | `/products/:id` | ADMIN | Update product |
| `DELETE` | `/products/:id` | ADMIN | Delete product |

**GET /products — Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `q` | string | — | Text search |
| `categorySlug` | string | — | Filter by category |
| `setSlug` | string | — | Filter by card set |
| `rarity` | CardRarity | — | Filter by rarity |
| `pokemonSlug` | string | — | Filter by Pokémon |
| `cardType` | string | — | Filter by card type (Fire, Water…) |
| `priceMin` | number | — | Min price |
| `priceMax` | number | — | Max price |
| `inStock` | boolean | false | In-stock only |
| `isFeatured` | boolean | — | Featured products only |
| `isNewArrival` | boolean | — | New arrivals only |
| `sortBy` | string | `newest` | `newest` \| `price_asc` \| `price_desc` \| `popular` \| `name_asc` |
| `locale` | string | `en` | Translation locale |
| `page` | number | `1` | Page number |
| `limit` | number | `24` | Items per page (max 100) |

#### Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/categories` | — | Full category tree |
| `GET` | `/categories/:slug` | — | Single category with children |
| `GET` | `/categories/:slug/products` | — | Products in category |
| `POST` | `/categories` | ADMIN | Create category |
| `PATCH` | `/categories/:id` | ADMIN | Update category |
| `DELETE` | `/categories/:id` | ADMIN | Delete category |

#### Card Sets

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/sets` | — | All card sets |
| `GET` | `/sets/:slug/products` | — | Products in a set |
| `POST` | `/sets` | ADMIN | Create card set |
| `PATCH` | `/sets/:id` | ADMIN | Update card set |

#### Pokémon

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/pokemon` | — | All Pokémon (id, slug, name, sprite) |
| `GET` | `/pokemon/:slug/products` | — | Products featuring a Pokémon |

#### Search

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/search?q=&locale=` | — | Full-text search across products |
| `GET` | `/search/suggestions?q=&locale=` | — | Instant search suggestions (max 8) |

#### Rankings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/rankings?type=sales&limit=10` | — | Top products by `sales` \| `views` \| `wishlist` |

#### Banners

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/banners?locale=` | — | Active banners (filtered by date range) |
| `POST` | `/banners` | ADMIN | Create banner |
| `PATCH` | `/banners/:id` | ADMIN | Update banner |
| `DELETE` | `/banners/:id` | ADMIN | Delete banner |

#### News

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/news?locale=&page=` | — | Published news list |
| `GET` | `/news/:slug?locale=` | — | News detail |
| `POST` | `/news` | ADMIN | Create news |
| `PATCH` | `/news/:id` | ADMIN | Update news |
| `DELETE` | `/news/:id` | ADMIN | Delete news |

#### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register with email + password |
| `POST` | `/auth/login` | — | Login, returns access + refresh tokens |
| `POST` | `/auth/refresh` | — | Refresh access token |
| `POST` | `/auth/logout` | USER | Invalidate refresh token |
| `POST` | `/auth/forgot-password` | — | Send reset email |
| `POST` | `/auth/reset-password` | — | Reset password with token |

#### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me` | USER | Get current user profile |
| `PATCH` | `/users/me` | USER | Update profile (name, avatar, locale) |
| `GET` | `/users/me/wishlist` | USER | Get wishlist items |
| `POST` | `/users/me/wishlist/:productId` | USER | Add to wishlist |
| `DELETE` | `/users/me/wishlist/:productId` | USER | Remove from wishlist |

#### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | ADMIN | Dashboard statistics |

---

## 9. Internationalization (i18n)

### 9.1 Locales

| Locale | Language | URL | Currency | Date Format |
|---|---|---|---|---|
| `en` | English | `/en/...` | USD (`$`) | MM/DD/YYYY |
| `vi` | Tiếng Việt | `/vi/...` | VND (`₫`) | DD/MM/YYYY |
| `ja` | 日本語 | `/ja/...` | JPY (`¥`) | YYYY/MM/DD |

### 9.2 Translation Files

```
locales/
├── en/
│   ├── common.json       # nav, buttons, labels, footer
│   ├── home.json         # homepage section titles
│   ├── product.json      # product page labels, stock status, rarity names
│   ├── category.json     # category names + descriptions
│   ├── auth.json         # login/register form labels + validation messages
│   ├── profile.json      # profile & wishlist labels
│   ├── admin.json        # admin panel labels
│   └── errors.json       # error messages
├── vi/                   # same structure
└── ja/                   # same structure
```

### 9.3 next-intl Setup

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'vi', 'ja'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({ children, params: { locale } }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

### 9.4 Translation Keys Convention

```json
// locales/en/product.json
{
  "status": {
    "IN_STOCK": "In Stock",
    "LOW_STOCK": "Low Stock",
    "OUT_OF_STOCK": "Out of Stock",
    "PRE_ORDER": "Pre-order"
  },
  "rarity": {
    "COMMON": "Common",
    "UNCOMMON": "Uncommon",
    "RARE": "Rare",
    "RARE_HOLO": "Rare Holo",
    "RARE_ULTRA": "Ultra Rare",
    "RARE_SECRET": "Secret Rare",
    "SPECIAL": "Special"
  },
  "addToWishlist": "Add to Wishlist",
  "removeFromWishlist": "Remove from Wishlist",
  "addToCart": "Add to Cart",
  "comingSoon": "Coming Soon",
  "relatedProducts": "Related Products"
}
```

---

## 10. UI / UX Guidelines

### 10.1 Design Tokens (Tailwind / CSS Variables)

```css
:root {
  --color-primary:    #3B4CCA;  /* Pokémon blue — nav, buttons, headings */
  --color-secondary:  #FFCC00;  /* Pokémon yellow — badges, accents */
  --color-accent:     #CC0000;  /* Pokémon red — sale, alerts, errors */
  --color-surface:    #F9FAFB;  /* Page background */
  --color-card:       #FFFFFF;  /* Card background */
  --color-text:       #1A1A2E;  /* Body text */
  --color-muted:      #6B7280;  /* Secondary text */
  --font-display:     'Nunito', 'Press Start 2P', sans-serif;
  --font-body:        'Inter', system-ui, sans-serif;
  --radius:           0.75rem;
  --shadow-card:      0 2px 8px rgba(0,0,0,0.08);
  --shadow-hover:     0 8px 24px rgba(59,76,202,0.15);
}
```

### 10.2 Breakpoints

```
Mobile:   < 640px   — single column, bottom-sheet filters, hamburger nav
Tablet:   640–1024px — 2-col product grid, collapsible sidebar
Desktop:  1024–1280px — 3-col product grid, persistent filter sidebar
Wide:     > 1280px  — 4-col grid, max-width 1280px centered
```

### 10.3 Key Component Specs

| Component | Spec |
|---|---|
| `ProductCard` | Min-width 200px, image aspect-ratio 3:4, hover: `translateY(-4px)` + shadow, heart icon top-right |
| `HeroBanner` | Full-width, 480px desktop / 240px mobile, autoplay 5s, keyboard nav, ARIA labels |
| `Header` | Sticky, 64px height, transparent → solid on scroll (50px threshold) |
| `FilterSidebar` | 280px width desktop, bottom sheet on mobile, checkbox with count badges |
| `PokemonQuickNav` | 80px sprite icons, horizontally scrollable row, click → filter |
| `StockBadge` | `IN_STOCK` green, `LOW_STOCK` amber, `OUT_OF_STOCK` red, `PRE_ORDER` blue |
| `RarityBadge` | Gradient based on rarity tier, gold shimmer for RARE_SECRET |

---

## 11. Component Inventory

### Shared / UI

```
components/ui/
  Button           — variants: primary, secondary, ghost, danger; sizes: sm, md, lg
  Badge            — stock, rarity, sale
  Input            — with label, error state, icon prefix/suffix
  Select           — accessible dropdown
  Checkbox         — with indeterminate state
  Slider           — price range
  Modal / Dialog   — portal-based
  Skeleton         — loading placeholder
  Carousel         — touch swipe, autoplay
  Pagination       — URL-based
  Breadcrumb
  Tabs
  Tooltip
```

### Layout

```
components/layout/
  Header           — sticky, search, language switcher, auth state
  Footer           — links, social, legal
  Nav              — desktop mega menu + mobile hamburger
  LanguageSwitcher — flag + locale code, dropdown
  MobileMenu       — full-screen overlay
  AdminSidebar     — collapsible nav for admin panel
```

### Product

```
components/product/
  ProductCard          — grid card with image, name, price, wishlist
  ProductGrid          — responsive grid with skeleton loading
  ProductDetail        — full detail layout
  ProductImageGallery  — main image + thumbnails + lightbox
  StockBadge           — colored badge per ProductStatus
  RarityBadge          — styled per CardRarity
  WishlistButton       — heart toggle, optimistic update
  RelatedProducts      — horizontal scroll carousel
  PriceDisplay         — handles sale price display
```

### Homepage

```
components/home/
  HeroBanner           — carousel with CTA
  PokemonQuickNav      — sprite icon row
  CategoryGrid         — icon + label tiles
  RankingsWidget       — numbered list with thumbnails
  NewArrivalsSection   — product grid section
  FeaturedSection      — promotional banner grid
  NewsSection          — latest news cards
```

### Filters & Search

```
components/filters/
  FilterSidebar        — full filter panel
  FilterChips          — active filter removable chips
  PriceRangeSlider     — dual-handle slider
  SortDropdown

components/search/
  SearchBar            — with autocomplete dropdown
  SearchSuggestions    — product + category suggestions
```

---

## 12. Implementation Phases

### Phase 1 — Foundation (Week 1–2)

- [ ] Initialize monorepo with Turborepo + pnpm workspaces
- [ ] Set up `apps/web` (Next.js 14 App Router) and `apps/api` (NestJS)
- [ ] Configure `packages/database` with Prisma v6 + PostgreSQL
- [ ] Create Prisma schema (all models from Section 7)
- [ ] Run initial migration and create seed script with sample data
- [ ] Configure Tailwind CSS + shadcn/ui in Next.js
- [ ] Set up next-intl with `[locale]` route segment + locale files (EN/VI/JA)
- [ ] Configure NestJS global pipes, filters, interceptors, Swagger
- [ ] Build base layout: Header, Footer, Nav (desktop + mobile)
- [ ] Set up Docker Compose for local PostgreSQL + Redis
- [ ] Configure environment variable schemas (Zod)

### Phase 2 — Auth & Product Core (Week 3–4)

- [ ] NestJS: Auth module (register, login, JWT, refresh, logout, Google OAuth)
- [ ] Next.js: NextAuth.js v5 integration, protected route middleware
- [ ] Login + Register pages with form validation (Zod + React Hook Form)
- [ ] NestJS: Products module (CRUD, filters, pagination, locale-aware queries)
- [ ] NestJS: Categories module (tree query)
- [ ] NestJS: Card Sets module
- [ ] NestJS: Pokémon module
- [ ] Frontend: `ProductCard`, `ProductGrid`, `FilterSidebar`, `SortDropdown`
- [ ] Product Listing page `/products` with all filters wired up
- [ ] Product Detail page `/products/[slug]`

### Phase 3 — Homepage & Discovery (Week 5)

- [ ] NestJS: Banners endpoint, Rankings endpoint
- [ ] Homepage: HeroBanner carousel, PokemonQuickNav, CategoryGrid
- [ ] Homepage: New Arrivals, Rankings widget, News section
- [ ] Category listing & detail pages
- [ ] Card Set listing & detail pages
- [ ] Pokémon listing & detail pages
- [ ] Search: NestJS full-text search endpoint
- [ ] Search: SearchBar with suggestions, Search results page

### Phase 4 — User Features & Content (Week 6)

- [ ] User profile page (edit name, avatar, preferred locale)
- [ ] Wishlist API + WishlistButton component + Wishlist page
- [ ] Guest wishlist (localStorage) merged on login
- [ ] News listing + detail pages
- [ ] Rankings page
- [ ] Language switcher fully wired (locale persistence in profile)

### Phase 5 — Admin Panel (Week 7)

- [ ] Admin layout with sidebar navigation
- [ ] Admin dashboard with stats
- [ ] Product CRUD form (with image upload to Cloudinary)
- [ ] Category tree management UI
- [ ] Card Set management UI
- [ ] Banner management (upload, schedule, drag-to-reorder)
- [ ] News CRUD with TipTap rich text editor
- [ ] Stock quick-update table

### Phase 6 — Polish & Deploy (Week 8)

- [ ] SEO: `generateMetadata` per page, Open Graph, sitemap.xml, robots.txt
- [ ] Performance: image optimization (Next.js Image), ISR for product pages
- [ ] Accessibility audit (axe-core, keyboard navigation, ARIA labels)
- [ ] Unit tests (Vitest): services, utilities, API response shapes
- [ ] E2E tests (Playwright): homepage load, product filter, search, auth flow
- [ ] Error boundaries + loading skeletons on all async pages
- [ ] CI/CD pipeline (GitHub Actions): lint → test → build → deploy
- [ ] Production deploy (Vercel for web, Railway/Render for API)

---

## 13. Environment Variables

### `apps/web/.env.local`

```env
# NestJS API
NEXT_PUBLIC_API_URL=http://localhost:3001/v1

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudinary (for admin image upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### `apps/api/.env`

```env
# Database
DATABASE_URL=postgresql://pokemart:password@localhost:5432/pokemart_db

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# App
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
```

### `packages/database/.env`

```env
DATABASE_URL=postgresql://pokemart:password@localhost:5432/pokemart_db
```

---

## 14. Coding Conventions

### TypeScript

- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` — use `unknown` + type guards
- Explicit return types on all functions
- Use `type` for object shapes, `interface` for extendable contracts
- Barrel exports via `index.ts` in each module

### NestJS / Backend

- One module per resource (feature module pattern)
- DTOs validated with `class-validator` decorators
- Services contain all business logic (controllers are thin)
- Use `@Public()` decorator for unprotected routes (JWT guard applied globally)
- Prisma queries in service layer only (never in controllers)
- Pagination always returns `{ data: T[], meta: PaginationMeta }`

### Next.js / Frontend

- Server Components by default; add `'use client'` only when needed (event handlers, hooks, browser APIs)
- Data fetching in Server Components using `fetch` with Next.js cache tags
- Client-side mutations via TanStack Query `useMutation` + cache invalidation
- All API calls go through `lib/api.ts` typed client — no raw `fetch` in components
- Use `generateStaticParams` for product/category/set pages (SSG + ISR)
- `revalidate = 60` for product pages (ISR 60s)

### i18n

- All user-visible strings must use `useTranslations('namespace')` — no hardcoded English strings
- Translation key format: `camelCase` keys, nested with `.`
- Missing translations fall back to `en` locale
- Number/currency formatting: always use `Intl.NumberFormat` with locale

### Git

- Branch naming: `feat/`, `fix/`, `chore/`, `docs/`
- Commit format: Conventional Commits (`feat(products): add filter by rarity`)
- PRs require passing CI (lint + tests) before merge

---

## Appendix: Seed Data Checklist

The `packages/database/prisma/seed.ts` should include:

- [ ] 3 admin users + 5 sample users
- [ ] 15 top-level categories with translations in EN/VI/JA
- [ ] 10 card sets (e.g., Scarlet & Violet, Paldea Evolved, etc.)
- [ ] 30 Pokémon entries with dex numbers and sprite URLs
- [ ] 50+ products with full translations, images, and card details
- [ ] 5 active banners with scheduled dates
- [ ] 10 news articles with translations
- [ ] Sample wishlist entries for demo users

---

*Document maintained for AI Agent implementation. Each section maps directly to a development task. Implement phases sequentially for best results.*