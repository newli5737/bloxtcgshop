import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import type { FilterProductsDto } from "../products/dto/filter-products.dto";
import { SearchService } from "./search.service";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  fullSearch(@Query() query: FilterProductsDto): Promise<unknown> {
    return this.searchService.search(query.q ?? "", query.locale ?? "en", query);
  }

  @Public()
  @Get("suggestions")
  suggestions(@Query("q") q: string, @Query("locale") locale?: string): Promise<unknown[]> {
    return this.searchService.suggestions(q ?? "", locale ?? "en");
  }
}
