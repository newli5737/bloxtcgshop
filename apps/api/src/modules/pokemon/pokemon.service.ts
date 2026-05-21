import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { FilterProductsDto } from "../products/dto/filter-products.dto";
import { ProductsService } from "../products/products.service";

@Injectable()
export class PokemonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async list(): Promise<unknown[]> {
    return this.prisma.pokemon.findMany({
      orderBy: { dexNo: "asc" },
    });
  }

  async listProductsForSlug(slug: string, query: FilterProductsDto): Promise<unknown> {
    const mon = await this.prisma.pokemon.findUnique({ where: { slug } });
    if (!mon) {
      throw new NotFoundException("Pokémon not found");
    }
    return this.productsService.list({ ...query, pokemonSlug: slug });
  }
}
