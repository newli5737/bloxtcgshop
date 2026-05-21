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

  async tree(locale = "en"): Promise<unknown[]> {
    const categories = await prismaCategoryTree(this.prisma, locale);
    return categories;
  }

  async bySlug(slug: string, locale = "en"): Promise<unknown> {
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
    if (!cat) {
      throw new NotFoundException("Category not found");
    }
    return cat;
  }

  async listProductsForSlug(slug: string, query: FilterProductsDto): Promise<unknown> {
    return this.productsService.list({ ...query, categorySlug: slug });
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
