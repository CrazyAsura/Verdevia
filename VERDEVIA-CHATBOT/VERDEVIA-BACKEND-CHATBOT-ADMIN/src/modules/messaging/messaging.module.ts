import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EVENT_PUBLISHER_PORT } from './ports/event-publisher.port';
import { FileEventPublisherAdapter } from './adapters/file-event-publisher.adapter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: FileEventPublisherAdapter,
    },
  ],
  exports: [EVENT_PUBLISHER_PORT],
})
export class MessagingModule {}
