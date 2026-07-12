import * as crypto from 'crypto';

export class CryptoUtil {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly key = crypto.scryptSync(
    process.env.APP_SECRET || 'default-secret-key-32-chars-long!!!',
    'salt',
    32,
  );

  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  static decrypt(encryptedData: string): string {
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

// TypeORM Transformer for sensitive fields
export const EncryptionTransformer = {
  to: (value: string) => (value ? CryptoUtil.encrypt(value) : value),
  from: (value: string) => (value ? CryptoUtil.decrypt(value) : value),
};
