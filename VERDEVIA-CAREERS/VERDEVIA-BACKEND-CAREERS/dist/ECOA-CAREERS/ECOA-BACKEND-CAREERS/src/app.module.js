"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const throttler_1 = require("@nestjs/throttler");
const path_1 = require("path");
const database_config_service_1 = require("./database/database-config.service");
const security_module_1 = require("./common/security/security.module");
const redis_module_1 = require("./modules/redis/redis.module");
const core_1 = require("@nestjs/core");
const error_logger_filter_1 = require("./common/security/error-logger.filter");
const activity_logger_interceptor_1 = require("./common/security/activity-logger.interceptor");
const secure_payload_interceptor_1 = require("./common/interceptors/secure-payload.interceptor");
const kafka_telemetry_interceptor_1 = require("./common/security/kafka-telemetry.interceptor");
const messaging_module_1 = require("./modules/messaging/messaging.module");
const jobs_module_1 = require("./modules/jobs/jobs.module");
const candidates_module_1 = require("./modules/candidates/candidates.module");
const applications_module_1 = require("./modules/applications/applications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useClass: database_config_service_1.DatabaseConfigService,
            }),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloFederationDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                sortSchema: true,
                introspection: true,
                context: ({ req, res }) => ({
                    req,
                    res,
                }),
                formatError: (error) => ({
                    message: error.message,
                    code: error.extensions?.code,
                    locations: process.env.NODE_ENV !== 'production' ? error.locations : undefined,
                    path: error.path,
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([
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
            security_module_1.SecurityModule,
            redis_module_1.RedisModule,
            messaging_module_1.MessagingModule,
            jobs_module_1.JobsModule,
            candidates_module_1.CandidatesModule,
            applications_module_1.ApplicationsModule,
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: error_logger_filter_1.ErrorLoggerFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: activity_logger_interceptor_1.ActivityLoggerInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: kafka_telemetry_interceptor_1.KafkaTelemetryInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: secure_payload_interceptor_1.SecurePayloadInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map