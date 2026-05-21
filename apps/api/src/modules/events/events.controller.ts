import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@pokemart/database";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import type { EventResponse, EventRegistrationResponse, DeleteResult } from "../../common/types/responses";
import type { DrawResult } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { EventsService } from "./events.service";

@ApiTags("events")
@Controller("events")
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Public()
  @Get()
  list(): Promise<EventResponse[]> {
    return this.events.list();
  }

  @Public()
  @Get(":slug")
  getBySlug(@Param("slug") slug: string): Promise<EventResponse> {
    return this.events.getBySlug(slug);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateEventDto): Promise<EventResponse> {
    return this.events.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateEventDto): Promise<EventResponse> {
    return this.events.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<DeleteResult> {
    return this.events.remove(id);
  }

  @ApiBearerAuth()
  @Post(":id/register")
  register(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ luckyNumber: number }> {
    return this.events.register(id, user.userId);
  }

  @ApiBearerAuth()
  @Get(":id/my-registration")
  myRegistration(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<EventRegistrationResponse> {
    return this.events.getMyRegistration(id, user.userId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Get(":id/registrations")
  registrations(@Param("id") id: string): Promise<EventRegistrationResponse[]> {
    return this.events.getRegistrations(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post(":id/draw")
  draw(
    @Param("id") id: string,
    @Body() body: { winningNumbers: number[]; emailLang?: "ja" | "en" },
  ): Promise<DrawResult> {
    return this.events.draw(id, body.winningNumbers, body.emailLang ?? "ja");
  }
}
