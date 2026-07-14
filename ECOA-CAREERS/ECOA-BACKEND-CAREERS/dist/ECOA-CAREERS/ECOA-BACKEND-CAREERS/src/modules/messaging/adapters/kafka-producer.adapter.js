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
exports.KafkaProducerAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kafkajs_1 = require("kafkajs");
let KafkaProducerAdapter = class KafkaProducerAdapter {
    configService;
    logger = new common_1.Logger('KafkaProducer');
    kafka;
    producer = null;
    isConnected = false;
    constructor(configService) {
        this.configService = configService;
        const brokersRaw = this.configService.get('KAFKA_BROKERS', 'localhost:9092');
        const brokers = brokersRaw.split(',');
        const clientId = this.configService.get('KAFKA_CLIENT_ID', 'ECOA-backend');
        this.logger.log(`Initializing Kafka Producer: ClientID="${clientId}", Brokers=${JSON.stringify(brokers)}`);
        this.kafka = new kafkajs_1.Kafka({
            clientId,
            brokers,
            retry: {
                initialRetryTime: 300,
                retries: 5,
            },
        });
    }
    async getProducer() {
        if (!this.producer) {
            this.producer = this.kafka.producer({
                allowAutoTopicCreation: true,
                idempotent: true,
            });
        }
        if (!this.isConnected) {
            try {
                await this.producer.connect();
                this.isConnected = true;
                this.logger.log('✅ Connected to Kafka Broker successfully.');
            }
            catch (error) {
                this.logger.error(`❌ Failed to connect to Kafka Broker: ${error.message}`);
                throw error;
            }
        }
        return this.producer;
    }
    async publish(topic, event) {
        try {
            const producer = await this.getProducer();
            await producer.send({
                topic,
                messages: [
                    {
                        key: event.id,
                        value: JSON.stringify(event),
                        headers: {
                            traceId: event.traceId,
                            timestamp: String(event.timestamp),
                        },
                    },
                ],
            });
        }
        catch (error) {
            this.logger.error(`❌ Failed to publish message to topic "${topic}": ${error.message}`);
            throw error;
        }
    }
    async disconnect() {
        if (this.producer && this.isConnected) {
            try {
                await this.producer.disconnect();
                this.isConnected = false;
                this.logger.log('🔌 Disconnected Kafka Producer cleanly.');
            }
            catch (error) {
                this.logger.error(`❌ Error during Kafka Producer disconnect: ${error.message}`);
            }
        }
    }
    async onApplicationShutdown() {
        await this.disconnect();
    }
};
exports.KafkaProducerAdapter = KafkaProducerAdapter;
exports.KafkaProducerAdapter = KafkaProducerAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], KafkaProducerAdapter);
//# sourceMappingURL=kafka-producer.adapter.js.map