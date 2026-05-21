import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(locale = "en", page = 1, limit = 10): Promise<{ data: unknown[]; meta: Record<string, number> }> {
    const skip = (page - 1) * limit;
    const where = { isPublished: true };
    const [total, rows] = await Promise.all([
      this.prisma.news.count({ where }),
      this.prisma.news.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        include: { translations: { where: { locale } } },
      }),
    ]);
    return {
      data: rows,
      meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async bySlug(slug: string, locale = "en"): Promise<unknown> {
    const item = await this.prisma.news.findFirst({
      where: { slug, isPublished: true },
      include: { translations: { where: { locale } } },
    });
    if (!item) {
      throw new NotFoundException("News not found");
    }
    return item;
  }
}
