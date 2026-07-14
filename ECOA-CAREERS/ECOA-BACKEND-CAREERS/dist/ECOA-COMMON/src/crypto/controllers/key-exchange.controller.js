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
exports.KeyExchangeController = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const encryption_service_1 = require("../../security/encryption.service");
let KeyExchangeController = class KeyExchangeController {
    encryptionService;
    constructor(encryptionService) {
        this.encryptionService = encryptionService;
    }
    handshake(body) {
        const { clientPublicKey } = body;
        if (!clientPublicKey) {
            throw new Error('clientPublicKey is required');
        }
        const { publicKey, privateKey } = (0, crypto_1.generateKeyPairSync)('x25519');
        const clientKeyBuffer = Buffer.from(clientPublicKey, 'hex');
        const x25519SpkiHeader = Buffer.from('302a300506032b656e032100', 'hex');
        const spkiDer = Buffer.concat([x25519SpkiHeader, clientKeyBuffer]);
        const clientPublicKeyObject = (0, crypto_1.createPublicKey)({
            key: spkiDer,
            format: 'der',
            type: 'spki',
        });
        const sharedSecret = (0, crypto_1.diffieHellman)({
            privateKey,
            publicKey: clientPublicKeyObject,
        });
        const serverPublicKeyDer = publicKey.export({
            type: 'spki',
            format: 'der',
        });
        const serverPublicKeyRaw = serverPublicKeyDer.subarray(12);
        const sessionToken = this.encryptionService.encrypt(sharedSecret.toString('hex'));
        return {
            serverPublicKey: serverPublicKeyRaw.toString('hex'),
            sessionToken,
        };
    }
};
exports.KeyExchangeController = KeyExchangeController;
__decorate([
    (0, common_1.Post)('handshake'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KeyExchangeController.prototype, "handshake", null);
exports.KeyExchangeController = KeyExchangeController = __decorate([
    (0, common_1.Controller)('api/security'),
    __metadata("design:paramtypes", [encryption_service_1.EncryptionService])
], KeyExchangeController);
//# sourceMappingURL=key-exchange.controller.js.map