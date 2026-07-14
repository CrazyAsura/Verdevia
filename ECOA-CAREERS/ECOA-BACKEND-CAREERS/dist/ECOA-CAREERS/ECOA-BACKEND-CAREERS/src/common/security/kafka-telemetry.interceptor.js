"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaTelemetryInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const graphql_1 = require("@nestjs/graphql");
const user_enums_1 = require("../../modules/users/enums/user.enums");
const users_service_1 = require("../../modules/users/services/users.service");
const event_publisher_port_1 = require("../../modules/messaging/ports/event-publisher.port");
const kafka_log_decorator_1 = require("../decorators/kafka-log.decorator");
const crypto = require("crypto");
let KafkaTelemetryInterceptor = class KafkaTelemetryInterceptor {
    reflector;
    eventPublisher;
    usersService;
    logger = new common_1.Logger('KafkaTelemetry');
    constructor(reflector, eventPublisher, usersService) {
        this.reflector = reflector;
        this.eventPublisher = eventPublisher;
        this.usersService = usersService;
    }
    async intercept(context, next) {
        const handler = context.getHandler();
        const clazz = context.getClass();
        const metadata = this.reflector.getAllAndOverride(kafka_log_decorator_1.KAFKA_LOG_METADATA, [handler, clazz]);
        if (!metadata) {
            return next.handle();
        }
        const startTime = Date.now();
        let action = metadata.actionName || 'Action';
        let path = 'Unknown Path';
        let userId = 'anonymous';
        let details = {};
        const traceId = crypto.randomUUID();
        try {
            const gqlCtx = graphql_1.GqlExecutionContext.create(context);
            const info = gqlCtx.getInfo();
            if (info) {
                const args = gqlCtx.getArgs();
                details = this.sanitizePayload(args);
                const gqlContext = gqlCtx.getContext();
                const req = gqlContext?.req;
                if (req) {
                    userId = req.user?.id || req.user?.sub || 'anonymous';
                    path = req.url || '/graphql';
                    const headerTraceId = req.headers?.['x-request-id'];
                    if (headerTraceId) {
                    }
                }
                if (action === 'Action') {
                    action = `GraphQL:${info.parentType.name}:${info.fieldName}`;
                }
            }
            else {
                const req = context.switchToHttp().getRequest();
                if (req) {
                    path = req.url || 'Unknown Path';
                    details = this.sanitizePayload(req.body);
                    userId = req.user?.id || req.user?.sub || 'anonymous';
                    const headerTraceId = req.headers?.['x-request-id'];
                    if (headerTraceId) {
                    }
                    if (action === 'Action') {
                        action = `${req.method || 'GET'} ${req.route?.path || req.url || ''}`;
                    }
                }
            }
        }
        catch {
        }
        let dbUser = null;
        let shouldLog = false;
        if (userId && userId !== 'anonymous') {
            try {
                dbUser = await this.usersService.findOne(userId);
                if (dbUser) {
                    const isSuperAdmin = dbUser.role === user_enums_1.UserRole.SUPER_ADMIN;
                    const isSuperContractor = dbUser.role === user_enums_1.UserRole.SUPER_CONTRACTOR;
                    const isSubordinate = dbUser.parentUser?.role === user_enums_1.UserRole.SUPER_CONTRACTOR ||
                        dbUser.parentUser?.parentUser?.role === user_enums_1.UserRole.SUPER_CONTRACTOR;
                    shouldLog = isSuperAdmin || isSuperContractor || isSubordinate;
                }
            }
            catch (err) {
                const errMsg = err instanceof Error ? err.message : 'Erro desconhecido';
                this.logger.error(`Erro ao consultar hierarquia do usuário para telemetria: ${errMsg}`);
            }
        }
        if (!shouldLog) {
            return next.handle();
        }
        const userEmail = dbUser?.email || 'email-desconhecido';
        const userRole = dbUser?.role || 'role-desconhecida';
        return next.handle().pipe((0, operators_1.tap)({
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
                }).catch((kErr) => {
                    this.logger.warn(`Erro de mensageria Kafka na atividade: ${kErr.message}`);
                });
            },
        }), (0, operators_1.catchError)((err) => {
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
            }).catch((kErr) => {
                this.logger.warn(`Erro de mensageria Kafka no log de erro: ${kErr.message}`);
            });
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
    async publishToKafka(topic, event) {
        try {
            await this.eventPublisher.publish(topic, event);
        }
        catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Erro desconhecido';
            this.logger.warn(`Falha na contingência ao enviar mensagem ao Kafka para o tópico ${topic}: ${errMsg}`);
        }
    }
    sanitizePayload(payload) {
        if (!payload || typeof payload !== 'object')
            return {};
        const cloned = JSON.parse(JSON.stringify(payload));
        const sensitiveKeys = [
            'password',
            'token',
            'secret',
            'passwordconfirmation',
            'creditcard',
        ];
        const sanitize = (obj) => {
            if (!obj || typeof obj !== 'object')
                return;
            for (const key of Object.keys(obj)) {
                if (sensitiveKeys.includes(key.toLowerCase())) {
                    obj[key] = '[REDACTED]';
                }
                else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitize(obj[key]);
                }
            }
        };
        sanitize(cloned);
        return cloned;
    }
};
exports.KafkaTelemetryInterceptor = KafkaTelemetryInterceptor;
exports.KafkaTelemetryInterceptor = KafkaTelemetryInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(event_publisher_port_1.EVENT_PUBLISHER_PORT)),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], KafkaTelemetryInterceptor);
//# sourceMappingURL=kafka-telemetry.interceptor.js.map