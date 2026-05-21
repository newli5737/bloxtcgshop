import { Module } from "@nestjs/common";
import { ProductsModule } from "../products/products.module";
import { CardSetsController } from "./card-sets.controller";
import { CardSetsService } from "./card-sets.service";

@Module({
  imports: [ProductsModule],
  controllers: [CardSetsController],
  providers: [CardSetsService],
})
export class CardSetsModule {}
