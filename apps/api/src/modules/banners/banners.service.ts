import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async active(locale = "ja"): Promise<unknown[]> {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: { sortOrder: "asc" },
      include: { translations: { where: { locale } } },
    });
  }

  async listAll(locale = "ja"): Promise<unknown[]> {
    return this.prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: { where: { locale } } },
    });
  }

  async create(dto: { imageUrl: string; linkUrl?: string; sortOrder?: number; isActive?: boolean; startsAt?: string; endsAt?: string; translations: Array<{ locale: string; title?: string; altText?: string }> }): Promise<unknown> {
    return this.prisma.banner.create({
      data: {
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        translations: { create: dto.translations },
      },
      include: { translations: true },
    });
  }

  async update(id: string, dto: { imageUrl?: string; linkUrl?: string; sortOrder?: number; isActive?: boolean; translations?: Array<{ locale: string; title?: string; altText?: string }> }): Promise<unknown> {
    const { translations, ...data } = dto;
    const banner = await this.prisma.banner.update({
      where: { id },
      data,
    });
    if (translations?.length) {
      for (const t of translations) {
        await this.prisma.bannerTranslation.upsert({
          where: { bannerId_locale: { bannerId: id, locale: t.locale } },
          create: { bannerId: id, locale: t.locale, title: t.title, altText: t.altText },
          update: { title: t.title, altText: t.altText },
        });
      }
    }
    return banner;
  }

  async remove(id: string): Promise<{ id: string }> {
    try {
      await this.prisma.banner.delete({ where: { id } });
      return { id };
    } catch {
      throw new NotFoundException("Banner not found");
    }
  }
}
