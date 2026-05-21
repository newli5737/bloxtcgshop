import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { NewsResponse, CreateNewsDto, UpdateNewsDto, DeleteResult, PaginatedResponse } from "../../common/types/responses";

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(locale = "ja", page = 1, limit = 10): Promise<PaginatedResponse<NewsResponse>> {
    const skip = (page - 1) * limit;
    const where = { isPublished: true };
    const [total, rows] = await Promise.all([
      this.prisma.news.count({ where }),
      this.prisma.news.findMany({
        where, orderBy: { publishedAt: "desc" }, skip, take: limit,
        include: { translations: { where: { locale } } },
      }),
    ]);
    return { data: rows as NewsResponse[], meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  }

  async listAll(locale = "ja", page = 1, limit = 50): Promise<PaginatedResponse<NewsResponse>> {
    const skip = (page - 1) * limit;
    const [total, rows] = await Promise.all([
      this.prisma.news.count(),
      this.prisma.news.findMany({
        orderBy: { publishedAt: "desc" }, skip, take: limit,
        include: { translations: { where: { locale } } },
      }),
    ]);
    return { data: rows as NewsResponse[], meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  }

  async bySlug(slug: string, locale = "ja"): Promise<NewsResponse> {
    const item = await this.prisma.news.findFirst({
      where: { slug, isPublished: true },
      include: { translations: { where: { locale } } },
    });
    if (!item) throw new NotFoundException("News not found");
    return item as NewsResponse;
  }

  async create(dto: CreateNewsDto): Promise<NewsResponse> {
    const created = await this.prisma.news.create({
      data: {
        slug: dto.slug,
        isPublished: dto.isPublished ?? false,
        publishedAt: new Date(),
        translations: { create: dto.translations },
      },
      include: { translations: true },
    });
    return created as NewsResponse;
  }

  async update(id: string, dto: UpdateNewsDto): Promise<NewsResponse> {
    const { translations, ...data } = dto;
    const updateData: Record<string, boolean | string | Date> = {};
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.isPublished !== undefined) {
      updateData.isPublished = data.isPublished;
      if (data.isPublished) updateData.publishedAt = new Date();
    }
    if (translations?.length) {
      for (const t of translations) {
        await this.prisma.newsTranslation.upsert({
          where: { newsId_locale: { newsId: id, locale: t.locale } },
          create: { newsId: id, locale: t.locale, title: t.title, content: t.content },
          update: { title: t.title, content: t.content },
        });
      }
    }
    const news = await this.prisma.news.update({
      where: { id },
      data: updateData,
      include: { translations: true },
    });
    return news as NewsResponse;
  }

  async remove(id: string): Promise<DeleteResult> {
    try {
      await this.prisma.news.delete({ where: { id } });
      return { id };
    } catch {
      throw new NotFoundException("News not found");
    }
  }
}
