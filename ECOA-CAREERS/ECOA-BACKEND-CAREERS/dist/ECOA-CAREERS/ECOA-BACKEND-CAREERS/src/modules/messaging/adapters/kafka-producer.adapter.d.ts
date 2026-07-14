import { OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPayload, EventPublisherPort } from '../ports/event-publisher.port';
export declare class KafkaProducerAdapter implements EventPublisherPort, OnApplicationShutdown {
    private readonly configService;
    private readonly logger;
    private kafka;
    private producer;
    private isConnected;
    constructor(configService: ConfigService);
    private getProducer;
    publish(topic: string, event: EventPayload): Promise<void>;
    disconnect(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
}
