import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';
import { JwtStrategy } from './jwt.strategy';
import { AesGcmCryptoAdapter } from '../crypto/adapters/aes-gcm.adapter';
import { ZlibCompressionAdapter } from '../compression/adapters/zlib.adapter';
import { KeyExchangeController } from '../crypto/controllers/key-exchange.controller';

/**
 * SecurityModule — Global security providers.
 *
 * Exports:
 * - EncryptionService (AES-256-GCM)
 * - JwtModule (token signing/verification)
 * - JwtStrategy (Passport integration)
 * - AesGcmCryptoAdapter
 * - ZlibCompressionAdapter
 *
 * Import this module in AppModule with isGlobal: false,
 * then export and import per-module as needed.
 */
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwtSecret =
          config.get<string>('JWT_SECRET') || 'fallback-dev-secret';
        const jwtConfig = {
          secret: jwtSecret,
          signOptions: {
            expiresIn: config.get<string>('JWT_EXPIRATION') ?? '7d',
            audience: config.get<string>('JWT_AUDIENCE') ?? 'VERDEVIA-app',
            issuer: config.get<string>('JWT_ISSUER') ?? 'VERDEVIA-backend',
            algorithm: 'HS256',
          },
        };
        return jwtConfig as any;
      },
    }),
  ],
  controllers: [KeyExchangeController],
  providers: [
    EncryptionService,
    JwtStrategy,
    AesGcmCryptoAdapter,
    ZlibCompressionAdapter,
  ],
  exports: [
    EncryptionService,
    JwtModule,
    PassportModule,
    AesGcmCryptoAdapter,
    ZlibCompressionAdapter,
  ],
})
export class SecurityModule {}
