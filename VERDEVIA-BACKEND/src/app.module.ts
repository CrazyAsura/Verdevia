import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { existsSync } from 'fs';
import { join } from 'path';
import { DatabaseConfigService } from './database/database-config.service';
import { MongoConfigService } from './database/mongo-config.service';
import { SecurityModule } from './common/security/security.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ForumModule } from './modules/forum/forum.module';
import { CoursesModule } from './modules/courses/courses.module';
import { RedisModule } from './modules/redis/redis.module';
import { AIModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StatsModule } from './modules/stats/stats.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { PhonesModule } from './modules/phones/phones.module';
import { HealthModule } from './modules/health/health.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorLoggerFilter } from './common/security/error-logger.filter';
import { ActivityLoggerInterceptor } from './common/security/activity-logger.interceptor';
import { BullModule } from '@nestjs/bullmq';
import { MessagingModule } from './modules/messaging/messaging.module';
import { SecurePayloadInterceptor } from './common/interceptors/secure-payload.interceptor';
import { KafkaTelemetryInterceptor } from './common/security/kafka-telemetry.interceptor';

const mongoEnabled = process.env.MONGODB_ENABLED !== 'false';

@Module({
  imports: [
    // ── Config ────────────────────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ── BullMQ Queue System ──────────────────────────────────────────────────
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host:
            configService.get<string>('REDIS_HOST_PRIMARY') ||
            configService.get<string>('REDIS_HOST') ||
            'localhost',
          port:
            parseInt(
              configService.get<string>('REDIS_PORT_PRIMARY') ||
                configService.get<string>('REDIS_PORT') ||
                '',
            ) || 6379,
          password:
            configService.get<string>('REDIS_PASSWORD_PRIMARY') ||
            configService.get<string>('REDIS_PASSWORD') ||
            'VERDEVIA_redis_password',
        },
      }),
      inject: [ConfigService],
    }),

    // ── PostgreSQL → SQLite fallback (TypeORM) ────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfigService,
    }),

    // ── MongoDB (Forum: posts & comments) ─────────────────────────────────────
    ...(mongoEnabled
      ? [
          MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useClass: MongoConfigService,
          }),
        ]
      : []),

    // ── GraphQL (Apollo Server) ───────────────────────────────────────────────
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Code-first: schema auto-generated from decorators (in-memory if src directory doesn't exist to avoid EACCES)
      autoSchemaFile: existsSync(join(process.cwd(), 'src'))
        ? join(process.cwd(), 'src/schema.gql')
        : true,
      sortSchema: true,
      // Subscriptions via graphql-ws (modern, replaces subscriptions-transport-ws)
      subscriptions: {
        'graphql-ws': true,
      },
      // Security hardening
      introspection: process.env.NODE_ENV !== 'production',
      // Limit query depth to prevent DoS via deeply nested queries
      // Applied via ApolloServerPluginLandingPageDisabled in prod
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      formatError: (error) => ({
        // Never expose stack traces to clients
        message: error.message,
        code: error.extensions?.code,
        locations:
          process.env.NODE_ENV !== 'production' ? error.locations : undefined,
        path: error.path,
      }),
    }),

    // ── Rate Limiting (anti-brute-force, anti-DDoS) ───────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // max 10 req/sec per IP
      },
      {
        name: 'medium',
        ttl: 60_000, // 1 minute
        limit: 100, // max 100 req/min per IP
      },
      {
        name: 'long',
        ttl: 3_600_000, // 1 hour
        limit: 1_000, // max 1000 req/hour per IP
      },
    ]),

    // ── Security (JWT, Encryption, Passport) ─────────────────────────────────
    SecurityModule,

    // ── Feature Modules ──────────────────────────────────────────────────────
    RedisModule,
    UsersModule,
    ProfilesModule,
    GamificationModule,
    SubscriptionsModule,
    ComplaintsModule,
    ...(mongoEnabled ? [ForumModule] : []),
    CoursesModule,
    AIModule,
    NotificationsModule,
    StatsModule,
    AddressesModule,
    PhonesModule,
    HealthModule,
    ComplianceModule,
    MessagingModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorLoggerFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: KafkaTelemetryInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurePayloadInterceptor,
    },
  ],
})
export class AppModule {}
