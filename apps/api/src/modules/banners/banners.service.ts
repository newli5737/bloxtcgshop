import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { BannerResponse, CreateBannerDto, UpdateBannerDto, DeleteResult } from "../../common/types/responses";

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async active(locale = "ja"): Promise<BannerResponse[]> {
    const now = new Date();
    const result = await this.prisma.banner.findMany({
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
    return result as BannerResponse[];
  }

  async listAll(locale = "ja"): Promise<BannerResponse[]> {
    const result = await this.prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: { where: { locale } } },
    });
    return result as BannerResponse[];
  }

  async create(dto: CreateBannerDto): Promise<BannerResponse> {
    const created = await this.prisma.banner.create({
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
    return created as BannerResponse;
  }

  async update(id: string, dto: UpdateBannerDto): Promise<BannerResponse> {
    const { translations, ...data } = dto;
    if (translations?.length) {
      for (const t of translations) {
        await this.prisma.bannerTranslation.upsert({
          where: { bannerId_locale: { bannerId: id, locale: t.locale } },
          create: { bannerId: id, locale: t.locale, title: t.title, altText: t.altText },
          update: { title: t.title, altText: t.altText },
        });
      }
    }
    const banner = await this.prisma.banner.update({
      where: { id },
      data,
      include: { translations: true },
    });
    return banner as BannerResponse;
  }

  async remove(id: string): Promise<DeleteResult> {
    try {
      await this.prisma.banner.delete({ where: { id } });
      return { id };
    } catch {
      throw new NotFoundException("Banner not found");
    }
  }
}
