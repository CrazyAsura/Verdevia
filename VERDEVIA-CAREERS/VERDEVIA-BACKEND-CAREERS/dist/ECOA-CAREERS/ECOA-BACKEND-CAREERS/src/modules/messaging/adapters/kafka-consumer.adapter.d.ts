import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface ConsumerRegistration {
    topic: string;
    groupId: string;
    handler: (payload: any) => Promise<void>;
}
export declare class KafkaConsumerAdapter implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly configService;
    private readonly logger;
    private kafka;
    private consumers;
    private registrations;
    private isRunning;
    constructor(configService: ConfigService);
    register(topic: string, groupId: string, handler: (payload: any) => Promise<void>): void;
    onApplicationBootstrap(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
}
