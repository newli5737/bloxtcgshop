import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  slug!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prizeDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(10000)
  maxParticipants?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  drawDate?: string;
}
