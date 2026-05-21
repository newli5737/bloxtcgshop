import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { FilterProductsDto } from "../products/dto/filter-products.dto";
import { ProductsService } from "../products/products.service";

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
  ) {}

  async search(q: string, locale = "ja", query: FilterProductsDto): Promise<unknown> {
    return this.products.list({ ...query, q, locale });
  }

  async suggestions(q: string, locale = "ja"): Promise<unknown[]> {
    const term = q.trim();
    if (term.length < 2) {
      return [];
    }
    const products = await this.prisma.product.findMany({
      where: {
        translations: { some: { locale, name: { contains: term, mode: "insensitive" } } },
      },
      take: 8,
      include: { translations: { where: { locale } } },
    });
    return products.map((p) => ({
      type: "product" as const,
      slug: p.slug,
      name: p.translations[0]?.name ?? p.slug,
    }));
  }
}
