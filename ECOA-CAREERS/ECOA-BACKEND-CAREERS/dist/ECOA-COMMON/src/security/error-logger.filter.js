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
exports.ErrorLoggerFilter = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const event_publisher_port_1 = require("../ports/event-publisher.port");
let ErrorLoggerFilter = class ErrorLoggerFilter {
    eventPublisher;
    logger = new common_1.Logger('ErrorLoggerFilter');
    constructor(eventPublisher) {
        this.eventPublisher = eventPublisher;
    }
    async catch(exception, host) {
        const timestamp = Date.now();
        let traceId = crypto.randomUUID();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let stack = '';
        let path = 'Unknown Path';
        let userId = 'anonymous';
        if (exception instanceof Error) {
            message = exception.message;
            stack = exception.stack || '';
        }
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse();
            message =
                typeof response === 'object' && response !== null
                    ? response.message || message
                    : message;
        }
        try {
            const hostType = host.getType().toString();
            if (hostType === 'graphql') {
                const gqlHost = graphql_1.GqlArgumentsHost.create(host);
                const info = gqlHost.getInfo();
                path = info
                    ? `GraphQL:${info.parentType.name}:${info.fieldName}`
                    : 'GraphQL';
                const ctx = gqlHost.getContext();
                const req = ctx?.req;
                if (req) {
                    userId = req.user?.id || req.user?.sub || 'anonymous';
                    const headerTraceId = req.headers?.['x-request-id'];
                    if (headerTraceId)
                        traceId = headerTraceId;
                }
            }
            else {
                const ctx = host.switchToHttp();
                const req = ctx.getRequest();
                if (req) {
                    path = req.url;
                    userId = req.user?.id || req.user?.sub || 'anonymous';
                    const headerTraceId = req.headers?.['x-request-id'];
                    if (headerTraceId)
                        traceId = headerTraceId;
                }
            }
        }
        catch {
        }
        this.publishError(message, status, stack, path, userId, traceId, timestamp);
        if (host.getType().toString() === 'graphql') {
            throw exception;
        }
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        if (response && typeof response.status === 'function') {
            response.status(status).json({
                statusCode: status,
                message,
                timestamp: new Date(timestamp).toISOString(),
                path,
            });
        }
    }
    async publishError(message, status, stack, path, userId, traceId, timestamp) {
        try {
            await this.eventPublisher.publish('gravity.errors.v1', {
                id: crypto.randomUUID(),
                timestamp,
                traceId,
                payload: {
                    message,
                    status,
                    stack,
                    path,
                    userId,
                },
            });
        }
        catch (err) {
            this.logger.error(`[FALLBACK] Failed to publish error to Kafka (Kafka offline?): ${err.message}`);
            this.logger.error(`[TraceID: ${traceId}] [Status: ${status}] [Path: ${path}] Error: ${message}`);
            if (stack) {
                this.logger.error(`[TraceID: ${traceId}] Stack Trace:\n${stack}`);
            }
        }
    }
};
exports.ErrorLoggerFilter = ErrorLoggerFilter;
exports.ErrorLoggerFilter = ErrorLoggerFilter = __decorate([
    (0, common_1.Catch)(),
    __param(0, (0, common_1.Inject)(event_publisher_port_1.EVENT_PUBLISHER_PORT)),
    __metadata("design:paramtypes", [Object])
], ErrorLoggerFilter);
//# sourceMappingURL=error-logger.filter.js.map