import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { EventStatus } from "@pokemart/database";
import { PrismaService } from "../../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import type { EventResponse, EventRegistrationResponse, DeleteResult } from "../../common/types/responses";
import type { CreateEventDto } from "./dto/create-event.dto";
import type { UpdateEventDto } from "./dto/update-event.dto";

export interface DrawResult {
  winningNumbers: number[];
  winners: Array<{ luckyNumber: number; email: string; name: string | null }>;
  emailsSent: number;
}

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly mail: MailService,
  ) {}

  async list(): Promise<EventResponse[]> {
    const result = await this.prisma.event.findMany({
      where: { status: { not: EventStatus.CANCELLED } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { registrations: true } } },
    });
    return result as EventResponse[];
  }

  async getBySlug(slug: string): Promise<EventResponse> {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: { _count: { select: { registrations: true } } },
    });
    if (!event) throw new NotFoundException("Event not found");
    return event as EventResponse;
  }

  async create(dto: CreateEventDto): Promise<EventResponse> {
    const created = await this.prisma.event.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        description: dto.description,
        prizeDescription: dto.prizeDescription,
        imageUrl: dto.imageUrl,
        maxParticipants: dto.maxParticipants ?? 100,
        drawDate: dto.drawDate ? new Date(dto.drawDate) : null,
      },
    });
    return created as EventResponse;
  }

  async update(id: string, dto: UpdateEventDto): Promise<EventResponse> {
    const exists = await this.prisma.event.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Event not found");
    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        prizeDescription: dto.prizeDescription,
        imageUrl: dto.imageUrl,
        status: dto.status,
        maxParticipants: dto.maxParticipants,
        drawDate: dto.drawDate ? new Date(dto.drawDate) : undefined,
      },
    });
    return updated as EventResponse;
  }

  async remove(id: string): Promise<DeleteResult> {
    try {
      await this.prisma.event.delete({ where: { id } });
      return { id };
    } catch {
      throw new NotFoundException("Event not found");
    }
  }

  async register(eventId: string, userId: string): Promise<{ luckyNumber: number }> {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException("Event not found");
    if (event.status !== EventStatus.OPEN) {
      throw new BadRequestException("Event is not open for registration");
    }

    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (existing) throw new ConflictException("Already registered for this event");

    const count = await this.prisma.eventRegistration.count({ where: { eventId } });
    if (count >= event.maxParticipants) {
      throw new BadRequestException("Event is full");
    }

    const existingNumbers = await this.prisma.eventRegistration.findMany({
      where: { eventId },
      select: { luckyNumber: true },
    });
    const taken = new Set(existingNumbers.map((r) => r.luckyNumber));
    let luckyNumber: number;
    do {
      luckyNumber = Math.floor(Math.random() * event.maxParticipants) + 1;
    } while (taken.has(luckyNumber));

    await this.prisma.eventRegistration.create({
      data: { eventId, userId, luckyNumber },
    });

    return { luckyNumber };
  }

  async getMyRegistration(eventId: string, userId: string): Promise<EventRegistrationResponse> {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!reg) throw new NotFoundException("Not registered for this event");
    return reg as EventRegistrationResponse;
  }

  async getRegistrations(eventId: string): Promise<EventRegistrationResponse[]> {
    const result = await this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { luckyNumber: "asc" },
    });
    return result as EventRegistrationResponse[];
  }

  async draw(eventId: string, winnerCount: number, emailLang: "ja" | "en" = "ja"): Promise<DrawResult> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: { include: { user: { select: { email: true, name: true } } } } },
    });
    if (!event) throw new NotFoundException("Event not found");
    if (event.registrations.length === 0) {
      throw new BadRequestException("No registrations yet");
    }
    if (winnerCount < 1) {
      throw new BadRequestException("Winner count must be at least 1");
    }
    if (winnerCount > event.registrations.length) {
      throw new BadRequestException(`Only ${event.registrations.length} registrations, cannot pick ${winnerCount} winners`);
    }

    // Shuffle and pick random winners from existing registrations
    const shuffled = [...event.registrations].sort(() => Math.random() - 0.5);
    const winnerRegs = shuffled.slice(0, winnerCount);
    const winningNumbers = winnerRegs.map((r) => r.luckyNumber);

    // Mark winners + update event status
    await this.prisma.$transaction([
      ...winnerRegs.map((r) =>
        this.prisma.eventRegistration.update({
          where: { id: r.id },
          data: { isWinner: true },
        }),
      ),
      this.prisma.event.update({
        where: { id: eventId },
        data: { status: EventStatus.DRAWN, winningNumber: winningNumbers[0], drawnAt: new Date() },
      }),
    ]);

    // Send emails to all winners
    const winners: DrawResult["winners"] = [];
    let emailsSent = 0;
    for (const reg of winnerRegs) {
      const user = reg.user as { email: string; name: string | null };
      winners.push({ luckyNumber: reg.luckyNumber, email: user.email, name: user.name });
      try {
        await this.mail.sendWinnerNotification(
          user.email,
          event.title,
          reg.luckyNumber,
          event.prizeDescription,
          emailLang,
        );
        emailsSent++;
      } catch { /* email send failure should not block draw */ }
    }

    this.eventEmitter.emit("event.drawn", {
      eventId,
      eventTitle: event.title,
      winningNumbers,
      winnersCount: winners.length,
    });

    return { winningNumbers, winners, emailsSent };
  }
}
