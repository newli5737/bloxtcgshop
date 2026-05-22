import { BadRequestException, Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response, Request } from "express";
import { ConfigService } from "@nestjs/config";
import { Role } from "@pokemart/database";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService, type TokenPair } from "./auth.service";
import { CaptchaService } from "./captcha.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly captcha: CaptchaService,
  ) {}

  @Public()
  @Get("captcha")
  getCaptcha(): { captchaId: string; question: string } {
    return this.captcha.generate();
  }

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto): Promise<{ user: { id: string; email: string; name: string | null; role: Role } }> {
    const valid = this.captcha.verify(dto.captchaId, dto.captchaAnswer);
    if (!valid) {
      throw new BadRequestException("CAPTCHA không đúng hoặc đã hết hạn. Vui lòng thử lại.");
    }
    return this.auth.register(dto);
  }

  @Public()
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: { id: string; email: string; name: string | null; role: Role; locale: string } }> {
    const { tokens, user } = await this.auth.login(dto);
    this.setTokenCookies(res, tokens);
    return { user };
  }

  @Public()
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true } | { data: null; meta: null; error: { code: string; message: string } }> {
    const refreshToken = (req as Request & { cookies?: Record<string, string> }).cookies?.refresh_token;
    if (!refreshToken) {
      res.status(401);
      return { data: null, meta: null, error: { code: "HTTP_401", message: "No refresh token" } };
    }
    const { tokens } = await this.auth.refresh(refreshToken);
    this.setTokenCookies(res, tokens);
    return { ok: true };
  }

  @ApiBearerAuth()
  @Post("logout")
  async logout(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const refreshToken = (req as Request & { cookies?: Record<string, string> }).cookies?.refresh_token;
    await this.auth.logout(user.userId, refreshToken);
    this.clearTokenCookies(res);
    return { ok: true };
  }

  @Public()
  @Post("forgot-password")
  forgotPassword(@Body() _body: { email: string }): { data: { ok: true }; meta: null; error: null } {
    return { data: { ok: true }, meta: null, error: null };
  }

  @Public()
  @Post("reset-password")
  resetPassword(@Body() _body: { token: string; password: string }): { data: { ok: true }; meta: null; error: null } {
    return { data: { ok: true }, meta: null, error: null };
  }

  private setTokenCookies(res: Response, tokens: TokenPair): void {
    const isProduction = this.config.get<string>("NODE_ENV") === "production";
    const domain = this.config.get<string>("COOKIE_DOMAIN") || undefined;

    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: tokens.accessMaxAge,
      domain,
    });
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/v1/auth",
      maxAge: tokens.refreshMaxAge,
      domain,
    });
  }

  private clearTokenCookies(res: Response): void {
    const isProduction = this.config.get<string>("NODE_ENV") === "production";
    const domain = this.config.get<string>("COOKIE_DOMAIN") || undefined;

    res.clearCookie("access_token", { httpOnly: true, secure: isProduction, sameSite: "lax", path: "/", domain });
    res.clearCookie("refresh_token", { httpOnly: true, secure: isProduction, sameSite: "lax", path: "/v1/auth", domain });
  }
}
