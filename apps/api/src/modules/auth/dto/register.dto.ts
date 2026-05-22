import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsString()
  captchaId!: string;

  @ApiProperty()
  @IsInt()
  captchaAnswer!: number;
}
