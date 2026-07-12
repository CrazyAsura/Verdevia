import { Injectable } from '@nestjs/common';
import { CryptoPort } from '../ports/crypto.port';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class AesGcmCryptoAdapter implements CryptoPort {
  private readonly ALGORITHM = 'aes-256-gcm';

  encrypt(
    plaintextHex: string,
    key: Buffer,
  ): { iv: string; authTag: string; ciphertext: string } {
    const iv = randomBytes(12); // NIST standard for GCM is 12 bytes
    const cipher = createCipheriv(this.ALGORITHM, key, iv);

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

  decrypt(
    ciphertext: string,
    iv: string,
    authTag: string,
    key: Buffer,
  ): string {
    const decipher = createDecipheriv(
      this.ALGORITHM,
      key,
      Buffer.from(iv, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('hex');
  }
}
