"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const encryption_service_1 = require("./encryption.service");
const jwt_strategy_1 = require("./jwt.strategy");
const aes_gcm_adapter_1 = require("../crypto/adapters/aes-gcm.adapter");
const zlib_adapter_1 = require("../compression/adapters/zlib.adapter");
const key_exchange_controller_1 = require("../crypto/controllers/key-exchange.controller");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const jwtSecret = config.get('JWT_SECRET') || 'fallback-dev-secret';
                    const jwtConfig = {
                        secret: jwtSecret,
                        signOptions: {
                            expiresIn: config.get('JWT_EXPIRATION') ?? '7d',
                            audience: config.get('JWT_AUDIENCE') ?? 'ECOA-app',
                            issuer: config.get('JWT_ISSUER') ?? 'ECOA-backend',
                            algorithm: 'HS256',
                        },
                    };
                    return jwtConfig;
                },
            }),
        ],
        controllers: [key_exchange_controller_1.KeyExchangeController],
        providers: [
            encryption_service_1.EncryptionService,
            jwt_strategy_1.JwtStrategy,
            aes_gcm_adapter_1.AesGcmCryptoAdapter,
            zlib_adapter_1.ZlibCompressionAdapter,
        ],
        exports: [
            encryption_service_1.EncryptionService,
            jwt_1.JwtModule,
            passport_1.PassportModule,
            aes_gcm_adapter_1.AesGcmCryptoAdapter,
            zlib_adapter_1.ZlibCompressionAdapter,
        ],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map