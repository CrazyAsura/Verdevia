import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { DatabaseConfigService } from './database/database-config.service';
import { MongoConfigService } from './database/mongo-config.service';
import { SecurityModule } from './common/security/security.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ForumModule } from './modules/forum/forum.module';
import { CoursesModule } from './modules/courses/courses.module';
import { RedisModule } from './modules/redis/redis.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { PhonesModule } from './modules/phones/phones.module';
import { HealthModule } from './modules/health/health.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorLoggerFilter } from './common/security/error-logger.filter';
import { ActivityLoggerInterceptor } from './common/security/activity-logger.interceptor';
import { BullModule } from '@nestjs/bullmq';
import { SecurePayloadInterceptor } from './common/interceptors/secure-payload.interceptor';
import { KafkaTelemetryInterceptor } from './common/security/kafka-telemetry.interceptor';

// Shell modules for inactive domains
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { StatsModule } from './modules/stats/stats.module';
import { AIModule } from './modules/ai/ai.module';
import { MessagingModule } from './modules/messaging/messaging.module';

const mongoEnabled = process.env.MONGODB_ENABLED !== 'false';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

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
            'ECOA_redis_password',
        },
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfigService,
    }),

    ...(mongoEnabled
      ? [
          MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useClass: MongoConfigService,
          }),
        ]
      : []),

    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      subscriptions: {
        'graphql-ws': true,
      },
      introspection: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      formatError: (error) => ({
        message: error.message,
        code: error.extensions?.code,
        locations:
          process.env.NODE_ENV !== 'production' ? error.locations : undefined,
        path: error.path,
      }),
    }),

    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60_000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 3_600_000,
        limit: 1_000,
      },
    ]),

    SecurityModule,

    // Active Feature Modules
    RedisModule,
    UsersModule,
    ProfilesModule,
    SubscriptionsModule,
    ...(mongoEnabled ? [ForumModule] : []),
    CoursesModule,
    NotificationsModule,
    AddressesModule,
    PhonesModule,
    HealthModule,
    ComplianceModule,

    // Inactive Modules (TypeORM-only shells)
    ComplaintsModule,
    GamificationModule,
    StatsModule,
    AIModule,
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
