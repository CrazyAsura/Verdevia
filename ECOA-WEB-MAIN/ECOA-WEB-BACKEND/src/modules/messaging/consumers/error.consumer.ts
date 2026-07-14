import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaConsumerAdapter } from '../adapters/kafka-consumer.adapter';
import { StatsService } from '../../stats/services/stats.service';

@Injectable()
export class ErrorConsumer implements OnModuleInit {
  private readonly logger = new Logger('ErrorConsumer');

  constructor(
    private readonly consumerAdapter: KafkaConsumerAdapter,
    private readonly statsService: StatsService,
  ) {}

  onModuleInit() {
    this.consumerAdapter.register(
      'gravity.errors.v1',
      'ECOA-errors-group',
      async (event) => this.handle(event),
    );
  }

  private async handle(event: any): Promise<void> {
    const { id, timestamp, traceId, payload } = event;
    const date = new Date(timestamp).toISOString();

    // Persist error to database asynchronously (non-blocking)
    try {
      const isUuid = (val: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          val,
        );
      await this.statsService.logVisit({
        action: 'SYSTEM_ERROR',
        path: payload.path || 'N/A',
        ip: '127.0.0.1',
        userAgent: 'NestJS ExceptionFilter',
        userId: isUuid(payload.userId) ? payload.userId : undefined,
        userName: 'SystemException',
        details: {
          message: payload.message,
          status: payload.status,
          stack: payload.stack,
          traceId,
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to save error log to DB: ${(err as Error).message}`,
      );
    }

    // Badge styling for HTTP / GraphQL status codes
    const statusVal = parseInt(payload.status || '500');
    let statusBadge = `\x1b[33m${payload.status || 'N/A'}\x1b[0m`;
    if (statusVal >= 500) {
      statusBadge = `\x1b[97;41m ${statusVal} INTERNAL_ERROR \x1b[0m`; // Red background
    } else if (statusVal >= 400) {
      statusBadge = `\x1b[30;103m ${statusVal} CLIENT_ERROR \x1b[0m`; // Yellow background
    } else {
      statusBadge = `\x1b[97;44m ${statusVal || 'N/A'} \x1b[0m`; // Blue background
    }

    // Detect GraphQL vs REST
    const isGql = (payload.path || '').includes('GraphQL');
    const apiTypeBadge = isGql
      ? `\x1b[30;46m GRAPHQL \x1b[0m`
      : `\x1b[30;42m REST_API \x1b[0m`;

    // Cinematic console output for failures - Apple & Meta design fusion
    console.log(
      '\x1b[38;5;202m┌── 🚨 ECOA EXCEPTION TELEMETRY 🚨 ────────────────────────────────────\x1b[0m',
    );
    console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mEvent ID:\x1b[0m     ${id}`);
    console.log(
      `\x1b[38;5;202m│\x1b[0m  \x1b[1mTrace ID:\x1b[0m     \x1b[1;36m${traceId}\x1b[0m`,
    );
    console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mTimestamp:\x1b[0m    ${date}`);
    console.log(
      `\x1b[38;5;202m│\x1b[0m  \x1b[1mProtocol:\x1b[0m     ${apiTypeBadge}`,
    );
    console.log(
      `\x1b[38;5;202m│\x1b[0m  \x1b[1mStatus:\x1b[0m       ${statusBadge}`,
    );
    console.log(
      `\x1b[38;5;202m│\x1b[0m  \x1b[1mPath/Op:\x1b[0m      \x1b[35m${payload.path || 'N/A'}\x1b[0m`,
    );
    console.log(
      `\x1b[38;5;202m│\x1b[0m  \x1b[1mUser ID:\x1b[0m      ${payload.userId || 'anonymous'}`,
    );
    console.log(
      `\x1b[38;5;202m│\x1b[0m  \x1b[1mMessage:\x1b[0m      \x1b[1;31m${payload.message || 'Unknown Exception'}\x1b[0m`,
    );
    if (payload.stack) {
      console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mStack Trace:\x1b[0m`);
      const stackLines = (payload.stack as string).split('\n').slice(0, 4);
      for (const line of stackLines) {
        console.log(`\x1b[38;5;202m│\x1b[0m    \x1b[2m${line.trim()}\x1b[0m`);
      }
    }
    console.log(
      '\x1b[38;5;202m└───────────────────────────────────────────────────────────────────────\x1b[0m',
    );
  }
}
