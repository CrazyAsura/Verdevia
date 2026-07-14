"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionTransformer = exports.CryptoUtil = void 0;
const crypto = require("crypto");
class CryptoUtil {
    static algorithm = 'aes-256-gcm';
    static key = crypto.scryptSync(process.env.APP_SECRET || 'default-secret-key-32-chars-long!!!', 'salt', 32);
    static encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }
    static decrypt(encryptedData) {
        const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
exports.CryptoUtil = CryptoUtil;
exports.EncryptionTransformer = {
    to: (value) => (value ? CryptoUtil.encrypt(value) : value),
    from: (value) => (value ? CryptoUtil.decrypt(value) : value),
};
//# sourceMappingURL=crypto.util.js.map