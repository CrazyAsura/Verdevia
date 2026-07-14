import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  EVENT_PUBLISHER_PORT,
  EventPublisherPort,
} from '../../modules/messaging/ports/event-publisher.port';

@Injectable()
export class ActivityLoggerInterceptor implements NestInterceptor {
  constructor(
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    let action = 'Unknown Action';
    let path = 'Unknown Path';
    let userId = 'anonymous';
    let details: Record<string, any> = {};
    let traceId = crypto.randomUUID();

    try {
      const gqlCtx = GqlExecutionContext.create(context);
      const info = gqlCtx.getInfo();
      if (info) {
        action = `GraphQL:${info.parentType.name}:${info.fieldName}`;
        const args = gqlCtx.getArgs();
        details = this.sanitizePayload(args);

        const req = gqlCtx.getContext().req;
        if (req) {
          userId = req.user?.id || req.user?.sub || 'anonymous';
          path = req.url || '/graphql';
          const headerTraceId = req.headers?.['x-request-id'];
          if (headerTraceId) traceId = headerTraceId;
        }
      } else {
        const req = context.switchToHttp().getRequest();
        if (req) {
          action = `${req.method} ${req.route?.path || req.url}`;
          path = req.url;
          details = this.sanitizePayload(req.body);
          userId = req.user?.id || req.user?.sub || 'anonymous';
          const headerTraceId = req.headers?.['x-request-id'];
          if (headerTraceId) traceId = headerTraceId;
        }
      }
    } catch {
      // Silently fail-safe if context parsing errors out
    }

    return next.handle().pipe(
      tap({
        next: async () => {
          const duration = Date.now() - startTime;
          await this.publishActivity(action, path, userId, traceId, {
            ...details,
            durationMs: duration,
            status: 'SUCCESS',
          });
        },
        error: async (err) => {
          const duration = Date.now() - startTime;
          await this.publishActivity(action, path, userId, traceId, {
            ...details,
            durationMs: duration,
            status: 'FAILED',
            error: err.message || 'Unknown Error',
          });
        },
      }),
    );
  }

  private async publishActivity(
    action: string,
    path: string,
    userId: string,
    traceId: string,
    payloadDetails: Record<string, any>,
  ): Promise<void> {
    try {
      await this.eventPublisher.publish('gravity.activities.v1', {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        traceId,
        payload: { action, path, userId, details: payloadDetails },
      });
    } catch {
      // Never block main application loop on messaging failure
    }
  }

  private sanitizePayload(payload: any): Record<string, any> {
    if (!payload || typeof payload !== 'object') return {};
    const cloned = JSON.parse(JSON.stringify(payload));
    const sensitiveKeys = ['password', 'token', 'secret', 'passwordconfirmation', 'creditcard'];
    const sanitize = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(cloned);
    return cloned;
  }
}
