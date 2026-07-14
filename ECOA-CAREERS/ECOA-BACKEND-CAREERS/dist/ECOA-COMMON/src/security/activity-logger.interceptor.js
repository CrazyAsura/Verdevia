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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLoggerInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const graphql_1 = require("@nestjs/graphql");
const event_publisher_port_1 = require("../ports/event-publisher.port");
let ActivityLoggerInterceptor = class ActivityLoggerInterceptor {
    eventPublisher;
    constructor(eventPublisher) {
        this.eventPublisher = eventPublisher;
    }
    intercept(context, next) {
        const startTime = Date.now();
        let action = 'Unknown Action';
        let path = 'Unknown Path';
        let userId = 'anonymous';
        let details = {};
        let traceId = crypto.randomUUID();
        try {
            const gqlCtx = graphql_1.GqlExecutionContext.create(context);
            const info = gqlCtx.getInfo();
            if (info) {
                action = `GraphQL:${info.parentType.name}:${info.fieldName}`;
                const args = gqlCtx.getArgs();
                details = this.sanitizePayload(args);
                const req = gqlCtx.getContext().req;
                if (req) {
                    userId = req.user?.id || req.user?.sub || 'anonymous';
                    path = req.url || '/graphql';
                    const headerTraceId = req.headers?.['x-request-id'];
                    if (headerTraceId)
                        traceId = headerTraceId;
                }
            }
            else {
                const req = context.switchToHttp().getRequest();
                if (req) {
                    action = `${req.method} ${req.route?.path || req.url}`;
                    path = req.url;
                    details = this.sanitizePayload(req.body);
                    userId = req.user?.id || req.user?.sub || 'anonymous';
                    const headerTraceId = req.headers?.['x-request-id'];
                    if (headerTraceId)
                        traceId = headerTraceId;
                }
            }
        }
        catch {
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: async () => {
                const duration = Date.now() - startTime;
                await this.publishActivity(action, path, userId, traceId, {
                    ...details,
                    durationMs: duration,
                    status: 'SUCCESS',
                });
            },
            error: async (err) => {
                const duration = Date.now() - startTime;
                await this.publishActivity(action, path, userId, traceId, {
                    ...details,
                    durationMs: duration,
                    status: 'FAILED',
                    error: err.message || 'Unknown Error',
                });
            },
        }));
    }
    async publishActivity(action, path, userId, traceId, payloadDetails) {
        try {
            await this.eventPublisher.publish('gravity.activities.v1', {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                traceId,
                payload: {
                    action,
                    path,
                    userId,
                    details: payloadDetails,
                },
            });
        }
        catch {
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
exports.ActivityLoggerInterceptor = ActivityLoggerInterceptor;
exports.ActivityLoggerInterceptor = ActivityLoggerInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(event_publisher_port_1.EVENT_PUBLISHER_PORT)),
    __metadata("design:paramtypes", [Object])
], ActivityLoggerInterceptor);
//# sourceMappingURL=activity-logger.interceptor.js.map