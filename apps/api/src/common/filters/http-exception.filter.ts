import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resBody = exception.getResponse();
      const message =
        typeof resBody === "string"
          ? resBody
          : typeof resBody === "object" && resBody !== null && "message" in resBody
            ? String((resBody as { message: string | string[] }).message)
            : exception.message;
      const details = typeof resBody === "object" && resBody !== null ? resBody : undefined;
      response.status(status).json({
        data: null,
        meta: null,
        error: {
          code: `HTTP_${status}`,
          message: Array.isArray(message) ? message.join(", ") : message,
          details,
        },
      });
      return;
    }

    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      data: null,
      meta: null,
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected server error",
        details: null,
      },
    });
  }
}
