import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@pokemart/database";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
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

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Get("all")
  listAll(@Query("locale") locale?: string): Promise<unknown[]> {
    return this.banners.listAll(locale ?? "ja");
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: { imageUrl: string; linkUrl?: string; sortOrder?: number; isActive?: boolean; startsAt?: string; endsAt?: string; translations: Array<{ locale: string; title?: string; altText?: string }> }): Promise<unknown> {
    return this.banners.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: { imageUrl?: string; linkUrl?: string; sortOrder?: number; isActive?: boolean; translations?: Array<{ locale: string; title?: string; altText?: string }> }): Promise<unknown> {
    return this.banners.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<unknown> {
    return this.banners.remove(id);
  }
}
