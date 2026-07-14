import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { EventPublisherPort } from '../../modules/messaging/ports/event-publisher.port';
export declare class ErrorLoggerFilter implements ExceptionFilter {
    private readonly eventPublisher;
    private readonly logger;
    constructor(eventPublisher: EventPublisherPort);
    catch(exception: unknown, host: ArgumentsHost): Promise<void>;
    private publishError;
}
