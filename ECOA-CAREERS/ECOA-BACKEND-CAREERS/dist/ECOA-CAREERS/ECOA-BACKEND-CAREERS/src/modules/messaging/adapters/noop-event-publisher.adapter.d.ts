import { OnApplicationShutdown } from '@nestjs/common';
import { EventPayload, EventPublisherPort } from '../ports/event-publisher.port';
export declare class NoopEventPublisherAdapter implements EventPublisherPort, OnApplicationShutdown {
    private readonly logger;
    private warned;
    publish(_topic: string, _event: EventPayload): Promise<void>;
    disconnect(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
}
