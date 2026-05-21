import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>("SMTP_HOST");
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get<string>("SMTP_PORT") ?? "587"),
        secure: false,
        auth: {
          user: this.config.get<string>("SMTP_USER"),
          pass: this.config.get<string>("SMTP_PASS"),
        },
      });
    }
  }

  async sendWinnerNotification(
    email: string,
    eventTitle: string,
    luckyNumber: number,
    prizeDescription: string | null,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`SMTP not configured. Skipping email to ${email} for event "${eventTitle}"`);
      return;
    }
    const from = this.config.get<string>("SMTP_FROM") ?? "noreply@bloxtcgshop.com";
    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: `🎉 おめでとう！${eventTitle} で当選しました！`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h1 style="color:#06b6d4;">🎉 当選おめでとうございます！</h1>
            <p>あなたの番号 <strong style="font-size:24px;color:#f59e0b;">#${luckyNumber}</strong> が <strong>${eventTitle}</strong> で当選しました！</p>
            ${prizeDescription ? `<div style="background:#f0f9ff;padding:16px;border-radius:8px;margin:16px 0;"><h3>🎁 賞品</h3><p>${prizeDescription}</p></div>` : ""}
            <p>詳細についてはBloxTCGShopをご確認ください。</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
            <p style="color:#94a3b8;font-size:12px;">BloxTCGShop — Premium TCG Marketplace</p>
          </div>
        `,
      });
      this.logger.log(`Winner notification sent to ${email}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${email}`, err);
    }
  }
}
