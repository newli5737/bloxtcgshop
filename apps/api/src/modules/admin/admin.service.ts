import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(): Promise<Record<string, number>> {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const [totalProducts, totalCategories, outOfStock, newThisWeek] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.category.count(),
      this.prisma.product.count({ where: { OR: [{ stock: 0 }, { status: "OUT_OF_STOCK" }] } }),
      this.prisma.product.count({ where: { createdAt: { gte: weekAgo } } }),
    ]);
    return { totalProducts, totalCategories, outOfStock, newThisWeek };
  }
}
