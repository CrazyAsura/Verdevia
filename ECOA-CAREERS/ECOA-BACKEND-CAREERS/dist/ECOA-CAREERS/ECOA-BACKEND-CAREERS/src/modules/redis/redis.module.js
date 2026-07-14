"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: 'REDIS_CLIENT',
                useFactory: async () => {
                    const logger = new common_1.Logger('Redis');
                    const primaryConfig = {
                        host: process.env.REDIS_HOST_PRIMARY ||
                            process.env.REDIS_HOST ||
                            'localhost',
                        port: parseInt(process.env.REDIS_PORT_PRIMARY || process.env.REDIS_PORT || '') || 6379,
                        password: process.env.REDIS_PASSWORD_PRIMARY ||
                            process.env.REDIS_PASSWORD ||
                            'ECOA_redis_password',
                    };
                    const secondaryConfig = {
                        host: process.env.REDIS_HOST_SECONDARY || 'localhost',
                        port: 6379,
                        password: process.env.REDIS_PASSWORD_SECONDARY || 'ECOA_redis_password',
                    };
                    const tryConnect = (config, isPrimary) => {
                        return new Promise((resolve) => {
                            const client = new ioredis_1.default({
                                ...config,
                                lazyConnect: true,
                                maxRetriesPerRequest: 0,
                                connectTimeout: 2000,
                            });
                            client.on('error', (err) => {
                            });
                            client
                                .connect()
                                .then(() => {
                                logger.log(`✅ Conectado ao Redis ${isPrimary ? 'Primário' : 'Secundário'} (${config.host})`);
                                resolve(client);
                            })
                                .catch(() => {
                                logger.warn(`❌ Falha na conexão com Redis ${isPrimary ? 'Primário' : 'Secundário'} (${config.host})`);
                                client.disconnect();
                                resolve(null);
                            });
                        });
                    };
                    let activeClient = await tryConnect(primaryConfig, true);
                    if (!activeClient) {
                        logger.log('🔄 Iniciando Failover para Redis Secundário...');
                        activeClient = await tryConnect(secondaryConfig, false);
                    }
                    if (!activeClient) {
                        logger.error('🚨 TODOS OS SERVIÇOS REDIS ESTÃO OFFLINE. O sistema operará sem Cache/Sessão persistente.');
                        return new ioredis_1.default({
                            host: 'localhost',
                            port: 6379,
                            lazyConnect: true,
                        });
                    }
                    return activeClient;
                },
            },
        ],
        exports: ['REDIS_CLIENT'],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map