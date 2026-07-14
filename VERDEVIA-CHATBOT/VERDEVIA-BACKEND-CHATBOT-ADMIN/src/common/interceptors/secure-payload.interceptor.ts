import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { EncryptionService } from '../security/encryption.service';
import { AesGcmCryptoAdapter } from '../crypto/adapters/aes-gcm.adapter';
import { ZlibCompressionAdapter } from '../compression/adapters/zlib.adapter';

@Injectable()
export class SecurePayloadInterceptor implements NestInterceptor {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly cryptoAdapter: AesGcmCryptoAdapter,
    private readonly compressionAdapter: ZlibCompressionAdapter,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    if (context.getType().toString() === 'graphql' || !req?.url) {
      return next.handle();
    }

    // 1. Skip encryption for bootstrap, health and asset routes
    if (
      req.url.includes('/api/security/handshake') ||
      /\/users\/profile\/[^/]+\/photo/.test(req.url) ||
      req.url.includes('/health') ||
      req.url.includes('/api/docs') ||
      req.url.includes('/graphql') ||
      req.url.includes('/metrics/report.pdf') ||
      (req.url.includes('/ai/documents') &&
        String(req.headers['content-type'] ?? '').startsWith('multipart/form-data'))
    ) {
      return next.handle();
    }

    const sessionToken = req.headers['x-session-token'];
    if (!sessionToken) {
      throw new BadRequestException('Missing session token header');
    }

    let sharedSecret: Buffer;
    try {
      const sharedSecretHex = this.encryptionService.decrypt(
        sessionToken as string,
      );
      sharedSecret = Buffer.from(sharedSecretHex, 'hex');
    } catch (error) {
      throw new BadRequestException('Invalid session token');
    }

    const hasRequestBody = req.body && Object.keys(req.body).length > 0;
    if (hasRequestBody) {
      const iv = req.headers['x-iv'];
      const authTag = req.headers['x-auth-tag'];

      if (!iv || !authTag) {
        throw new BadRequestException(
          'Missing security headers x-iv or x-auth-tag',
        );
      }

      try {
        const encryptedPayload = req.body.payload;
        if (!encryptedPayload) {
          throw new BadRequestException('Missing encrypted payload');
        }

        const decryptedBytesHex = this.cryptoAdapter.decrypt(
          encryptedPayload,
          iv as string,
          authTag as string,
          sharedSecret,
        );

        const plaintext = await this.compressionAdapter.decompress(
          Buffer.from(decryptedBytesHex, 'hex'),
        );

        req.body = JSON.parse(plaintext);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'erro desconhecido';
      throw new BadRequestException(
          `Security decryption failed: ${message}`,
      );
    }
    }

    // 6. Handle response encrypt & compress
    return next.handle().pipe(
      mergeMap(async (data) => {
        try {
          const sharedSecretHex = this.encryptionService.decrypt(
            sessionToken as string,
          );
          const sharedSecret = Buffer.from(sharedSecretHex, 'hex');

          // Serialize and compress response data
          const serialized = JSON.stringify(data);
          const compressed = await this.compressionAdapter.compress(serialized);

          // Encrypt compressed bytes
          const encrypted = this.cryptoAdapter.encrypt(
            compressed.toString('hex'),
            sharedSecret,
          );

          // Set response headers
          res.setHeader('x-iv', encrypted.iv);
          res.setHeader('x-auth-tag', encrypted.authTag);

          return { payload: encrypted.ciphertext };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'erro desconhecido';
          throw new BadRequestException(
            `Security encryption failed: ${message}`,
          );
        }
      }),
    );
  }
}
