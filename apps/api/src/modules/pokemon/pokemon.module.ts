import { Module } from "@nestjs/common";
import { ProductsModule } from "../products/products.module";
import { PokemonController } from "./pokemon.controller";
import { PokemonService } from "./pokemon.service";

@Module({
  imports: [ProductsModule],
  controllers: [PokemonController],
  providers: [PokemonService],
})
export class PokemonModule {}
