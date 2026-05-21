import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BannersModule } from "./modules/banners/banners.module";
import { CardSetsModule } from "./modules/card-sets/card-sets.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { NewsModule } from "./modules/news/news.module";
import { PokemonModule } from "./modules/pokemon/pokemon.module";
import { ProductsModule } from "./modules/products/products.module";
import { RankingsModule } from "./modules/rankings/rankings.module";
import { SearchModule } from "./modules/search/search.module";
import { UsersModule } from "./modules/users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CardSetsModule,
    PokemonModule,
    BannersModule,
    NewsModule,
    RankingsModule,
    SearchModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
