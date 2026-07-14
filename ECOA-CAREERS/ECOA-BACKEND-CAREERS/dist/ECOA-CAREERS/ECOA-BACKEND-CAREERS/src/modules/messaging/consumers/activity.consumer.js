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
exports.ActivityConsumer = void 0;
const common_1 = require("@nestjs/common");
const kafka_consumer_adapter_1 = require("../adapters/kafka-consumer.adapter");
const stats_service_1 = require("../../stats/services/stats.service");
let ActivityConsumer = class ActivityConsumer {
    consumerAdapter;
    statsService;
    logger = new common_1.Logger('ActivityConsumer');
    constructor(consumerAdapter, statsService) {
        this.consumerAdapter = consumerAdapter;
        this.statsService = statsService;
    }
    onModuleInit() {
        this.consumerAdapter.register('gravity.activities.v1', 'ECOA-activities-group', async (event) => this.handle(event));
    }
    async handle(event) {
        const { id, timestamp, traceId, payload } = event;
        const date = new Date(timestamp).toISOString();
        try {
            const isUuid = (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
            await this.statsService.logVisit({
                action: payload.action || 'ACTIVITY',
                path: payload.path || 'N/A',
                ip: '127.0.0.1',
                userAgent: 'NestJS Interceptor',
                userId: isUuid(payload.userId) ? payload.userId : undefined,
                userName: 'UserActivity',
                details: payload.details,
            });
        }
        catch (err) {
            this.logger.error(`Failed to save activity log to DB: ${err.message}`);
        }
        console.log('\x1b[38;5;39m┌── ◆ ECOA ACTIVITY TELEMETRY ◆ ──────────────────────────────────────\x1b[0m');
        console.log(`\x1b[38;5;39m│\x1b[0m  \x1b[1mEvent ID:\x1b[0m   ${id}`);
        console.log(`\x1b[38;5;39m│\x1b[0m  \x1b[1mTrace ID:\x1b[0m   ${traceId}`);
        console.log(`\x1b[38;5;39m│\x1b[0m  \x1b[1mTimestamp:\x1b[0m  ${date}`);
        console.log(`\x1b[38;5;39m│\x1b[0m  \x1b[1mAction:\x1b[0m     \x1b[32m${payload.action || 'UNKNOWN'}\x1b[0m`);
        console.log(`\x1b[38;5;39m│\x1b[0m  \x1b[1mUser ID:\x1b[0m    ${payload.userId || 'anonymous'}`);
        console.log(`\x1b[38;5;39m│\x1b[0m  \x1b[1mPath/Op:\x1b[0m    ${payload.path || 'N/A'}`);
        if (payload.details && Object.keys(payload.details).length > 0) {
            console.log(`\x1b[38;5;39m│\x1b[0m  \x1b[1mDetails:\x1b[0m    ${JSON.stringify(payload.details)}`);
        }
        console.log('\x1b[38;5;39m└───────────────────────────────────────────────────────────────────────\x1b[0m');
    }
};
exports.ActivityConsumer = ActivityConsumer;
exports.ActivityConsumer = ActivityConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kafka_consumer_adapter_1.KafkaConsumerAdapter, typeof (_a = typeof stats_service_1.StatsService !== "undefined" && stats_service_1.StatsService) === "function" ? _a : Object])
], ActivityConsumer);
//# sourceMappingURL=activity.consumer.js.map