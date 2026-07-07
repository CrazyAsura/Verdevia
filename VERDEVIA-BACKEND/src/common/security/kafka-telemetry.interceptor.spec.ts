import { Test, TestingModule } from '@nestjs/testing';
import { KafkaTelemetryInterceptor } from './kafka-telemetry.interceptor';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../modules/users/services/users.service';
import {
  EVENT_PUBLISHER_PORT,
  EventPublisherPort,
} from '../../modules/messaging/ports/event-publisher.port';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('KafkaTelemetryInterceptor', () => {
  let interceptor: KafkaTelemetryInterceptor;
  let reflector: Reflector;
  let eventPublisherMock: jest.Mocked<Pick<EventPublisherPort, 'publish'>>;
  let usersServiceMock: jest.Mocked<Pick<UsersService, 'findOne'>>;

  beforeEach(async () => {
    eventPublisherMock = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    usersServiceMock = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaTelemetryInterceptor,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: EVENT_PUBLISHER_PORT,
          useValue: eventPublisherMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    interceptor = module.get<KafkaTelemetryInterceptor>(
      KafkaTelemetryInterceptor,
    );
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through if no decorator is present', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = {
      getHandler: () => {},
      getClass: () => {},
    } as unknown as ExecutionContext;
    const next = {
      handle: () => of('result'),
    } as unknown as CallHandler;

    const result = await interceptor.intercept(context, next);
    let emittedValue: string | undefined;
    result.subscribe((val: unknown) => {
      emittedValue = val as string;
    });
    expect(emittedValue).toBe('result');
    expect(usersServiceMock.findOne).not.toHaveBeenCalled();
  });
});
