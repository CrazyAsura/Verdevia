import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EncryptionService } from '../security/encryption.service';
import { AesGcmCryptoAdapter } from '../crypto/adapters/aes-gcm.adapter';
import { ZlibCompressionAdapter } from '../compression/adapters/zlib.adapter';
export declare class SecurePayloadInterceptor implements NestInterceptor {
    private readonly encryptionService;
    private readonly cryptoAdapter;
    private readonly compressionAdapter;
    constructor(encryptionService: EncryptionService, cryptoAdapter: AesGcmCryptoAdapter, compressionAdapter: ZlibCompressionAdapter);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
}
