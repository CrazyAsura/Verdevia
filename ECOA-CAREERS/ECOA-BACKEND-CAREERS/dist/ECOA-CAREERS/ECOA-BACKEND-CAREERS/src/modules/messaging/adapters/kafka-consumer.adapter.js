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
exports.KafkaConsumerAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kafkajs_1 = require("kafkajs");
let KafkaConsumerAdapter = class KafkaConsumerAdapter {
    configService;
    logger = new common_1.Logger('KafkaConsumerManager');
    kafka;
    consumers = [];
    registrations = [];
    isRunning = false;
    constructor(configService) {
        this.configService = configService;
        const brokersRaw = this.configService.get('KAFKA_BROKERS', 'localhost:9092');
        const brokers = brokersRaw.split(',');
        const clientId = this.configService.get('KAFKA_CLIENT_ID', 'ECOA-backend');
        this.kafka = new kafkajs_1.Kafka({
            clientId: `${clientId}-consumer`,
            brokers,
            retry: {
                initialRetryTime: 300,
                retries: 5,
            },
        });
    }
    register(topic, groupId, handler) {
        if (this.isRunning) {
            throw new Error('Cannot register consumer after startup.');
        }
        this.registrations.push({ topic, groupId, handler });
        this.logger.log(`Registered handler for topic "${topic}" with Group ID "${groupId}"`);
    }
    async onApplicationBootstrap() {
        const enabled = this.configService.get('KAFKA_CONSUMER_ENABLED', 'true') ===
            'true';
        if (!enabled) {
            this.logger.log('Kafka Consumer loops are disabled (KAFKA_CONSUMER_ENABLED=false). Skipping.');
            return;
        }
        if (this.registrations.length === 0) {
            this.logger.log('No consumers registered. Skipping startup.');
            return;
        }
        this.isRunning = true;
        this.logger.log(`Starting ${this.registrations.length} Kafka consumers...`);
        for (const reg of this.registrations) {
            const consumer = this.kafka.consumer({ groupId: reg.groupId });
            this.consumers.push(consumer);
            let connected = false;
            let attempts = 0;
            const maxAttempts = 5;
            const delayMs = 5000;
            while (!connected && attempts < maxAttempts) {
                try {
                    attempts++;
                    await consumer.connect();
                    await consumer.subscribe({ topic: reg.topic, fromBeginning: false });
                    await consumer.run({
                        eachMessage: async ({ message }) => {
                            if (!message.value)
                                return;
                            try {
                                const valueStr = message.value.toString();
                                const payload = JSON.parse(valueStr);
                                await reg.handler(payload);
                            }
                            catch (err) {
                                this.logger.error(`Error processing message from topic "${reg.topic}": ${err.message}`);
                            }
                        },
                    });
                    this.logger.log(`🚀 Consumer group "${reg.groupId}" listening on topic "${reg.topic}"`);
                    connected = true;
                }
                catch (error) {
                    this.logger.warn(`⚠️ Attempt ${attempts}/${maxAttempts} failed to start consumer for topic "${reg.topic}": ${error.message}. Retrying in ${delayMs / 1000}s...`);
                    if (attempts < maxAttempts) {
                        await new Promise((resolve) => setTimeout(resolve, delayMs));
                    }
                    else {
                        this.logger.error(`❌ Max attempts reached. Failed to start consumer for topic "${reg.topic}".`);
                    }
                }
            }
        }
    }
    async onApplicationShutdown() {
        this.logger.log('Shutting down Kafka consumers...');
        for (const consumer of this.consumers) {
            try {
                await consumer.disconnect();
            }
            catch (err) {
                this.logger.error(`Error disconnecting consumer: ${err.message}`);
            }
        }
    }
};
exports.KafkaConsumerAdapter = KafkaConsumerAdapter;
exports.KafkaConsumerAdapter = KafkaConsumerAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], KafkaConsumerAdapter);
//# sourceMappingURL=kafka-consumer.adapter.js.map