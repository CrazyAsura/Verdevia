import { OnModuleInit } from '@nestjs/common';
import { KafkaConsumerAdapter } from '../adapters/kafka-consumer.adapter';
import { StatsService } from '../../stats/services/stats.service';
export declare class ErrorConsumer implements OnModuleInit {
    private readonly consumerAdapter;
    private readonly statsService;
    private readonly logger;
    constructor(consumerAdapter: KafkaConsumerAdapter, statsService: StatsService);
    onModuleInit(): void;
    private handle;
}
