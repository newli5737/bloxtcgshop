import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { BannersService } from "./banners.service";

@ApiTags("banners")
@Controller("banners")
export class BannersController {
  constructor(private readonly banners: BannersService) {}

  @Public()
  @Get()
  list(@Query("locale") locale?: string): Promise<unknown[]> {
    return this.banners.active(locale ?? "ja");
  }
}
