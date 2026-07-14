import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import {
  EventPayload,
  EventPublisherPort,
} from '../ports/event-publisher.port';

@Injectable()
export class KafkaProducerAdapter
  implements EventPublisherPort, OnApplicationShutdown
{
  private readonly logger = new Logger('KafkaProducer');
  private kafka: Kafka;
  private producer: Producer | null = null;
  private isConnected = false;

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

    this.logger.log(
      `Initializing Kafka Producer: ClientID="${clientId}", Brokers=${JSON.stringify(brokers)}`,
    );

    this.kafka = new Kafka({
      clientId,
      brokers,
      retry: {
        initialRetryTime: 300,
        retries: 5,
      },
    });
  }

  private async getProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer({
        allowAutoTopicCreation: true,
        idempotent: true, // Meta Standard: ensures exactly-once semantics per partition
      });
    }

    if (!this.isConnected) {
      try {
        await this.producer.connect();
        this.isConnected = true;
        this.logger.log('✅ Connected to Kafka Broker successfully.');
      } catch (error) {
        this.logger.error(
          `❌ Failed to connect to Kafka Broker: ${(error as Error).message}`,
        );
        throw error;
      }
    }

    return this.producer;
  }

  public async publish(topic: string, event: EventPayload): Promise<void> {
    try {
      const producer = await this.getProducer();
      await producer.send({
        topic,
        messages: [
          {
            key: event.id,
            value: JSON.stringify(event),
            headers: {
              traceId: event.traceId,
              timestamp: String(event.timestamp),
            },
          },
        ],
      });
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish message to topic "${topic}": ${(error as Error).message}`,
      );
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.producer && this.isConnected) {
      try {
        await this.producer.disconnect();
        this.isConnected = false;
        this.logger.log('🔌 Disconnected Kafka Producer cleanly.');
      } catch (error) {
        this.logger.error(
          `❌ Error during Kafka Producer disconnect: ${(error as Error).message}`,
        );
      }
    }
  }

  async onApplicationShutdown() {
    await this.disconnect();
  }
}
