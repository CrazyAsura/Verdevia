import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import {
  EventPayload,
  EventPublisherPort,
} from '../ports/event-publisher.port';

@Injectable()
export class NoopEventPublisherAdapter
  implements EventPublisherPort, OnApplicationShutdown
{
  private readonly logger = new Logger('NoopEventPublisher');
  private warned = false;

  async publish(_topic: string, _event: EventPayload): Promise<void> {
    if (!this.warned) {
      this.logger.log('Kafka disabled for this environment. Events are ignored.');
      this.warned = true;
    }
  }

  async disconnect(): Promise<void> {
    return undefined;
  }

  async onApplicationShutdown(): Promise<void> {
    await this.disconnect();
  }
}
