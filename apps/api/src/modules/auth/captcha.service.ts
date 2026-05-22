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

  generate(): { captchaId: string; question: string } {
    this.cleanup();

    const type = Math.floor(Math.random() * 4);
    let question: string;
    let answer: number;

    switch (type) {
      case 0: {
        // (a × b) + c
        const a = this.rand(5, 19);
        const b = this.rand(3, 12);
        const c = this.rand(1, 30);
        answer = a * b + c;
        question = `(${a} × ${b}) + ${c} = ?`;
        break;
      }
      case 1: {
        // (a × b) - c
        const a = this.rand(6, 15);
        const b = this.rand(4, 13);
        const c = this.rand(1, 20);
        answer = a * b - c;
        question = `(${a} × ${b}) − ${c} = ?`;
        break;
      }
      case 2: {
        // a + b + c
        const a = this.rand(10, 99);
        const b = this.rand(10, 99);
        const c = this.rand(1, 50);
        answer = a + b + c;
        question = `${a} + ${b} + ${c} = ?`;
        break;
      }
      default: {
        // a × b
        const a = this.rand(7, 25);
        const b = this.rand(3, 15);
        answer = a * b;
        question = `${a} × ${b} = ?`;
        break;
      }
    }

    const captchaId = randomBytes(16).toString("hex");
    this.store.set(captchaId, {
      answer,
      expiresAt: Date.now() + this.TTL_MS,
    });

    return { captchaId, question };
  }

  verify(captchaId: string, userAnswer: number): boolean {
    const entry = this.store.get(captchaId);
    if (!entry) return false;

    this.store.delete(captchaId);

    if (Date.now() > entry.expiresAt) return false;
    return entry.answer === userAnswer;
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
