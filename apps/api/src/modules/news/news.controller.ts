import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
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
  ): Promise<unknown> {
    return this.news.list(locale ?? "ja", Number(page ?? 1) || 1, Number(limit ?? 10) || 10);
  }

  @Public()
  @Get(":slug")
  bySlug(@Param("slug") slug: string, @Query("locale") locale?: string): Promise<unknown> {
    return this.news.bySlug(slug, locale ?? "ja");
  }
}
