import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProductStatus } from "@pokemart/database";
import { PrismaService } from "../../prisma/prisma.service";
import type { PaginatedResponse, ProductListItem, ProductDetail, DeleteResult } from "../../common/types/responses";
import type { CreateProductDto, FilterProductsDto, UpdateProductDto } from "./dto/filter-products.dto";

const productIncludeObj = {
  translations: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  category: { include: { translations: true } },
  cardSet: { include: { translations: true } },
  cardDetails: true,
  pokemonTags: { include: { pokemon: true } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productIncludeObj }>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(dto: FilterProductsDto): Promise<PaginatedResponse<ProductListItem>> {
    const locale = dto.locale ?? "ja";
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 24;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (dto.categorySlug) where.category = { slug: dto.categorySlug };
    if (dto.setSlug) where.cardSet = { slug: dto.setSlug };
    if (dto.pokemonSlug) where.pokemonTags = { some: { pokemon: { slug: dto.pokemonSlug } } };
    if (dto.rarity || dto.cardType) {
      where.cardDetails = {
        ...(dto.rarity ? { rarity: dto.rarity } : {}),
        ...(dto.cardType ? { cardType: dto.cardType } : {}),
      };
    }
    const priceClauses: Prisma.ProductWhereInput[] = [];
    if (dto.priceMin !== undefined) priceClauses.push({ price: { gte: dto.priceMin } });
    if (dto.priceMax !== undefined) priceClauses.push({ price: { lte: dto.priceMax } });
    if (priceClauses.length > 0) where.AND = [...(Array.isArray(where.AND) ? where.AND : []), ...priceClauses];
    if (dto.inStock) { where.stock = { gt: 0 }; where.status = { not: ProductStatus.OUT_OF_STOCK }; }
    if (dto.isFeatured === true) where.isFeatured = true;
    if (dto.isNewArrival === true) where.isNewArrival = true;
    if (dto.q) {
      const q = dto.q.trim();
      where.OR = [
        { sku: { contains: q, mode: "insensitive" } },
        { translations: { some: { locale, name: { contains: q, mode: "insensitive" } } } },
        { cardSet: { translations: { some: { locale, name: { contains: q, mode: "insensitive" } } } } },
        { pokemonTags: { some: { OR: [{ pokemon: { nameEn: { contains: q, mode: "insensitive" } } }, { pokemon: { slug: { contains: q, mode: "insensitive" } } }] } } },
      ];
    }

    const sortBy = dto.sortBy ?? "newest";
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sortBy === "price_asc") orderBy = { price: "asc" };
    if (sortBy === "price_desc") orderBy = { price: "desc" };
    if (sortBy === "popular") orderBy = { salesCount: "desc" };

    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({ where, skip, take: limit, orderBy, include: productIncludeObj }),
    ]);

    let items = rows.map((p) => this.mapProductList(p, locale));
    if (sortBy === "name_asc") items = items.sort((a, b) => a.name.localeCompare(b.name));

    return { data: items, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  }

  async getBySlug(slug: string, locale = "ja"): Promise<ProductDetail> {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: productIncludeObj });
    if (!product) throw new NotFoundException("Product not found");
    await this.prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } });
    return this.mapProductDetail({ ...product, viewCount: product.viewCount + 1 }, locale);
  }

  async create(dto: CreateProductDto): Promise<ProductListItem> {
    const product = await this.prisma.product.create({
      data: {
        slug: dto.slug,
        sku: dto.sku,
        price: dto.price,
        salePrice: dto.salePrice,
        stock: dto.stock ?? 0,
        status: dto.status ?? ProductStatus.ACTIVE,
        categoryId: dto.categoryId,
        cardSetId: dto.cardSetId,
        isFeatured: dto.isFeatured ?? false,
        isNewArrival: dto.isNewArrival ?? false,
        translations: {
          create: dto.translations.map((t) => ({ locale: t.locale, name: t.name, description: t.description })),
        },
        ...(dto.imageUrl ? { images: { create: { url: dto.imageUrl, isPrimary: true, sortOrder: 0 } } } : {}),
      },
      include: productIncludeObj,
    });
    return this.mapProductList(product, dto.translations[0]?.locale ?? "ja");
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductListItem> {
    try {
      // Handle image update
      if (dto.imageUrl) {
        const existing = await this.prisma.productImage.findFirst({ where: { productId: id, isPrimary: true } });
        if (existing) {
          await this.prisma.productImage.update({ where: { id: existing.id }, data: { url: dto.imageUrl } });
        } else {
          await this.prisma.productImage.create({ data: { productId: id, url: dto.imageUrl, isPrimary: true, sortOrder: 0 } });
        }
      }
      // Handle translations update
      if (dto.translations) {
        for (const t of dto.translations) {
          const existingTr = await this.prisma.productTranslation.findFirst({ where: { productId: id, locale: t.locale } });
          if (existingTr) {
            await this.prisma.productTranslation.update({ where: { id: existingTr.id }, data: { name: t.name, description: t.description } });
          } else {
            await this.prisma.productTranslation.create({ data: { productId: id, locale: t.locale, name: t.name, description: t.description } });
          }
        }
      }
      const { imageUrl, translations, ...updateData } = dto;
      void imageUrl;
      void translations;
      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
        include: productIncludeObj,
      });
      return this.mapProductList(product, "ja");
    } catch {
      throw new NotFoundException("Product not found");
    }
  }

  async remove(id: string): Promise<DeleteResult> {
    try {
      await this.prisma.product.delete({ where: { id } });
      return { id };
    } catch {
      throw new NotFoundException("Product not found");
    }
  }

  private mapProductList(p: ProductRow, locale = "ja"): ProductListItem {
    const tr = p.translations.find((t) => t.locale === locale) ?? p.translations[0];
    const catTr = p.category?.translations.find((t) => t.locale === locale) ?? p.category?.translations[0];
    const setTr = p.cardSet?.translations.find((t) => t.locale === locale) ?? p.cardSet?.translations[0];
    const primary = p.images.find((i) => i.isPrimary) ?? p.images[0];
    return {
      id: p.id,
      slug: p.slug,
      sku: p.sku,
      name: tr?.name ?? p.slug,
      price: Number(p.price),
      salePrice: p.salePrice != null ? Number(p.salePrice) : null,
      stock: p.stock,
      status: p.status,
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      imageUrl: primary?.url ?? null,
      categoryName: catTr?.name ?? null,
      setName: setTr?.name ?? null,
      rarity: p.cardDetails?.rarity ?? null,
    };
  }

  private mapProductDetail(p: ProductRow, locale = "ja"): ProductDetail {
    const base = this.mapProductList(p, locale);
    const tr = p.translations.find((t) => t.locale === locale) ?? p.translations[0];
    return {
      ...base,
      description: tr?.description ?? null,
      releaseDate: p.releaseDate,
      images: p.images,
      cardDetails: p.cardDetails,
      pokemon: p.pokemonTags.map((x) => x.pokemon),
      category: p.category ? { ...p.category } : null,
      cardSet: p.cardSet ? { name: p.cardSet.translations[0]?.name ?? "" } : null,
      viewCount: p.viewCount,
    };
  }
}
