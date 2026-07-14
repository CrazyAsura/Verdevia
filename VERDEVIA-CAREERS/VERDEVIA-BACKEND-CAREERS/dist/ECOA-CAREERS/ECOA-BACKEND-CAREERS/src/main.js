"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const xss_sanitizer_interceptor_1 = require("./common/security/xss-sanitizer.interceptor");
const helmet_1 = require("helmet");
const compression = require("compression");
const express = require("express");
const fs_1 = require("fs");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: process.env.NODE_ENV === 'production'
            ? ['warn', 'error']
            : ['log', 'debug', 'error', 'verbose', 'warn'],
    });
    const isProd = process.env.NODE_ENV === 'production';
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: isProd
            ? {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                    upgradeInsecureRequests: [],
                },
            }
            : false,
        hsts: isProd
            ? { maxAge: 31536000, includeSubDomains: true, preload: true }
            : false,
        noSniff: true,
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        xssFilter: true,
        crossOriginEmbedderPolicy: isProd,
        crossOriginOpenerPolicy: isProd ? { policy: 'same-origin' } : false,
        crossOriginResourcePolicy: isProd ? { policy: 'same-origin' } : false,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }));
    app.use(compression());
    const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
    if (!(0, fs_1.existsSync)(uploadsDir)) {
        (0, fs_1.mkdirSync)(uploadsDir, { recursive: true });
    }
    app.use('/uploads', express.static(uploadsDir));
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://localhost:8081',
        'http://localhost:19006',
        'https://ECOA.vercel.app',
        'https://ECOA-green.vercel.app',
        'https://localhost',
        'https://127.0.0.1',
        ...(process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? []),
    ].filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (!isProd) {
                if (origin.startsWith('http://localhost:') ||
                    origin.startsWith('https://localhost:') ||
                    origin.startsWith('https://localhost') ||
                    origin.startsWith('http://127.0.0.1:') ||
                    origin.startsWith('https://127.0.0.1:') ||
                    origin.startsWith('https://127.0.0.1') ||
                    origin.startsWith('http://192.168.') ||
                    origin.startsWith('https://192.168.') ||
                    origin.startsWith('http://10.') ||
                    origin.startsWith('https://10.') ||
                    origin.startsWith('http://172.') ||
                    origin.startsWith('https://172.')) {
                    return callback(null, true);
                }
            }
            if (!isProd &&
                (origin?.endsWith('.ngrok-free.app') ||
                    origin?.endsWith('.ngrok-free.dev')))
                return callback(null, true);
            if (allowedOrigins.includes(origin))
                return callback(null, true);
            callback(new Error(`CORS: Origin '${origin}' not allowed`));
        },
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: [
            'Content-Type',
            'Accept',
            'Authorization',
            'ngrok-skip-browser-warning',
            'X-Request-ID',
            'x-session-token',
            'x-iv',
            'x-auth-tag',
            'X-Session-Token',
            'X-IV',
            'X-Auth-Tag',
        ],
        exposedHeaders: [
            'X-Request-ID',
            'x-session-token',
            'x-iv',
            'x-auth-tag',
            'X-Session-Token',
            'X-IV',
            'X-Auth-Tag',
        ],
        maxAge: 86400,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: isProd,
    }));
    app.useGlobalInterceptors(new xss_sanitizer_interceptor_1.XssSanitizerInterceptor());
    if (!isProd) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('ECOA API')
            .setDescription('Plataforma de conscientização e denúncia ambiental')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('Complaints')
            .addTag('Users')
            .addTag('Forum')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    const port = process.env.PORT ?? process.env.BACKEND_PORT ?? 3339;
    await app.listen(port);
    console.log(`\x1b[32m[ECOA]\x1b[0m Backend running on: http://localhost:${port}`);
    console.log(`\x1b[32m[ECOA]\x1b[0m GraphQL playground: http://localhost:${port}/graphql`);
    if (!isProd) {
        console.log(`\x1b[32m[ECOA]\x1b[0m Swagger docs: http://localhost:${port}/api/docs`);
    }
    console.log(`\x1b[33m[ECOA]\x1b[0m Environment: ${process.env.NODE_ENV ?? 'development'}`);
    console.log(`\x1b[33m[ECOA]\x1b[0m Security: Helmet ✅ | CORS ✅ | Rate Limit ✅ | XSS Guard ✅ | AES-256 ✅`);
}
bootstrap();
//# sourceMappingURL=main.js.map