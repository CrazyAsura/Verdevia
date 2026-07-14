import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';
import { Application } from '../modules/applications/entities/application.entity';
import { Candidate } from '../modules/candidates/entities/candidate.entity';
import { Job } from '../modules/jobs/entities/job.entity';

const CAREERS_ENTITIES = [Job, Candidate, Application];

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  private readonly logger = new Logger('DatabaseConfig');

  constructor(private readonly configService: ConfigService) {}

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const dbHost = this.configService.get<string>('DB_HOST') || 'localhost';
    const dbPort = parseInt(
      this.configService.get<string>('DB_PORT') || '5432',
    );
    const dbUrl = this.configService.get<string>('DATABASE_URL');

    // Se temos dados de Postgres, tentamos verificar se o serviço está ONLINE
    if (dbUrl || (dbHost && dbPort)) {
      const isPostgresAlive = await this.probeConnection(dbHost, dbPort);

      if (isPostgresAlive) {
        this.logger.log('🐘 PostgreSQL detectado e online. Conectando...');
        return {
          type: 'postgres',
          url: dbUrl,
          host: dbHost,
          port: dbPort,
          username: this.configService.get<string>('DB_USERNAME') || 'postgres',
          password: this.configService.get<string>('DB_PASSWORD') || 'postgres',
          database: this.configService.get<string>('DB_NAME') || 'ECOA',
          entities: CAREERS_ENTITIES,
          synchronize: true,
          logging: false,
          ssl: dbUrl ? { rejectUnauthorized: false } : false,
        };
      } else {
        this.logger.warn(`⚠️ PostgreSQL não respondeu em ${dbHost}:${dbPort}`);
        this.logger.warn(
          '🔄 Redirecionando para SQLite para evitar travamento da aplicação.',
        );
      }
    }

    return {
      type: 'sqlite',
      database: 'database.sqlite',
      entities: CAREERS_ENTITIES,
      synchronize: true,
      logging: false,
    };
  }

  private probeConnection(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(2000);

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, host);
    });
  }
}
