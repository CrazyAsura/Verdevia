import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
export declare class DatabaseConfigService implements TypeOrmOptionsFactory {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    createTypeOrmOptions(): Promise<TypeOrmModuleOptions>;
    private probeConnection;
}
