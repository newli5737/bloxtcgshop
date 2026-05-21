import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: AuthUser): Promise<unknown> {
    return this.users.me(user.userId);
  }

  @Patch("me")
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto): Promise<unknown> {
    return this.users.updateMe(user.userId, dto);
  }

  @Get("me/wishlist")
  wishlist(@CurrentUser() user: AuthUser, @Query("locale") locale?: string): Promise<unknown[]> {
    return this.users.wishlist(user.userId, locale ?? "ja");
  }

  @Post("me/wishlist/:productId")
  addWishlist(@CurrentUser() user: AuthUser, @Param("productId") productId: string): Promise<unknown> {
    return this.users.addWishlist(user.userId, productId);
  }

  @Delete("me/wishlist/:productId")
  removeWishlist(@CurrentUser() user: AuthUser, @Param("productId") productId: string): Promise<unknown> {
    return this.users.removeWishlist(user.userId, productId);
  }
}
