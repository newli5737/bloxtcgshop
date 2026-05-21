import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import type { PaginatedResponse, ProductListItem, SearchSuggestion } from "../../common/types/responses";
import type { FilterProductsDto } from "../products/dto/filter-products.dto";
import { SearchService } from "./search.service";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  fullSearch(@Query() query: FilterProductsDto): Promise<PaginatedResponse<ProductListItem>> {
    return this.searchService.search(query.q ?? "", query.locale ?? "ja", query);
  }

  @Public()
  @Get("suggestions")
  suggestions(@Query("q") q: string, @Query("locale") locale?: string): Promise<SearchSuggestion[]> {
    return this.searchService.suggestions(q ?? "", locale ?? "ja");
  }
}
