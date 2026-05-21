import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>("MAIL_HOST");
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get<string>("MAIL_PORT") ?? "587"),
        secure: this.config.get<string>("MAIL_SECURE") === "true",
        auth: {
          user: this.config.get<string>("MAIL_USER"),
          pass: this.config.get<string>("MAIL_PASS"),
        },
      });
      this.logger.log(`Mail transporter configured: ${host}`);
    } else {
      this.logger.warn("MAIL_HOST not set — email sending disabled");
    }
  }

  private get from(): string {
    return this.config.get<string>("MAIL_FROM") ?? "noreply@bloxtcgshop.com";
  }

  async sendWinnerNotification(
    email: string,
    eventTitle: string,
    luckyNumber: number,
    prizeDescription: string | null,
    lang: "ja" | "en" = "ja",
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`SMTP not configured. Skipping email to ${email}`);
      return;
    }

    const html = lang === "ja"
      ? this.buildJapaneseTemplate(eventTitle, luckyNumber, prizeDescription)
      : this.buildEnglishTemplate(eventTitle, luckyNumber, prizeDescription);

    const subject = lang === "ja"
      ? `🎉 おめでとう！「${eventTitle}」で当選しました！`
      : `🎉 Congratulations! You won in "${eventTitle}"!`;

    try {
      await this.transporter.sendMail({ from: this.from, to: email, subject, html });
      this.logger.log(`Winner notification sent to ${email} (${lang})`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${email}`, err);
    }
  }

  private buildJapaneseTemplate(eventTitle: string, luckyNumber: number, prize: string | null): string {
    return `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0f1117;color:#e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0e7490,#0891b2);padding:32px 24px;text-align:center;">
          <h1 style="margin:0;font-size:28px;color:#fff;">🎉 当選おめでとうございます！</h1>
        </div>
        <div style="padding:32px 24px;">
          <p style="font-size:16px;line-height:1.6;">
            イベント <strong style="color:#22d3ee;">${eventTitle}</strong> にて、<br/>
            あなたの番号 <span style="font-size:32px;font-weight:bold;color:#f59e0b;">#${luckyNumber}</span> が当選しました！
          </p>
          ${prize ? `
          <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:16px;margin:20px 0;">
            <h3 style="margin:0 0 8px;color:#f59e0b;">🎁 賞品</h3>
            <p style="margin:0;color:#cbd5e1;">${prize}</p>
          </div>` : ""}
          <p style="color:#94a3b8;">詳細につきましては、BloxTCGShopをご確認ください。</p>
          <a href="https://bloxtcgshop.com/ja/events" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0891b2;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">イベントページへ</a>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #1e293b;text-align:center;">
          <p style="margin:0;color:#475569;font-size:12px;">BloxTCGShop — Premium TCG Marketplace</p>
        </div>
      </div>
    `;
  }

  private buildEnglishTemplate(eventTitle: string, luckyNumber: number, prize: string | null): string {
    return `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0f1117;color:#e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0e7490,#0891b2);padding:32px 24px;text-align:center;">
          <h1 style="margin:0;font-size:28px;color:#fff;">🎉 Congratulations!</h1>
        </div>
        <div style="padding:32px 24px;">
          <p style="font-size:16px;line-height:1.6;">
            Your lucky number <span style="font-size:32px;font-weight:bold;color:#f59e0b;">#${luckyNumber}</span><br/>
            has won in the event <strong style="color:#22d3ee;">${eventTitle}</strong>!
          </p>
          ${prize ? `
          <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:16px;margin:20px 0;">
            <h3 style="margin:0 0 8px;color:#f59e0b;">🎁 Prize</h3>
            <p style="margin:0;color:#cbd5e1;">${prize}</p>
          </div>` : ""}
          <p style="color:#94a3b8;">Please visit BloxTCGShop for more details.</p>
          <a href="https://bloxtcgshop.com/en/events" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0891b2;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">View Events</a>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #1e293b;text-align:center;">
          <p style="margin:0;color:#475569;font-size:12px;">BloxTCGShop — Premium TCG Marketplace</p>
        </div>
      </div>
    `;
  }
}
