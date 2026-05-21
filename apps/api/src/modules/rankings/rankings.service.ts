import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type RankRow = {
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
};

@Injectable()
export class RankingsService {
  constructor(private readonly prisma: PrismaService) {}

  async top(type: "sales" | "views" | "wishlist", limit = 10, locale = "ja"): Promise<RankRow[]> {
    const take = Math.min(50, Math.max(1, limit));
    if (type === "wishlist") {
      const grouped = await this.prisma.wishlist.groupBy({
        by: ["productId"],
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take,
      });
      const ids = grouped.map((g) => g.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: ids } },
        include: {
          translations: { where: { locale } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      });
      const order = new Map(ids.map((id, i) => [id, i]));
      return products
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
        .map((p) => this.mapRow(p, locale));
    }
    const orderBy =
      type === "views" ? { viewCount: "desc" as const } : { salesCount: "desc" as const };
    const products = await this.prisma.product.findMany({
      orderBy,
      take,
      include: {
        translations: { where: { locale } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });
    return products.map((p) => this.mapRow(p, locale));
  }

  private mapRow(
    p: {
      slug: string;
      price: { toString(): string };
      salePrice: { toString(): string } | null;
      translations: Array<{ name: string }>;
      images: Array<{ url: string }>;
    },
    _locale: string,
  ): RankRow {
    return {
      slug: p.slug,
      name: p.translations[0]?.name ?? p.slug,
      price: Number(p.price),
      salePrice: p.salePrice != null ? Number(p.salePrice) : null,
      imageUrl: p.images[0]?.url ?? null,
    };
  }
}
