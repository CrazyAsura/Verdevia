import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EVENT_PUBLISHER_PORT } from './ports/event-publisher.port';
import { KafkaProducerAdapter } from './adapters/kafka-producer.adapter';
import { KafkaConsumerAdapter } from './adapters/kafka-consumer.adapter';
import { NoopEventPublisherAdapter } from './adapters/noop-event-publisher.adapter';
import { ActivityConsumer } from './consumers/activity.consumer';
import { ErrorConsumer } from './consumers/error.consumer';
import { StatsModule } from '../stats/stats.module';

@Global()
@Module({
  imports: [ConfigModule, StatsModule],
  providers: [
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass:
        process.env.KAFKA_ENABLED === 'false'
          ? NoopEventPublisherAdapter
          : KafkaProducerAdapter,
    },
    KafkaConsumerAdapter,
    ActivityConsumer,
    ErrorConsumer,
  ],
  exports: [EVENT_PUBLISHER_PORT, KafkaConsumerAdapter],
})
export class MessagingModule {}
