"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AesGcmCryptoAdapter = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let AesGcmCryptoAdapter = class AesGcmCryptoAdapter {
    ALGORITHM = 'aes-256-gcm';
    encrypt(plaintextHex, key) {
        const iv = (0, crypto_1.randomBytes)(12);
        const cipher = (0, crypto_1.createCipheriv)(this.ALGORITHM, key, iv);
        const encrypted = Buffer.concat([
            cipher.update(Buffer.from(plaintextHex, 'hex')),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();
        return {
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            ciphertext: encrypted.toString('hex'),
        };
    }
    decrypt(ciphertext, iv, authTag, key) {
        const decipher = (0, crypto_1.createDecipheriv)(this.ALGORITHM, key, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(ciphertext, 'hex')),
            decipher.final(),
        ]);
        return decrypted.toString('hex');
    }
};
exports.AesGcmCryptoAdapter = AesGcmCryptoAdapter;
exports.AesGcmCryptoAdapter = AesGcmCryptoAdapter = __decorate([
    (0, common_1.Injectable)()
], AesGcmCryptoAdapter);
//# sourceMappingURL=aes-gcm.adapter.js.map