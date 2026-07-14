import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        gateway: {
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              {
                name: 'mobile-backend',
                url:
                  configService.get<string>('MOBILE_BACKEND_SUBGRAPH_URL') ||
                  'http://localhost:3334/graphql',
              },
              {
                name: 'chatbot-backend',
                url:
                  configService.get<string>('CHATBOT_BACKEND_SUBGRAPH_URL') ||
                  'http://localhost:3337/graphql',
              },
            ],
          }),
          buildService({ url }) {
            return new RemoteGraphQLDataSource({
              url,
              willSendRequest({ request, context }) {
                const req = (context as any).req;
                if (req) {
                  const headersToForward = [
                    'authorization',
                    'x-request-id',
                    'x-session-token',
                    'x-iv',
                    'x-auth-tag',
                    'x-user-id',
                    'x-user-roles',
                  ];
                  for (const header of headersToForward) {
                    const value = req.headers[header];
                    if (value) {
                      request.http.headers.set(header, value as string);
                    }
                  }
                }
              },
            });
          },
        },
        server: {
          introspection: configService.get<string>('NODE_ENV') !== 'production',
          csrfPrevention: true,
          context: ({ req, res }) => ({ req, res }),
        },
      }),
    }),
  ],
})
export class MobileGatewayModule {}
