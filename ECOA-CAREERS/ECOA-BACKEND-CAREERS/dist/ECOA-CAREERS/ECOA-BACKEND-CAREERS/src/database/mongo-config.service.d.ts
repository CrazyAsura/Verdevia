import { MongooseOptionsFactory, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
export declare class MongoConfigService implements MongooseOptionsFactory {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    createMongooseOptions(): MongooseModuleOptions;
    private sanitizeUri;
}
