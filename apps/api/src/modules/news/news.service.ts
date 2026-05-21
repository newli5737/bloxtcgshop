import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(locale = "ja", page = 1, limit = 10): Promise<{ data: unknown[]; meta: Record<string, number> }> {
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

  async listAll(locale = "ja", page = 1, limit = 50): Promise<{ data: unknown[]; meta: Record<string, number> }> {
    const skip = (page - 1) * limit;
    const [total, rows] = await Promise.all([
      this.prisma.news.count(),
      this.prisma.news.findMany({
        orderBy: { createdAt: "desc" },
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

  async bySlug(slug: string, locale = "ja"): Promise<unknown> {
    const item = await this.prisma.news.findFirst({
      where: { slug, isPublished: true },
      include: { translations: { where: { locale } } },
    });
    if (!item) throw new NotFoundException("News not found");
    return item;
  }

  async create(dto: { slug: string; isPublished?: boolean; translations: Array<{ locale: string; title: string; content?: string }> }): Promise<unknown> {
    return this.prisma.news.create({
      data: {
        slug: dto.slug,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
        translations: { create: dto.translations },
      },
      include: { translations: true },
    });
  }

  async update(id: string, dto: { slug?: string; isPublished?: boolean; translations?: Array<{ locale: string; title: string; content?: string }> }): Promise<unknown> {
    const { translations, ...data } = dto;
    if (data.isPublished === true) {
      (data as Record<string, unknown>).publishedAt = new Date();
    }
    const news = await this.prisma.news.update({
      where: { id },
      data,
    });
    if (translations?.length) {
      for (const t of translations) {
        await this.prisma.newsTranslation.upsert({
          where: { newsId_locale: { newsId: id, locale: t.locale } },
          create: { newsId: id, locale: t.locale, title: t.title, content: t.content },
          update: { title: t.title, content: t.content },
        });
      }
    }
    return news;
  }

  async remove(id: string): Promise<{ id: string }> {
    try {
      await this.prisma.news.delete({ where: { id } });
      return { id };
    } catch {
      throw new NotFoundException("News not found");
    }
  }
}
