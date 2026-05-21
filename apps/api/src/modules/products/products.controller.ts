import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@pokemart/database";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import type { PaginatedResponse, ProductListItem, ProductDetail, DeleteResult } from "../../common/types/responses";
import type { CreateProductDto, FilterProductsDto, UpdateProductDto } from "./dto/filter-products.dto";
import { ProductsService } from "./products.service";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get()
  list(@Query() query: FilterProductsDto): Promise<PaginatedResponse<ProductListItem>> {
    return this.products.list(query);
  }

  @Public()
  @Get(":slug")
  detail(@Param("slug") slug: string, @Query("locale") locale?: string): Promise<ProductDetail> {
    return this.products.getBySlug(slug, locale ?? "ja");
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateProductDto): Promise<ProductListItem> {
    return this.products.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateProductDto): Promise<ProductListItem> {
    return this.products.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<DeleteResult> {
    return this.products.remove(id);
  }
}
