import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

/**
 * EncryptionService — AES-256-GCM symmetric encryption.
 *
 * Algorithm: AES-256-GCM
 * - 256-bit key (32 bytes) derived from ENCRYPTION_KEY env var via scrypt
 * - 12-byte random IV per operation (NIST recommended for GCM)
 * - 16-byte authentication tag (GCM built-in integrity)
 *
 * Output format: iv(24 hex) + ":" + authTag(32 hex) + ":" + ciphertext(hex)
 *
 * Usage:
 *   const enc = service.encrypt('sensitive data');   // "abc...:def...:ghi..."
 *   const dec = service.decrypt(enc);               // "sensitive data"
 */
@Injectable()
export class EncryptionService {
  private readonly key: Buffer;
  private readonly ALGORITHM = 'aes-256-gcm';

  constructor(private readonly config: ConfigService) {
    const rawKey = this.config.get<string>('ENCRYPTION_KEY');
    if (!rawKey) {
      throw new Error('ENCRYPTION_KEY must be set in environment variables');
    }
    // Derive a stable 32-byte key using scrypt KDF
    this.key = scryptSync(rawKey, 'VERDEVIA-salt-v1', 32);
  }

  /**
   * Encrypts plaintext using AES-256-GCM.
   * Returns a self-contained ciphertext string (iv:tag:data).
   */
  encrypt(plaintext: string): string {
    const iv = randomBytes(12); // 96-bit IV for GCM
    const cipher = createCipheriv(this.ALGORITHM, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Decrypts a ciphertext produced by `encrypt()`.
   * Throws if the authentication tag is invalid (tamper detection).
   */
  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format');
    }

    const [ivHex, authTagHex, dataHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');

    const decipher = createDecipheriv(this.ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(data), decipher.final()]).toString(
      'utf8',
    );
  }

  /**
   * Hashes a value with HMAC-SHA256 for deterministic, searchable tokens
   * (e.g., email lookup without storing plaintext).
   */
  hashForLookup(value: string): string {
    const { createHmac } = require('crypto');
    return createHmac('sha256', this.key).update(value).digest('hex');
  }
}
