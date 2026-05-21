import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProductStatus } from "@pokemart/database";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateProductDto, FilterProductsDto, UpdateProductDto } from "./dto/filter-products.dto";

const productInclude = (locale: string): Prisma.ProductInclude => ({
  translations: { where: { locale } },
  images: { orderBy: { sortOrder: "asc" } },
  category: { include: { translations: { where: { locale } } } },
  cardSet: { include: { translations: { where: { locale } } } },
  cardDetails: true,
  pokemonTags: { include: { pokemon: true } },
});

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(dto: FilterProductsDto): Promise<{ data: unknown[]; meta: Record<string, number> }> {
    const locale = dto.locale ?? "en";
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 24;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (dto.categorySlug) {
      where.category = { slug: dto.categorySlug };
    }
    if (dto.setSlug) {
      where.cardSet = { slug: dto.setSlug };
    }
    if (dto.pokemonSlug) {
      where.pokemonTags = { some: { pokemon: { slug: dto.pokemonSlug } } };
    }
    if (dto.rarity || dto.cardType) {
      where.cardDetails = {
        ...(dto.rarity ? { rarity: dto.rarity } : {}),
        ...(dto.cardType ? { cardType: dto.cardType } : {}),
      };
    }
    const priceClauses: Prisma.ProductWhereInput[] = [];
    if (dto.priceMin !== undefined) {
      priceClauses.push({ price: { gte: dto.priceMin } });
    }
    if (dto.priceMax !== undefined) {
      priceClauses.push({ price: { lte: dto.priceMax } });
    }
    if (priceClauses.length > 0) {
      where.AND = [...(Array.isArray(where.AND) ? where.AND : []), ...priceClauses];
    }
    if (dto.inStock) {
      where.stock = { gt: 0 };
      where.status = { not: ProductStatus.OUT_OF_STOCK };
    }
    if (dto.isFeatured === true) {
      where.isFeatured = true;
    }
    if (dto.isNewArrival === true) {
      where.isNewArrival = true;
    }
    if (dto.q) {
      const q = dto.q.trim();
      where.OR = [
        { sku: { contains: q, mode: "insensitive" } },
        { translations: { some: { locale, name: { contains: q, mode: "insensitive" } } } },
        {
          cardSet: {
            translations: { some: { locale, name: { contains: q, mode: "insensitive" } } },
          },
        },
        {
          pokemonTags: {
            some: {
              OR: [
                { pokemon: { nameEn: { contains: q, mode: "insensitive" } } },
                { pokemon: { slug: { contains: q, mode: "insensitive" } } },
              ],
            },
          },
        },
      ];
    }

    const sortBy = dto.sortBy ?? "newest";
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sortBy === "price_asc") orderBy = { price: "asc" };
    if (sortBy === "price_desc") orderBy = { price: "desc" };
    if (sortBy === "popular") orderBy = { salesCount: "desc" };

    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: productInclude(locale),
      }),
    ]);

    let items = rows.map((p) => this.mapProductList(p, locale));
    if (sortBy === "name_asc") {
      items = items.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      data: items,
      meta: { total, page, limit, totalPages },
    };
  }

  async getBySlug(slug: string, locale = "en"): Promise<unknown> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: productInclude(locale),
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    await this.prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });
    return this.mapProductDetail({ ...product, viewCount: product.viewCount + 1 }, locale);
  }

  async create(dto: CreateProductDto): Promise<unknown> {
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
          create: dto.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            description: t.description,
          })),
        },
      },
    });
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<unknown> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          ...dto,
          salePrice: dto.salePrice === undefined ? undefined : dto.salePrice,
        },
      });
    } catch {
      throw new NotFoundException("Product not found");
    }
  }

  async remove(id: string): Promise<{ id: string }> {
    try {
      await this.prisma.product.delete({ where: { id } });
      return { id };
    } catch {
      throw new NotFoundException("Product not found");
    }
  }

  private mapProductList(p: Record<string, unknown>, locale: string): Record<string, unknown> {
    const tr = (p.translations as Array<{ name: string }>)?.[0];
    const catTr = (p.category as { translations?: Array<{ name: string }> })?.translations?.[0];
    const setTr = (p.cardSet as { translations?: Array<{ name: string }> } | null)?.translations?.[0];
    const primary =
      (p.images as Array<{ url: string; isPrimary: boolean }>)?.find((i) => i.isPrimary) ??
      (p.images as Array<{ url: string }>)?.[0];
    return {
      id: p.id,
      slug: p.slug,
      sku: p.sku,
      name: tr?.name ?? p.slug,
      price: Number(p.price as { toString(): string } | number),
      salePrice: p.salePrice != null ? Number(p.salePrice as { toString(): string } | number) : null,
      stock: p.stock,
      status: p.status,
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      imageUrl: primary?.url ?? null,
      categoryName: catTr?.name ?? null,
      setName: setTr?.name ?? null,
      rarity: (p.cardDetails as { rarity?: string } | null)?.rarity ?? null,
    };
  }

  private mapProductDetail(p: Record<string, unknown>, locale: string): Record<string, unknown> {
    const base = this.mapProductList(p, locale);
    const tr = (p.translations as Array<{ name: string; description: string | null }>)?.[0];
    return {
      ...base,
      name: tr?.name ?? base.name,
      description: tr?.description ?? null,
      releaseDate: p.releaseDate,
      images: p.images,
      cardDetails: p.cardDetails,
      pokemon: (p.pokemonTags as Array<{ pokemon: Record<string, unknown> }>)?.map((x) => x.pokemon) ?? [],
      category: p.category,
      cardSet: p.cardSet,
      viewCount: p.viewCount,
    };
  }
}
