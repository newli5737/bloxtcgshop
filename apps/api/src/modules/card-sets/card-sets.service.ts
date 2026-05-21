import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { FilterProductsDto } from "../products/dto/filter-products.dto";
import { ProductsService } from "../products/products.service";

@Injectable()
export class CardSetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async list(locale = "en"): Promise<unknown[]> {
    return this.prisma.cardSet.findMany({
      orderBy: { releaseDate: "desc" },
      include: { translations: { where: { locale } } },
    });
  }

  async listProductsForSlug(slug: string, query: FilterProductsDto): Promise<unknown> {
    const set = await this.prisma.cardSet.findUnique({ where: { slug } });
    if (!set) {
      throw new NotFoundException("Set not found");
    }
    return this.productsService.list({ ...query, setSlug: slug });
  }
}
