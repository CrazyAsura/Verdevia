import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../modules/users/enums/user.enums';
import { UsersService } from '../../modules/users/services/users.service';
import {
  EVENT_PUBLISHER_PORT,
  EventPublisherPort,
  EventPayload,
} from '../../modules/messaging/ports/event-publisher.port';
import { KAFKA_LOG_METADATA } from '../decorators/kafka-log.decorator';
import * as crypto from 'crypto';

interface GraphQLInfo {
  parentType: { name: string };
  fieldName: string;
}

interface CustomRequest {
  user?: { id?: string; sub?: string; role?: string; email?: string };
  url?: string;
  headers?: Record<string, string>;
  method?: string;
  route?: { path?: string };
  body?: Record<string, any>;
  ip?: string;
  socket?: { remoteAddress?: string };
}

interface GraphQLContext {
  req?: CustomRequest;
}

@Injectable()
export class KafkaTelemetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger('KafkaTelemetry');

  constructor(
    private readonly reflector: Reflector,
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventPublisherPort,
    private readonly usersService: UsersService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const handler = context.getHandler();
    const clazz = context.getClass();

    const metadata = this.reflector.getAllAndOverride<{ actionName?: string }>(
      KAFKA_LOG_METADATA,
      [handler, clazz],
    );

    if (!metadata) {
      return next.handle();
    }

    const startTime = Date.now();
    let action = metadata.actionName || 'Action';
    let path = 'Unknown Path';
    let userId = 'anonymous';
    let details: Record<string, any> = {};
    const traceId = crypto.randomUUID();

    try {
      const gqlCtx = GqlExecutionContext.create(context);
      const info = gqlCtx.getInfo<GraphQLInfo>();

      if (info) {
        // GraphQL context
        const args = gqlCtx.getArgs<Record<string, any>>();
        details = this.sanitizePayload(args);

        const gqlContext = gqlCtx.getContext<GraphQLContext>();
        const req = gqlContext?.req;
        if (req) {
          userId = req.user?.id || req.user?.sub || 'anonymous';
          path = req.url || '/graphql';
          const headerTraceId = req.headers?.['x-request-id'];
          if (headerTraceId) {
            // Keep headerTraceId if present
          }
        }
        if (action === 'Action') {
          action = `GraphQL:${info.parentType.name}:${info.fieldName}`;
        }
      } else {
        // HTTP/REST context
        const req = context.switchToHttp().getRequest<CustomRequest>();
        if (req) {
          path = req.url || 'Unknown Path';
          details = this.sanitizePayload(req.body);
          userId = req.user?.id || req.user?.sub || 'anonymous';
          const headerTraceId = req.headers?.['x-request-id'];
          if (headerTraceId) {
            // Keep headerTraceId if present
          }
          if (action === 'Action') {
            action = `${req.method || 'GET'} ${req.route?.path || req.url || ''}`;
          }
        }
      }
    } catch {
      // Silent on extraction error
    }

    let dbUser: User | null = null;
    let shouldLog = false;

    if (userId && userId !== 'anonymous') {
      try {
        dbUser = await this.usersService.findOne(userId);

        if (dbUser) {
          const isSuperAdmin = dbUser.role === UserRole.SUPER_ADMIN;
          const isSuperContractor = dbUser.role === UserRole.SUPER_CONTRACTOR;
          const isSubordinate =
            dbUser.parentUser?.role === UserRole.SUPER_CONTRACTOR ||
            dbUser.parentUser?.parentUser?.role === UserRole.SUPER_CONTRACTOR;

          shouldLog = isSuperAdmin || isSuperContractor || isSubordinate;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        this.logger.error(
          `Erro ao consultar hierarquia do usuário para telemetria: ${errMsg}`,
        );
      }
    }

    if (!shouldLog) {
      return next.handle();
    }

    const userEmail = dbUser?.email || 'email-desconhecido';
    const userRole = dbUser?.role || 'role-desconhecida';

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const logMessage = `Ação altamente crítica identificada com sucesso para o usuário autenticado portador do e-mail ${userEmail} sob a função organizacional de ${userRole}, resultando no envio imediato dos dados operacionais e de telemetria ao cluster de mensageria Apache Kafka através do Trace ID ${traceId} com tempo total de resposta computado em ${duration} milissegundos.`;

          this.logger.log(`[TELEMETRIA SUCESSO] ${logMessage}`);

          this.publishToKafka('gravity.activities.v1', {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            traceId,
            payload: {
              action,
              path,
              userId,
              details: {
                ...details,
                durationMs: duration,
                status: 'SUCCESS',
                telemetryDescription: logMessage,
              },
            },
          }).catch((kErr: Error) => {
            this.logger.warn(
              `Erro de mensageria Kafka na atividade: ${kErr.message}`,
            );
          });
        },
      }),
      catchError((err: Error & { status?: number }) => {
        const duration = Date.now() - startTime;
        const errorMessage = `Exceção crítica detectada e capturada durante a execução da operação ${action} solicitada pelo usuário com e-mail ${userEmail} e nível de privilégio ${userRole}, forçando a publicação detalhada do erro e da pilha de chamadas (Stack Trace) no barramento Kafka sob o Trace ID ${traceId} com falha operacional registrada após ${duration} milissegundos de processamento.`;

        this.logger.error(`[TELEMETRIA ERRO] ${errorMessage}`);

        this.publishToKafka('gravity.errors.v1', {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          traceId,
          payload: {
            message: err.message || 'Erro desconhecido',
            status: err.status || 500,
            stack: err.stack || '',
            path,
            userId,
            details: {
              telemetryDescription: errorMessage,
              durationMs: duration,
            },
          },
        }).catch((kErr: Error) => {
          this.logger.warn(
            `Erro de mensageria Kafka no log de erro: ${kErr.message}`,
          );
        });

        return throwError(() => err);
      }),
    );
  }

  private async publishToKafka(
    topic: string,
    event: EventPayload,
  ): Promise<void> {
    try {
      await this.eventPublisher.publish(topic, event);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      this.logger.warn(
        `Falha na contingência ao enviar mensagem ao Kafka para o tópico ${topic}: ${errMsg}`,
      );
    }
  }

  private sanitizePayload(payload: unknown): Record<string, any> {
    if (!payload || typeof payload !== 'object') return {};

    const cloned = JSON.parse(JSON.stringify(payload)) as Record<string, any>;
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'passwordconfirmation',
      'creditcard',
    ];

    const sanitize = (obj: Record<string, any>) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key] as Record<string, any>);
        }
      }
    };

    sanitize(cloned);
    return cloned;
  }
}

