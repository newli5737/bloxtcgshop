import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { FilterProductsDto } from "../products/dto/filter-products.dto";
import { ProductsService } from "../products/products.service";
import type { CategoryResponse, CreateCategoryDto, UpdateCategoryDto, DeleteResult, PaginatedResponse, ProductListItem } from "../../common/types/responses";

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async tree(locale = "ja"): Promise<CategoryResponse[]> {
    return prismaCategoryTree(this.prisma, locale);
  }

  async bySlug(slug: string, locale = "ja"): Promise<CategoryResponse> {
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
    return cat as CategoryResponse;
  }

  async listProductsForSlug(slug: string, query: FilterProductsDto): Promise<PaginatedResponse<ProductListItem>> {
    return this.productsService.list({ ...query, categorySlug: slug });
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponse> {
    const created = await this.prisma.category.create({
      data: {
        slug: dto.slug,
        sortOrder: dto.sortOrder ?? 0,
        iconUrl: dto.iconUrl,
        parentId: dto.parentId,
        translations: { create: dto.translations },
      },
      include: { translations: true },
    });
    return created as CategoryResponse;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponse> {
    const { translations, ...data } = dto;
    if (translations?.length) {
      for (const t of translations) {
        await this.prisma.categoryTranslation.upsert({
          where: { categoryId_locale: { categoryId: id, locale: t.locale } },
          create: { categoryId: id, locale: t.locale, name: t.name },
          update: { name: t.name },
        });
      }
    }
    const cat = await this.prisma.category.update({
      where: { id },
      data,
      include: { translations: true },
    });
    return cat as CategoryResponse;
  }

  async remove(id: string): Promise<DeleteResult> {
    try {
      await this.prisma.category.delete({ where: { id } });
      return { id };
    } catch {
      throw new NotFoundException("Category not found");
    }
  }
}

async function prismaCategoryTree(prisma: PrismaService, locale: string): Promise<CategoryResponse[]> {
  const result = await prisma.category.findMany({
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
  return result as CategoryResponse[];
}
