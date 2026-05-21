import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import type { FilterProductsDto } from "../products/dto/filter-products.dto";
import { CategoriesService } from "./categories.service";

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Public()
  @Get()
  tree(@Query("locale") locale?: string): Promise<unknown[]> {
    return this.categories.tree(locale ?? "ja");
  }

  @Public()
  @Get(":slug/products")
  products(@Param("slug") slug: string, @Query() query: FilterProductsDto): Promise<unknown> {
    return this.categories.listProductsForSlug(slug, query);
  }

  @Public()
  @Get(":slug")
  bySlug(@Param("slug") slug: string, @Query("locale") locale?: string): Promise<unknown> {
    return this.categories.bySlug(slug, locale ?? "ja");
  }
}
