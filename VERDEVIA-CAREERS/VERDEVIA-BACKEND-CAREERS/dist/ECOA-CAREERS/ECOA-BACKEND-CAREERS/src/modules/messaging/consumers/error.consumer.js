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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorConsumer = void 0;
const common_1 = require("@nestjs/common");
const kafka_consumer_adapter_1 = require("../adapters/kafka-consumer.adapter");
const stats_service_1 = require("../../stats/services/stats.service");
let ErrorConsumer = class ErrorConsumer {
    consumerAdapter;
    statsService;
    logger = new common_1.Logger('ErrorConsumer');
    constructor(consumerAdapter, statsService) {
        this.consumerAdapter = consumerAdapter;
        this.statsService = statsService;
    }
    onModuleInit() {
        this.consumerAdapter.register('gravity.errors.v1', 'ECOA-errors-group', async (event) => this.handle(event));
    }
    async handle(event) {
        const { id, timestamp, traceId, payload } = event;
        const date = new Date(timestamp).toISOString();
        try {
            const isUuid = (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
            await this.statsService.logVisit({
                action: 'SYSTEM_ERROR',
                path: payload.path || 'N/A',
                ip: '127.0.0.1',
                userAgent: 'NestJS ExceptionFilter',
                userId: isUuid(payload.userId) ? payload.userId : undefined,
                userName: 'SystemException',
                details: {
                    message: payload.message,
                    status: payload.status,
                    stack: payload.stack,
                    traceId,
                },
            });
        }
        catch (err) {
            this.logger.error(`Failed to save error log to DB: ${err.message}`);
        }
        const statusVal = parseInt(payload.status || '500');
        let statusBadge = `\x1b[33m${payload.status || 'N/A'}\x1b[0m`;
        if (statusVal >= 500) {
            statusBadge = `\x1b[97;41m ${statusVal} INTERNAL_ERROR \x1b[0m`;
        }
        else if (statusVal >= 400) {
            statusBadge = `\x1b[30;103m ${statusVal} CLIENT_ERROR \x1b[0m`;
        }
        else {
            statusBadge = `\x1b[97;44m ${statusVal || 'N/A'} \x1b[0m`;
        }
        const isGql = (payload.path || '').includes('GraphQL');
        const apiTypeBadge = isGql
            ? `\x1b[30;46m GRAPHQL \x1b[0m`
            : `\x1b[30;42m REST_API \x1b[0m`;
        console.log('\x1b[38;5;202m┌── 🚨 ECOA EXCEPTION TELEMETRY 🚨 ────────────────────────────────────\x1b[0m');
        console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mEvent ID:\x1b[0m     ${id}`);
        console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mTrace ID:\x1b[0m     \x1b[1;36m${traceId}\x1b[0m`);
        console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mTimestamp:\x1b[0m    ${date}`);
        console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mProtocol:\x1b[0m     ${apiTypeBadge}`);
        console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mStatus:\x1b[0m       ${statusBadge}`);
        console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mPath/Op:\x1b[0m      \x1b[35m${payload.path || 'N/A'}\x1b[0m`);
        console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mUser ID:\x1b[0m      ${payload.userId || 'anonymous'}`);
        console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mMessage:\x1b[0m      \x1b[1;31m${payload.message || 'Unknown Exception'}\x1b[0m`);
        if (payload.stack) {
            console.log(`\x1b[38;5;202m│\x1b[0m  \x1b[1mStack Trace:\x1b[0m`);
            const stackLines = payload.stack.split('\n').slice(0, 4);
            for (const line of stackLines) {
                console.log(`\x1b[38;5;202m│\x1b[0m    \x1b[2m${line.trim()}\x1b[0m`);
            }
        }
        console.log('\x1b[38;5;202m└───────────────────────────────────────────────────────────────────────\x1b[0m');
    }
};
exports.ErrorConsumer = ErrorConsumer;
exports.ErrorConsumer = ErrorConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kafka_consumer_adapter_1.KafkaConsumerAdapter, typeof (_a = typeof stats_service_1.StatsService !== "undefined" && stats_service_1.StatsService) === "function" ? _a : Object])
], ErrorConsumer);
//# sourceMappingURL=error.consumer.js.map