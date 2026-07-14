import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventPublisherPort } from '../ports/event-publisher.port';
export declare class ActivityLoggerInterceptor implements NestInterceptor {
    private readonly eventPublisher;
    constructor(eventPublisher: EventPublisherPort);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private publishActivity;
    private sanitizePayload;
}
