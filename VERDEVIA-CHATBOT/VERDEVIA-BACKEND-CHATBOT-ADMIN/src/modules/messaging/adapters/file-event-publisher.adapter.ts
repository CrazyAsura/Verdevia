import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { appendFile, mkdir } from 'fs/promises';
import { join, resolve } from 'path';
import {
  EventPayload,
  EventPublisherPort,
} from '../ports/event-publisher.port';

/** Persists audit events as newline-delimited JSON, suitable for log shippers. */
@Injectable()
export class FileEventPublisherAdapter implements EventPublisherPort {
  private readonly logger = new Logger(FileEventPublisherAdapter.name);
  private readonly logDirectory: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(config: ConfigService) {
    this.logDirectory = resolve(
      config.get<string>('LOG_DIR') || join(process.cwd(), 'logs'),
    );
  }

  async publish(topic: string, event: EventPayload): Promise<void> {
    const filename =
      topic === 'gravity.activities.v1' ? 'activity.jsonl' : 'error.jsonl';
    const line = `${JSON.stringify({ topic, ...event })}\n`;

    this.writeQueue = this.writeQueue.then(async () => {
      await mkdir(this.logDirectory, { recursive: true });
      await appendFile(join(this.logDirectory, filename), line, 'utf8');
    });

    try {
      await this.writeQueue;
    } catch (error) {
      // Reset the queue so a transient filesystem failure does not block later writes.
      this.writeQueue = Promise.resolve();
      this.logger.error(
        `Unable to persist ${topic}: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.writeQueue;
  }
}
