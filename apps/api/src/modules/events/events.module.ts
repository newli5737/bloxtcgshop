import { Module } from "@nestjs/common";
import { MailModule } from "../mail/mail.module";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { EventDrawnListener } from "./listeners/event-drawn.listener";

@Module({
  imports: [MailModule],
  controllers: [EventsController],
  providers: [EventsService, EventDrawnListener],
})
export class EventsModule {}
