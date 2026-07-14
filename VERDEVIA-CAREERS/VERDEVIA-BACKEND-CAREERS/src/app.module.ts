import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { DatabaseConfigService } from './database/database-config.service';
import { SecurityModule } from './common/security/security.module';
import { RedisModule } from './modules/redis/redis.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SecurePayloadInterceptor } from './common/interceptors/secure-payload.interceptor';

import { JobsModule } from './modules/jobs/jobs.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { ApplicationsModule } from './modules/applications/applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfigService,
    }),

    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        path: join(process.cwd(), 'src/schema.gql'),
        federation: 2,
      },
      sortSchema: true,
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
    JobsModule,
    CandidatesModule,
    ApplicationsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurePayloadInterceptor,
    },
  ],
})
export class AppModule {}
