"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const net = require("net");
let DatabaseConfigService = class DatabaseConfigService {
    configService;
    logger = new common_1.Logger('DatabaseConfig');
    constructor(configService) {
        this.configService = configService;
    }
    async createTypeOrmOptions() {
        const dbHost = this.configService.get('DB_HOST') || 'localhost';
        const dbPort = parseInt(this.configService.get('DB_PORT') || '5432');
        const dbUrl = this.configService.get('DATABASE_URL');
        if (dbUrl || (dbHost && dbPort)) {
            const isPostgresAlive = await this.probeConnection(dbHost, dbPort);
            if (isPostgresAlive) {
                this.logger.log('🐘 PostgreSQL detectado e online. Conectando...');
                return {
                    type: 'postgres',
                    url: dbUrl,
                    host: dbHost,
                    port: dbPort,
                    username: this.configService.get('DB_USERNAME') || 'postgres',
                    password: this.configService.get('DB_PASSWORD') || 'postgres',
                    database: this.configService.get('DB_NAME') || 'ECOA',
                    autoLoadEntities: true,
                    synchronize: true,
                    logging: false,
                    ssl: dbUrl ? { rejectUnauthorized: false } : false,
                };
            }
            else {
                this.logger.warn(`⚠️ PostgreSQL não respondeu em ${dbHost}:${dbPort}`);
                this.logger.warn('🔄 Redirecionando para SQLite para evitar travamento da aplicação.');
            }
        }
        return {
            type: 'sqlite',
            database: 'database.sqlite',
            autoLoadEntities: true,
            synchronize: true,
            logging: false,
        };
    }
    probeConnection(host, port) {
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
};
exports.DatabaseConfigService = DatabaseConfigService;
exports.DatabaseConfigService = DatabaseConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], DatabaseConfigService);
//# sourceMappingURL=database-config.service.js.map