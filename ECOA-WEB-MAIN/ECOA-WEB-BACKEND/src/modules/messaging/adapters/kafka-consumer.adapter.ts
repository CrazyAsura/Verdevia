import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';

export interface ConsumerRegistration {
  topic: string;
  groupId: string;
  handler: (payload: any) => Promise<void>;
}

@Injectable()
export class KafkaConsumerAdapter
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger('KafkaConsumerManager');
  private kafka: Kafka;
  private consumers: Consumer[] = [];
  private registrations: ConsumerRegistration[] = [];
  private isRunning = false;

  constructor(private readonly configService: ConfigService) {
    const brokersRaw = this.configService.get<string>(
      'KAFKA_BROKERS',
      'localhost:9092',
    );
    const brokers = brokersRaw.split(',');
    const clientId = this.configService.get<string>(
      'KAFKA_CLIENT_ID',
      'ECOA-backend',
    );

    this.kafka = new Kafka({
      clientId: `${clientId}-consumer`,
      brokers,
      retry: {
        initialRetryTime: 300,
        retries: 5,
      },
    });
  }

  public register(
    topic: string,
    groupId: string,
    handler: (payload: any) => Promise<void>,
  ): void {
    if (this.isRunning) {
      throw new Error('Cannot register consumer after startup.');
    }
    this.registrations.push({ topic, groupId, handler });
    this.logger.log(
      `Registered handler for topic "${topic}" with Group ID "${groupId}"`,
    );
  }

  async onApplicationBootstrap() {
    const enabled =
      this.configService.get<string>('KAFKA_CONSUMER_ENABLED', 'true') ===
      'true';
    if (!enabled) {
      this.logger.log(
        'Kafka Consumer loops are disabled (KAFKA_CONSUMER_ENABLED=false). Skipping.',
      );
      return;
    }

    if (this.registrations.length === 0) {
      this.logger.log('No consumers registered. Skipping startup.');
      return;
    }

    this.isRunning = true;
    this.logger.log(`Starting ${this.registrations.length} Kafka consumers...`);

    for (const reg of this.registrations) {
      const consumer = this.kafka.consumer({ groupId: reg.groupId });
      this.consumers.push(consumer);

      let connected = false;
      let attempts = 0;
      const maxAttempts = 5;
      const delayMs = 5000;

      while (!connected && attempts < maxAttempts) {
        try {
          attempts++;
          await consumer.connect();
          await consumer.subscribe({ topic: reg.topic, fromBeginning: false });

          await consumer.run({
            eachMessage: async ({ message }) => {
              if (!message.value) return;
              try {
                const valueStr = message.value.toString();
                const payload = JSON.parse(valueStr);
                await reg.handler(payload);
              } catch (err) {
                this.logger.error(
                  `Error processing message from topic "${reg.topic}": ${(err as Error).message}`,
                );
              }
            },
          });

          this.logger.log(
            `🚀 Consumer group "${reg.groupId}" listening on topic "${reg.topic}"`,
          );
          connected = true;
        } catch (error) {
          this.logger.warn(
            `⚠️ Attempt ${attempts}/${maxAttempts} failed to start consumer for topic "${reg.topic}": ${(error as Error).message}. Retrying in ${delayMs / 1000}s...`,
          );
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else {
            this.logger.error(
              `❌ Max attempts reached. Failed to start consumer for topic "${reg.topic}".`,
            );
          }
        }
      }
    }
  }

  async onApplicationShutdown() {
    this.logger.log('Shutting down Kafka consumers...');
    for (const consumer of this.consumers) {
      try {
        await consumer.disconnect();
      } catch (err) {
        this.logger.error(
          `Error disconnecting consumer: ${(err as Error).message}`,
        );
      }
    }
  }
}
