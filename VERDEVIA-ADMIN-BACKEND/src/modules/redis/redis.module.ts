import { Module, Global, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const logger = new Logger('Redis');

        const primaryConfig = {
          host:
            process.env.REDIS_HOST_PRIMARY ||
            process.env.REDIS_HOST ||
            'localhost',
          port:
            parseInt(
              process.env.REDIS_PORT_PRIMARY || process.env.REDIS_PORT || '',
            ) || 6379,
          password:
            process.env.REDIS_PASSWORD_PRIMARY ||
            process.env.REDIS_PASSWORD ||
            'VERDEVIA_redis_password',
        };

        const secondaryConfig = {
          host: process.env.REDIS_HOST_SECONDARY || 'localhost',
          port: 6379,
          password:
            process.env.REDIS_PASSWORD_SECONDARY || 'VERDEVIA_redis_password',
        };

        const tryConnect = (config: any, isPrimary: boolean) => {
          return new Promise((resolve) => {
            const client = new Redis({
              ...config,
              lazyConnect: true,
              maxRetriesPerRequest: 0,
              connectTimeout: 2000,
            });

            client.on('error', (err) => {
              // Silently catch error event to prevent Node unhandled exception/hang
            });

            client
              .connect()
              .then(() => {
                logger.log(
                  `✅ Conectado ao Redis ${isPrimary ? 'Primário' : 'Secundário'} (${config.host})`,
                );
                resolve(client);
              })
              .catch(() => {
                logger.warn(
                  `❌ Falha na conexão com Redis ${isPrimary ? 'Primário' : 'Secundário'} (${config.host})`,
                );
                client.disconnect();
                resolve(null);
              });
          });
        };

        // Tenta Primário
        let activeClient = await tryConnect(primaryConfig, true);

        // Se falhar, tenta Secundário (Local Docker)
        if (!activeClient) {
          logger.log('🔄 Iniciando Failover para Redis Secundário...');
          activeClient = await tryConnect(secondaryConfig, false);
        }

        if (!activeClient) {
          logger.error(
            '🚨 TODOS OS SERVIÇOS REDIS ESTÃO OFFLINE. O sistema operará sem Cache/Sessão persistente.',
          );
          // Retorna um cliente "dummy" ou null dependendo de como o resto da app lida
          return new Redis({
            host: 'localhost',
            port: 6379,
            lazyConnect: true,
          });
        }

        return activeClient;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
