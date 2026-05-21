import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import type { UserProfile, WishlistProduct, WishlistEntry } from "../../common/types/responses";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: AuthUser): Promise<UserProfile> {
    return this.users.me(user.userId);
  }

  @Patch("me")
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto): Promise<UserProfile> {
    return this.users.updateMe(user.userId, dto);
  }

  @Get("me/wishlist")
  wishlist(@CurrentUser() user: AuthUser, @Query("locale") locale?: string): Promise<WishlistProduct[]> {
    return this.users.wishlist(user.userId, locale ?? "ja");
  }

  @Post("me/wishlist/:productId")
  addWishlist(@CurrentUser() user: AuthUser, @Param("productId") productId: string): Promise<WishlistEntry> {
    return this.users.addWishlist(user.userId, productId);
  }

  @Delete("me/wishlist/:productId")
  removeWishlist(@CurrentUser() user: AuthUser, @Param("productId") productId: string): Promise<{ ok: true }> {
    return this.users.removeWishlist(user.userId, productId);
  }
}
