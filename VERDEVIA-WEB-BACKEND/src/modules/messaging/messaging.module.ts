import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EVENT_PUBLISHER_PORT } from 'app/common';
import { NoopEventPublisherAdapter } from './adapters/noop-event-publisher.adapter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: NoopEventPublisherAdapter,
    },
  ],
  exports: [EVENT_PUBLISHER_PORT],
})
export class MessagingModule {}
