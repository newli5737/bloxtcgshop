import { Module } from "@nestjs/common";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { EventDrawnListener } from "./listeners/event-drawn.listener";

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventDrawnListener],
})
export class EventsModule {}
