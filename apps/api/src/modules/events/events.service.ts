import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { EventStatus } from "@pokemart/database";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateEventDto } from "./dto/create-event.dto";
import type { UpdateEventDto } from "./dto/update-event.dto";

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(): Promise<unknown[]> {
    return this.prisma.event.findMany({
      where: { status: { not: EventStatus.CANCELLED } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { registrations: true } } },
    });
  }

  async getBySlug(slug: string): Promise<unknown> {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: { _count: { select: { registrations: true } } },
    });
    if (!event) throw new NotFoundException("Event not found");
    return event;
  }

  async create(dto: CreateEventDto): Promise<unknown> {
    return this.prisma.event.create({
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
  }

  async update(id: string, dto: UpdateEventDto): Promise<unknown> {
    try {
      return await this.prisma.event.update({
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
    } catch {
      throw new NotFoundException("Event not found");
    }
  }

  async remove(id: string): Promise<{ id: string }> {
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

    // Check if already registered
    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (existing) throw new ConflictException("Already registered for this event");

    // Check capacity
    const count = await this.prisma.eventRegistration.count({ where: { eventId } });
    if (count >= event.maxParticipants) {
      throw new BadRequestException("Event is full");
    }

    // Generate unique lucky number
    const existingNumbers = await this.prisma.eventRegistration.findMany({
      where: { eventId },
      select: { luckyNumber: true },
    });
    const taken = new Set(existingNumbers.map((r) => r.luckyNumber));
    let luckyNumber: number;
    do {
      luckyNumber = Math.floor(Math.random() * event.maxParticipants) + 1;
    } while (taken.has(luckyNumber));

    const registration = await this.prisma.eventRegistration.create({
      data: { eventId, userId, luckyNumber },
    });

    this.eventEmitter.emit("event.registered", {
      eventId,
      userId,
      luckyNumber: registration.luckyNumber,
    });

    return { luckyNumber: registration.luckyNumber };
  }

  async getMyRegistration(eventId: string, userId: string): Promise<unknown> {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!reg) throw new NotFoundException("Not registered for this event");
    return reg;
  }

  async getRegistrations(eventId: string): Promise<unknown[]> {
    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async draw(eventId: string): Promise<{ winningNumber: number; winner: unknown }> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: true },
    });
    if (!event) throw new NotFoundException("Event not found");
    if (event.status === EventStatus.DRAWN) {
      throw new BadRequestException("Event already drawn");
    }
    if (event.registrations.length === 0) {
      throw new BadRequestException("No registrations yet");
    }

    // Pick random winner
    const randomIndex = Math.floor(Math.random() * event.registrations.length);
    const winnerReg = event.registrations[randomIndex];
    const winningNumber = winnerReg.luckyNumber;

    // Update event & mark winner
    await this.prisma.$transaction([
      this.prisma.event.update({
        where: { id: eventId },
        data: { status: EventStatus.DRAWN, winningNumber, drawnAt: new Date() },
      }),
      this.prisma.eventRegistration.update({
        where: { id: winnerReg.id },
        data: { isWinner: true },
      }),
    ]);

    const winner = await this.prisma.user.findUnique({
      where: { id: winnerReg.userId },
      select: { id: true, email: true, name: true },
    });

    this.eventEmitter.emit("event.drawn", {
      eventId,
      eventTitle: event.title,
      prizeDescription: event.prizeDescription,
      winningNumber,
      winnerEmail: winner?.email,
      winnerName: winner?.name,
    });

    return { winningNumber, winner };
  }
}
