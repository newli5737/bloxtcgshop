import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@pokemart/database";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import type { NewsResponse, CreateNewsDto, UpdateNewsDto, DeleteResult, PaginatedResponse } from "../../common/types/responses";
import { NewsService } from "./news.service";

@ApiTags("news")
@Controller("news")
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Public()
  @Get()
  list(
    @Query("locale") locale?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ): Promise<PaginatedResponse<NewsResponse>> {
    return this.news.list(locale ?? "ja", Number(page ?? 1) || 1, Number(limit ?? 10) || 10);
  }

  @Public()
  @Get(":slug")
  bySlug(@Param("slug") slug: string, @Query("locale") locale?: string): Promise<NewsResponse> {
    return this.news.bySlug(slug, locale ?? "ja");
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Get("admin/all")
  listAll(
    @Query("locale") locale?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ): Promise<PaginatedResponse<NewsResponse>> {
    return this.news.listAll(locale ?? "vi", Number(page ?? 1) || 1, Number(limit ?? 50) || 50);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateNewsDto): Promise<NewsResponse> {
    return this.news.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateNewsDto): Promise<NewsResponse> {
    return this.news.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<DeleteResult> {
    return this.news.remove(id);
  }
}
