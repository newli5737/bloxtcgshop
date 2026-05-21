import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export type ApiEnvelope<T> = {
  data: T;
  meta: Record<string, unknown> | null;
  error: null;
};

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiEnvelope<unknown>> {
    return next.handle().pipe(
      map((body: unknown) => {
        if (this.isFullEnvelope(body)) {
          return body;
        }
        if (this.isPaginated(body)) {
          return { ...(body as object), error: null } as ApiEnvelope<unknown>;
        }
        return { data: body, meta: null, error: null };
      }),
    );
  }

  private isFullEnvelope(body: unknown): body is ApiEnvelope<unknown> {
    return (
      typeof body === "object" &&
      body !== null &&
      "data" in body &&
      "error" in body &&
      (body as ApiEnvelope<unknown>).error === null
    );
  }

  private isPaginated(body: unknown): body is { data: unknown; meta: Record<string, unknown> } {
    return typeof body === "object" && body !== null && "data" in body && "meta" in body;
  }
}
