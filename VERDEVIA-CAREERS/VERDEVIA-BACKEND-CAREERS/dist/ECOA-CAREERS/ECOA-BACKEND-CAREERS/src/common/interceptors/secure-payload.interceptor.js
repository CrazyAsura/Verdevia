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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurePayloadInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const encryption_service_1 = require("../security/encryption.service");
const aes_gcm_adapter_1 = require("../crypto/adapters/aes-gcm.adapter");
const zlib_adapter_1 = require("../compression/adapters/zlib.adapter");
let SecurePayloadInterceptor = class SecurePayloadInterceptor {
    encryptionService;
    cryptoAdapter;
    compressionAdapter;
    constructor(encryptionService, cryptoAdapter, compressionAdapter) {
        this.encryptionService = encryptionService;
        this.cryptoAdapter = cryptoAdapter;
        this.compressionAdapter = compressionAdapter;
    }
    async intercept(context, next) {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        if (context.getType().toString() === 'graphql' || !req?.url) {
            return next.handle();
        }
        if (req.url.includes('/api/security/handshake') ||
            /\/users\/profile\/[^/]+\/photo/.test(req.url) ||
            req.url.includes('/health') ||
            req.url.includes('/api/docs') ||
            req.url.includes('/graphql')) {
            return next.handle();
        }
        const sessionToken = req.headers['x-session-token'];
        if (!sessionToken) {
            throw new common_1.BadRequestException('Missing session token header');
        }
        let sharedSecret;
        try {
            const sharedSecretHex = this.encryptionService.decrypt(sessionToken);
            sharedSecret = Buffer.from(sharedSecretHex, 'hex');
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid session token');
        }
        const hasRequestBody = req.body && Object.keys(req.body).length > 0;
        if (hasRequestBody) {
            const iv = req.headers['x-iv'];
            const authTag = req.headers['x-auth-tag'];
            if (!iv || !authTag) {
                throw new common_1.BadRequestException('Missing security headers x-iv or x-auth-tag');
            }
            try {
                const encryptedPayload = req.body.payload;
                if (!encryptedPayload) {
                    throw new common_1.BadRequestException('Missing encrypted payload');
                }
                const decryptedBytesHex = this.cryptoAdapter.decrypt(encryptedPayload, iv, authTag, sharedSecret);
                const plaintext = await this.compressionAdapter.decompress(Buffer.from(decryptedBytesHex, 'hex'));
                req.body = JSON.parse(plaintext);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'erro desconhecido';
                throw new common_1.BadRequestException(`Security decryption failed: ${message}`);
            }
        }
        return next.handle().pipe((0, operators_1.mergeMap)(async (data) => {
            try {
                const sharedSecretHex = this.encryptionService.decrypt(sessionToken);
                const sharedSecret = Buffer.from(sharedSecretHex, 'hex');
                const serialized = JSON.stringify(data);
                const compressed = await this.compressionAdapter.compress(serialized);
                const encrypted = this.cryptoAdapter.encrypt(compressed.toString('hex'), sharedSecret);
                res.setHeader('x-iv', encrypted.iv);
                res.setHeader('x-auth-tag', encrypted.authTag);
                return { payload: encrypted.ciphertext };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'erro desconhecido';
                throw new common_1.BadRequestException(`Security encryption failed: ${message}`);
            }
        }));
    }
};
exports.SecurePayloadInterceptor = SecurePayloadInterceptor;
exports.SecurePayloadInterceptor = SecurePayloadInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [encryption_service_1.EncryptionService,
        aes_gcm_adapter_1.AesGcmCryptoAdapter,
        zlib_adapter_1.ZlibCompressionAdapter])
], SecurePayloadInterceptor);
//# sourceMappingURL=secure-payload.interceptor.js.map