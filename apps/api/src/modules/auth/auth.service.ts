import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { Role } from "@pokemart/database";
import { PrismaService } from "../../prisma/prisma.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: { id: string; email: string; name: string | null; role: Role } }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        passwordHash,
        role: Role.USER,
      },
    });
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: { id: string; email: string; name: string | null; role: Role; locale: string };
  }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const refreshToken = randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_MS);
    await this.prisma.session.create({
      data: { userId: user.id, refreshToken, expiresAt },
    });
    const accessToken = await this.signAccess(user);
    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.get<string>("JWT_EXPIRES_IN") ?? "15m",
      user: { id: user.id, email: user.email, name: user.name, role: user.role, locale: user.locale },
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> {
    const session = await this.prisma.session.findUnique({ where: { refreshToken } });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const accessToken = await this.signAccess(user);
    return { accessToken, expiresIn: this.config.get<string>("JWT_EXPIRES_IN") ?? "15m" };
  }

  async logout(userId: string, refreshToken: string): Promise<{ ok: true }> {
    await this.prisma.session.deleteMany({
      where: { userId, refreshToken },
    });
    return { ok: true };
  }

  private async signAccess(user: { id: string; email: string; role: Role }): Promise<string> {
    return this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.config.getOrThrow<string>("JWT_SECRET"),
        expiresIn: this.config.get<string>("JWT_EXPIRES_IN") ?? "15m",
      },
    );
  }
}
