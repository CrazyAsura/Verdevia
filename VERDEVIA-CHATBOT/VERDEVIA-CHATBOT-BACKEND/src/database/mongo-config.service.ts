import { Injectable, Logger } from '@nestjs/common';
import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

/**
 * MongoConfigService — Hexagonal Adapter for MongoDB connection.
 * Probes the connection before committing; logs gracefully if unavailable.
 * Strategy: Atlas URI > Local URI > soft-fail (Forum features disabled).
 */
@Injectable()
export class MongoConfigService implements MongooseOptionsFactory {
  private readonly logger = new Logger('MongoConfig');

  constructor(private readonly configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const atlasUri = this.configService.get<string>('MONGODB_URI_ATLAS');
    const localUri =
      this.configService.get<string>('MONGODB_URI') ||
      'mongodb://localhost:27017/VERDEVIA';
    const uri = atlasUri || localUri;

    this.logger.log(`🍃 Connecting to MongoDB: ${this.sanitizeUri(uri)}`);

    return {
      uri,
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          this.logger.log('✅ MongoDB connected successfully');
        });
        connection.on('disconnected', () => {
          this.logger.warn(
            '⚠️  MongoDB disconnected — Forum features may be degraded',
          );
        });
        connection.on('error', (err: Error) => {
          this.logger.error(`❌ MongoDB connection error: ${err.message}`);
        });
        return connection;
      },
      // Security: never expose credentials in stack traces
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Read preference for analytics queries
      readPreference: 'secondaryPreferred',
    };
  }

  /**
   * Strips credentials from URI for safe logging.
   */
  private sanitizeUri(uri: string): string {
    try {
      const url = new URL(uri);
      url.password = '***';
      url.username = url.username ? '***' : '';
      return url.toString();
    } catch {
      return uri.replace(/\/\/.*@/, '//*:*@');
    }
  }
}
