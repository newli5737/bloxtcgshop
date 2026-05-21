import { Controller, Get, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { Role } from "@pokemart/database";
import { Roles } from "../../common/decorators/roles.decorator";
import { PrismaService } from "../../prisma/prisma.service";
import type { AdminStats, UploadResult } from "../../common/types/responses";
import * as fs from "fs";
import * as path from "path";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags("admin")
@ApiBearerAuth()
@Controller("admin")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Roles(Role.ADMIN)
  @Get("stats")
  async stats(): Promise<AdminStats> {
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
    const [totalProducts, totalCategories, outOfStock, newThisWeek] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.category.count(),
      this.prisma.product.count({ where: { stock: 0 } }),
      this.prisma.product.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    ]);
    return { totalProducts, totalCategories, outOfStock, newThisWeek };
  }

  @Roles(Role.ADMIN)
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(@UploadedFile() file: MulterFile): Promise<UploadResult> {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    const baseUrl = process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3041}`;
    return { url: `${baseUrl}/uploads/${filename}` };
  }
}
