import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@pokemart/database";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import type { CategoryResponse, CreateCategoryDto, UpdateCategoryDto, DeleteResult, PaginatedResponse, ProductListItem } from "../../common/types/responses";
import type { FilterProductsDto } from "../products/dto/filter-products.dto";
import { CategoriesService } from "./categories.service";

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Public()
  @Get()
  tree(@Query("locale") locale?: string): Promise<CategoryResponse[]> {
    return this.categories.tree(locale ?? "ja");
  }

  @Public()
  @Get(":slug/products")
  products(@Param("slug") slug: string, @Query() query: FilterProductsDto): Promise<PaginatedResponse<ProductListItem>> {
    return this.categories.listProductsForSlug(slug, query);
  }

  @Public()
  @Get(":slug")
  bySlug(@Param("slug") slug: string, @Query("locale") locale?: string): Promise<CategoryResponse> {
    return this.categories.bySlug(slug, locale ?? "ja");
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateCategoryDto): Promise<CategoryResponse> {
    return this.categories.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCategoryDto): Promise<CategoryResponse> {
    return this.categories.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<DeleteResult> {
    return this.categories.remove(id);
  }
}
