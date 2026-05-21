import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { UserProfile, WishlistProduct, WishlistEntry } from "../../common/types/responses";
import type { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, locale: true, createdAt: true },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async updateMe(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, avatarUrl: dto.avatarUrl, locale: dto.locale },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, locale: true },
    });
  }

  async wishlist(userId: string, locale = "ja"): Promise<WishlistProduct[]> {
    const rows = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            translations: { where: { locale } },
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((w) => w.product) as WishlistProduct[];
  }

  async addWishlist(userId: string, productId: string): Promise<WishlistEntry> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException("Product not found");
    try {
      return await this.prisma.wishlist.create({ data: { userId, productId } });
    } catch {
      throw new ConflictException("Already in wishlist");
    }
  }

  async removeWishlist(userId: string, productId: string): Promise<{ ok: true }> {
    await this.prisma.wishlist.deleteMany({ where: { userId, productId } });
    return { ok: true };
  }
}
