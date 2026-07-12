import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import {
  EVENT_PUBLISHER_PORT,
  EventPublisherPort,
} from '../ports/event-publisher.port';

@Catch()
export class ErrorLoggerFilter implements ExceptionFilter {
  private readonly logger = new Logger('ErrorLoggerFilter');

  constructor(
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const timestamp = Date.now();
    let traceId = crypto.randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stack = '';
    let path = 'Unknown Path';
    let userId = 'anonymous';

    if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack || '';
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'object' && response !== null
          ? (response as any).message || message
          : message;
    }

    try {
      const hostType = host.getType().toString();

      if (hostType === 'graphql') {
        const gqlHost = GqlArgumentsHost.create(host);
        const info = gqlHost.getInfo();
        path = info
          ? `GraphQL:${info.parentType.name}:${info.fieldName}`
          : 'GraphQL';
        const ctx = gqlHost.getContext();
        const req = ctx?.req;
        if (req) {
          userId = req.user?.id || req.user?.sub || 'anonymous';
          const headerTraceId = req.headers?.['x-request-id'];
          if (headerTraceId) traceId = headerTraceId;
        }
      } else {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest();
        if (req) {
          path = req.url;
          userId = req.user?.id || req.user?.sub || 'anonymous';
          const headerTraceId = req.headers?.['x-request-id'];
          if (headerTraceId) traceId = headerTraceId;
        }
      }
    } catch {
      // Fail-silent during context extraction
    }

    // Publish to Kafka (non-blocking, fire-and-forget)
    this.publishError(message, status, stack, path, userId, traceId, timestamp);

    // GraphQL context: let GraphQL driver format the error by rethrowing
    if (host.getType().toString() === 'graphql') {
      throw exception;
    }

    // HTTP context: respond manually
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    if (response && typeof response.status === 'function') {
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date(timestamp).toISOString(),
        path,
      });
    }
  }

  private async publishError(
    message: string,
    status: number,
    stack: string,
    path: string,
    userId: string,
    traceId: string,
    timestamp: number,
  ): Promise<void> {
    try {
      await this.eventPublisher.publish('gravity.errors.v1', {
        id: crypto.randomUUID(),
        timestamp,
        traceId,
        payload: {
          message,
          status,
          stack,
          path,
          userId,
        },
      });
    } catch (err) {
      // Local fallback logging in case Kafka is offline (resilience/reliability standard)
      this.logger.error(
        `[FALLBACK] Failed to publish error to Kafka (Kafka offline?): ${(err as Error).message}`,
      );
      this.logger.error(
        `[TraceID: ${traceId}] [Status: ${status}] [Path: ${path}] Error: ${message}`,
      );
      if (stack) {
        this.logger.error(`[TraceID: ${traceId}] Stack Trace:\n${stack}`);
      }
    }
  }
}
