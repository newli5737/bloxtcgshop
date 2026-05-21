import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { AdminController } from "./admin.controller";

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
