import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { CardRarity, ProductStatus } from "@pokemart/database";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class FilterProductsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  setSlug?: string;

  @ApiPropertyOptional({ enum: CardRarity })
  @IsOptional()
  @IsEnum(CardRarity)
  rarity?: CardRarity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pokemonSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isNewArrival?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular" | "name_asc";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 24;
}

class ProductTranslationInput {
  @IsString()
  locale!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateProductDto {
  @IsString()
  slug!: string;

  @IsString()
  sku!: string;

  @Type(() => Number)
  price!: number;

  @IsOptional()
  @Type(() => Number)
  salePrice?: number;

  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  cardSetId?: string;

  @IsOptional()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  isNewArrival?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationInput)
  translations!: ProductTranslationInput[];

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  salePrice?: number;

  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  cardSetId?: string;

  @IsOptional()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  isNewArrival?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationInput)
  translations?: ProductTranslationInput[];
}
