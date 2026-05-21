import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { RankingsService } from "./rankings.service";

@ApiTags("rankings")
@Controller("rankings")
export class RankingsController {
  constructor(private readonly rankings: RankingsService) {}

  @Public()
  @Get()
  list(
    @Query("type") type: "sales" | "views" | "wishlist" = "sales",
    @Query("limit") limit?: string,
    @Query("locale") locale?: string,
  ): Promise<unknown[]> {
    const lim = Number(limit ?? 10) || 10;
    return this.rankings.top(type, lim, locale ?? "ja");
  }
}
