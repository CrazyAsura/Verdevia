import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UsersService } from '../../modules/users/services/users.service';
import { EventPublisherPort } from '../../modules/messaging/ports/event-publisher.port';
export declare class KafkaTelemetryInterceptor implements NestInterceptor {
    private readonly reflector;
    private readonly eventPublisher;
    private readonly usersService;
    private readonly logger;
    constructor(reflector: Reflector, eventPublisher: EventPublisherPort, usersService: UsersService);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
    private publishToKafka;
    private sanitizePayload;
}
