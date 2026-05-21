import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import type { FilterProductsDto } from "../products/dto/filter-products.dto";
import { PokemonService } from "./pokemon.service";

@ApiTags("pokemon")
@Controller("pokemon")
export class PokemonController {
  constructor(private readonly pokemon: PokemonService) {}

  @Public()
  @Get()
  list(): Promise<unknown[]> {
    return this.pokemon.list();
  }

  @Public()
  @Get(":slug/products")
  products(@Param("slug") slug: string, @Query() query: FilterProductsDto): Promise<unknown> {
    return this.pokemon.listProductsForSlug(slug, query);
  }
}
