import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";

interface CaptchaEntry {
  answer: number;
  expiresAt: number;
}

@Injectable()
export class CaptchaService {
  private readonly store = new Map<string, CaptchaEntry>();
  private readonly TTL_MS = 5 * 60 * 1000;
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000;

  constructor() {
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  generate(): { captchaId: string; svg: string } {
    this.cleanup();

    const type = Math.floor(Math.random() * 4);
    let question: string;
    let answer: number;

    switch (type) {
      case 0: {
        const a = this.rand(5, 19);
        const b = this.rand(3, 12);
        const c = this.rand(1, 30);
        answer = a * b + c;
        question = `${a} x ${b} + ${c} = ?`;
        break;
      }
      case 1: {
        const a = this.rand(6, 15);
        const b = this.rand(4, 13);
        const c = this.rand(1, 20);
        answer = a * b - c;
        question = `${a} x ${b} - ${c} = ?`;
        break;
      }
      case 2: {
        const a = this.rand(10, 99);
        const b = this.rand(10, 99);
        const c = this.rand(1, 50);
        answer = a + b + c;
        question = `${a} + ${b} + ${c} = ?`;
        break;
      }
      default: {
        const a = this.rand(7, 25);
        const b = this.rand(3, 15);
        answer = a * b;
        question = `${a} x ${b} = ?`;
        break;
      }
    }

    const captchaId = randomBytes(16).toString("hex");
    this.store.set(captchaId, {
      answer,
      expiresAt: Date.now() + this.TTL_MS,
    });

    const svg = this.renderSvg(question);
    return { captchaId, svg };
  }

  verify(captchaId: string, userAnswer: number): boolean {
    const entry = this.store.get(captchaId);
    if (!entry) return false;
    this.store.delete(captchaId);
    if (Date.now() > entry.expiresAt) return false;
    return entry.answer === userAnswer;
  }

  private renderSvg(text: string): string {
    const width = 280;
    const height = 70;
    const chars = text.split("");

    // Background noise lines
    const noiseLines: string[] = [];
    for (let i = 0; i < 6; i++) {
      const x1 = this.rand(0, width);
      const y1 = this.rand(0, height);
      const x2 = this.rand(0, width);
      const y2 = this.rand(0, height);
      const colors = ["#334155", "#475569", "#1e293b", "#3b4c63", "#2a3a50"];
      const color = colors[this.rand(0, colors.length - 1)];
      const sw = this.rand(1, 2);
      noiseLines.push(
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" opacity="${(this.rand(40, 80) / 100).toFixed(2)}"/>`,
      );
    }

    // Noise dots
    const noiseDots: string[] = [];
    for (let i = 0; i < 30; i++) {
      const cx = this.rand(0, width);
      const cy = this.rand(0, height);
      const r = this.rand(1, 3);
      const colors = ["#475569", "#64748b", "#334155"];
      const color = colors[this.rand(0, colors.length - 1)];
      noiseDots.push(
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${(this.rand(30, 70) / 100).toFixed(2)}"/>`,
      );
    }

    // Noise curves
    const noiseCurves: string[] = [];
    for (let i = 0; i < 3; i++) {
      const x1 = this.rand(0, width / 3);
      const y1 = this.rand(10, height - 10);
      const cx1 = this.rand(width / 4, (width * 3) / 4);
      const cy1 = this.rand(0, height);
      const cx2 = this.rand(width / 4, (width * 3) / 4);
      const cy2 = this.rand(0, height);
      const x2 = this.rand((width * 2) / 3, width);
      const y2 = this.rand(10, height - 10);
      const colors = ["#334155", "#1e293b", "#3b4c63"];
      const color = colors[this.rand(0, colors.length - 1)];
      noiseCurves.push(
        `<path d="M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}" stroke="${color}" stroke-width="${this.rand(1, 2)}" fill="none" opacity="${(this.rand(30, 60) / 100).toFixed(2)}"/>`,
      );
    }

    // Render each character with random transform
    const charElements: string[] = [];
    const startX = 18;
    const spacing = Math.min(22, (width - 36) / chars.length);

    for (let i = 0; i < chars.length; i++) {
      const x = startX + i * spacing;
      const y = this.rand(38, 50);
      const rotate = this.rand(-25, 25);
      const skewX = this.rand(-8, 8);
      const scale = (this.rand(85, 115) / 100).toFixed(2);
      const fontSize = this.rand(20, 28);
      const colors = ["#fbbf24", "#f59e0b", "#fcd34d", "#e2e8f0", "#d4a853", "#c9b458"];
      const color = colors[this.rand(0, colors.length - 1)];
      const fonts = ["monospace", "serif", "sans-serif", "Georgia", "Courier"];
      const font = fonts[this.rand(0, fonts.length - 1)];
      const charStr = chars[i] === "&" ? "&amp;" : chars[i] === "<" ? "&lt;" : chars[i] === ">" ? "&gt;" : chars[i];

      charElements.push(
        `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="${font}" font-weight="bold" fill="${color}" transform="rotate(${rotate},${x},${y}) skewX(${skewX}) scale(${scale})">${charStr}</text>`,
      );
    }

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `<rect width="${width}" height="${height}" fill="#0f1117" rx="12"/>`,
      ...noiseLines,
      ...noiseCurves,
      ...noiseDots,
      ...charElements,
      `</svg>`,
    ].join("");
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(id);
    }
  }

  private rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
