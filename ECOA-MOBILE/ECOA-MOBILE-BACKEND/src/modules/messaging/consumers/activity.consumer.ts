import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaConsumerAdapter } from '../adapters/kafka-consumer.adapter';
import { StatsService } from '../../stats/services/stats.service';

@Injectable()
export class ActivityConsumer implements OnModuleInit {
  private readonly logger = new Logger('ActivityConsumer');

  constructor(
    private readonly consumerAdapter: KafkaConsumerAdapter,
    private readonly statsService: StatsService,
  ) {}

  onModuleInit() {
    this.consumerAdapter.register(
      'gravity.activities.v1',
      'ECOA-activities-group',
      async (event) => this.handle(event),
    );
  }

  private async handle(event: any): Promise<void> {
    const { id, timestamp, traceId, payload } = event;
    const date = new Date(timestamp).toISOString();

    // Persist activity to database asynchronously (non-blocking)
    try {
      const isUuid = (val: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          val,
        );
      await this.statsService.logVisit({
        action: payload.action || 'ACTIVITY',
        path: payload.path || 'N/A',
        ip: '127.0.0.1',
        userAgent: 'NestJS Interceptor',
        userId: isUuid(payload.userId) ? payload.userId : undefined,
        userName: 'UserActivity',
        details: payload.details,
      });
    } catch (err) {
      this.logger.error(
        `Failed to save activity log to DB: ${(err as Error).message}`,
      );
    }

    // Cinematic console output - Apple & Meta design fusion
    console.log(
      '\x1b[38;5;39m┌── ◆ ECOA ACTIVITY TELEMETRY ◆ ──────────────────────────────────────\x1b[0m',
    );
    console.log(`\x1b[38;5;39m│\x1b[0m  \x1b[1mEvent ID:\x1b[0m   ${id}`);
    console.log(`\x1b[38;5;39m│\x1b[0m  \x1b[1mTrace ID:\x1b[0m   ${traceId}`);
    console.log(`\x1b[38;5;39m│\x1b[0m  \x1b[1mTimestamp:\x1b[0m  ${date}`);
    console.log(
      `\x1b[38;5;39m│\x1b[0m  \x1b[1mAction:\x1b[0m     \x1b[32m${payload.action || 'UNKNOWN'}\x1b[0m`,
    );
    console.log(
      `\x1b[38;5;39m│\x1b[0m  \x1b[1mUser ID:\x1b[0m    ${payload.userId || 'anonymous'}`,
    );
    console.log(
      `\x1b[38;5;39m│\x1b[0m  \x1b[1mPath/Op:\x1b[0m    ${payload.path || 'N/A'}`,
    );
    if (payload.details && Object.keys(payload.details).length > 0) {
      console.log(
        `\x1b[38;5;39m│\x1b[0m  \x1b[1mDetails:\x1b[0m    ${JSON.stringify(payload.details)}`,
      );
    }
    console.log(
      '\x1b[38;5;39m└───────────────────────────────────────────────────────────────────────\x1b[0m',
    );
  }
}
