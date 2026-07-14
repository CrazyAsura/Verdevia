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
exports.MongoConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let MongoConfigService = class MongoConfigService {
    configService;
    logger = new common_1.Logger('MongoConfig');
    constructor(configService) {
        this.configService = configService;
    }
    createMongooseOptions() {
        const atlasUri = this.configService.get('MONGODB_URI_ATLAS');
        const localUri = this.configService.get('MONGODB_URI') ||
            'mongodb://localhost:27017/ECOA';
        const uri = atlasUri || localUri;
        this.logger.log(`🍃 Connecting to MongoDB: ${this.sanitizeUri(uri)}`);
        return {
            uri,
            connectionFactory: (connection) => {
                connection.on('connected', () => {
                    this.logger.log('✅ MongoDB connected successfully');
                });
                connection.on('disconnected', () => {
                    this.logger.warn('⚠️  MongoDB disconnected — Forum features may be degraded');
                });
                connection.on('error', (err) => {
                    this.logger.error(`❌ MongoDB connection error: ${err.message}`);
                });
                return connection;
            },
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            readPreference: 'secondaryPreferred',
        };
    }
    sanitizeUri(uri) {
        try {
            const url = new URL(uri);
            url.password = '***';
            url.username = url.username ? '***' : '';
            return url.toString();
        }
        catch {
            return uri.replace(/\/\/.*@/, '//*:*@');
        }
    }
};
exports.MongoConfigService = MongoConfigService;
exports.MongoConfigService = MongoConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], MongoConfigService);
//# sourceMappingURL=mongo-config.service.js.map