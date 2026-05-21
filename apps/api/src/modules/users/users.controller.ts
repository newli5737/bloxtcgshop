import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@pokemart/database";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import type { UserProfile, WishlistProduct, WishlistEntry } from "../../common/types/responses";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService, type AdminUser } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // ─── Current user ───

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

  // ─── Admin ───

  @Roles(Role.ADMIN)
  @Get("admin/all")
  listAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ): Promise<{ data: AdminUser[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    return this.users.listAll(Number(page ?? 1) || 1, Number(limit ?? 50) || 50);
  }

  @Roles(Role.ADMIN)
  @Patch(":id/role")
  updateRole(@Param("id") id: string, @Body() body: { role: Role }): Promise<AdminUser> {
    return this.users.updateRole(id, body.role);
  }

  @Roles(Role.ADMIN)
  @Delete(":id")
  deleteUser(@Param("id") id: string): Promise<{ id: string }> {
    return this.users.deleteUser(id);
  }
}
