import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import type { CardSetResponse, PaginatedResponse, ProductListItem } from "../../common/types/responses";
import type { FilterProductsDto } from "../products/dto/filter-products.dto";
import { CardSetsService } from "./card-sets.service";

@ApiTags("sets")
@Controller("sets")
export class CardSetsController {
  constructor(private readonly sets: CardSetsService) {}

  @Public()
  @Get()
  list(@Query("locale") locale?: string): Promise<CardSetResponse[]> {
    return this.sets.list(locale ?? "en");
  }

  @Public()
  @Get(":slug/products")
  products(@Param("slug") slug: string, @Query() query: FilterProductsDto): Promise<PaginatedResponse<ProductListItem>> {
    return this.sets.listProductsForSlug(slug, query);
  }
}
