import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LogoutDto } from "./dto/logout.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterDto } from "./dto/register.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto): Promise<unknown> {
    return this.auth.register(dto);
  }

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto): Promise<unknown> {
    return this.auth.login(dto);
  }

  @Public()
  @Post("refresh")
  refresh(@Body() dto: RefreshDto): Promise<unknown> {
    return this.auth.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post("logout")
  logout(@CurrentUser() user: AuthUser, @Body() dto: LogoutDto): Promise<unknown> {
    return this.auth.logout(user.userId, dto.refreshToken);
  }

  @Public()
  @Post("forgot-password")
  forgotPassword(@Body() body: { email: string }): { data: { ok: true }; meta: null; error: null } {
    return { data: { ok: true }, meta: null, error: null };
  }

  @Public()
  @Post("reset-password")
  resetPassword(@Body() _body: { token: string; password: string }): { data: { ok: true }; meta: null; error: null } {
    return { data: { ok: true }, meta: null, error: null };
  }
}
