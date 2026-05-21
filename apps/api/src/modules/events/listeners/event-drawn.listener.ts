import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { MailService } from "../../mail/mail.service";

type EventDrawnPayload = {
  eventId: string;
  eventTitle: string;
  prizeDescription: string | null;
  winningNumber: number;
  winnerEmail: string | undefined;
  winnerName: string | null | undefined;
};

@Injectable()
export class EventDrawnListener {
  private readonly logger = new Logger(EventDrawnListener.name);

  constructor(private readonly mail: MailService) {}

  @OnEvent("event.drawn")
  async handleEventDrawn(payload: EventDrawnPayload): Promise<void> {
    this.logger.log(
      `Event "${payload.eventTitle}" drawn. Winning number: ${payload.winningNumber}. Winner: ${payload.winnerEmail ?? "unknown"}`,
    );
    if (payload.winnerEmail) {
      await this.mail.sendWinnerNotification(
        payload.winnerEmail,
        payload.eventTitle,
        payload.winningNumber,
        payload.prizeDescription,
      );
    }
  }
}
