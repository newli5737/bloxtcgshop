import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { FilterProductsDto } from "../products/dto/filter-products.dto";
import { ProductsService } from "../products/products.service";

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async tree(locale = "ja"): Promise<unknown[]> {
    return prismaCategoryTree(this.prisma, locale);
  }

  async bySlug(slug: string, locale = "ja"): Promise<unknown> {
    const cat = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        translations: { where: { locale } },
        children: {
          orderBy: { sortOrder: "asc" },
          include: { translations: { where: { locale } } },
        },
      },
    });
    if (!cat) throw new NotFoundException("Category not found");
    return cat;
  }

  async listProductsForSlug(slug: string, query: FilterProductsDto): Promise<unknown> {
    return this.productsService.list({ ...query, categorySlug: slug });
  }

  async create(dto: { slug: string; sortOrder?: number; iconUrl?: string; parentId?: string; translations: Array<{ locale: string; name: string }> }): Promise<unknown> {
    return this.prisma.category.create({
      data: {
        slug: dto.slug,
        sortOrder: dto.sortOrder ?? 0,
        iconUrl: dto.iconUrl,
        parentId: dto.parentId,
        translations: { create: dto.translations },
      },
      include: { translations: true },
    });
  }

  async update(id: string, dto: { slug?: string; sortOrder?: number; iconUrl?: string; translations?: Array<{ locale: string; name: string }> }): Promise<unknown> {
    const { translations, ...data } = dto;
    const cat = await this.prisma.category.update({
      where: { id },
      data,
    });
    if (translations?.length) {
      for (const t of translations) {
        await this.prisma.categoryTranslation.upsert({
          where: { categoryId_locale: { categoryId: id, locale: t.locale } },
          create: { categoryId: id, locale: t.locale, name: t.name },
          update: { name: t.name },
        });
      }
    }
    return cat;
  }

  async remove(id: string): Promise<{ id: string }> {
    try {
      await this.prisma.category.delete({ where: { id } });
      return { id };
    } catch {
      throw new NotFoundException("Category not found");
    }
  }
}

async function prismaCategoryTree(prisma: PrismaService, locale: string): Promise<unknown[]> {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale } },
      children: {
        orderBy: { sortOrder: "asc" },
        include: {
          translations: { where: { locale } },
          children: {
            orderBy: { sortOrder: "asc" },
            include: { translations: { where: { locale } } },
          },
        },
      },
    },
  });
}
