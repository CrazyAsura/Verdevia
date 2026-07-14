import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { XssSanitizerInterceptor } from './common/security/xss-sanitizer.interceptor';
import helmet from 'helmet';
import * as compression from 'compression';
import * as express from 'express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Log only warnings and errors in production
    logger:
      process.env.NODE_ENV === 'production'
        ? ['warn', 'error']
        : ['log', 'debug', 'error', 'verbose', 'warn'],
  });

  const isProd = process.env.NODE_ENV === 'production';

  // ── Helmet — HTTP Security Headers ─────────────────────────────────────────
  // Protects against: XSS, clickjacking, MIME sniffing, info leakage, etc.
  app.use(
    helmet({
      // Content Security Policy
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
        : false, // Disable CSP in dev (prevents playground issues)
      // HTTP Strict Transport Security: force HTTPS for 1 year
      hsts: isProd
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      // Prevents MIME type sniffing
      noSniff: true,
      // Block site from being framed (clickjacking protection)
      frameguard: { action: 'deny' },
      // Disable X-Powered-By (don't reveal tech stack)
      hidePoweredBy: true,
      // XSS filter for legacy browsers
      xssFilter: true,
      // Cross-Origin policies
      crossOriginEmbedderPolicy: isProd,
      crossOriginOpenerPolicy: isProd ? { policy: 'same-origin' } : false,
      crossOriginResourcePolicy: isProd ? { policy: 'same-origin' } : false,
      // Referrer Policy: don't leak URLs to third parties
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // ── Compression (gzip) ─────────────────────────────────────────────────────
  app.use(compression());

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // ── CORS — Hardened with explicit origin whitelist ──────────────────────────
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:8081', // Expo Web (dev)
    'http://localhost:19006', // Expo Web (legacy)
    'https://ECOA.vercel.app',
    'https://ECOA-green.vercel.app',
    'https://localhost',
    'https://127.0.0.1',
    ...(process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? []),
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (native mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      // Allow local network and localhost in development (both HTTP and HTTPS)
      if (!isProd) {
        if (
          origin.startsWith('http://localhost:') ||
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
          origin.startsWith('https://172.')
        ) {
          return callback(null, true);
        }
      }
      // Allow ngrok tunnels in development (avoids CORS loop when URL rotates)
      if (
        !isProd &&
        (origin?.endsWith('.ngrok-free.app') ||
          origin?.endsWith('.ngrok-free.dev'))
      )
        return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
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
    maxAge: 86400, // Preflight cache 24h
  });

  // ── Global Validation Pipe ─────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Auto-transform types
      disableErrorMessages: isProd, // Don't expose validation details in prod
    }),
  );

  // ── Global XSS Sanitizer ───────────────────────────────────────────────────
  app.useGlobalInterceptors(new XssSanitizerInterceptor());

  // ── Swagger (disabled in production) ──────────────────────────────────────
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('ECOA API')
      .setDescription('Plataforma de conscientização e denúncia ambiental')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Complaints')
      .addTag('Users')
      .addTag('Forum')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // ── Server ─────────────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3333;
  await app.listen(port);

  console.log(
    `\x1b[32m[ECOA]\x1b[0m Backend running on: http://localhost:${port}`,
  );
  console.log(
    `\x1b[32m[ECOA]\x1b[0m GraphQL playground: http://localhost:${port}/graphql`,
  );
  if (!isProd) {
    console.log(
      `\x1b[32m[ECOA]\x1b[0m Swagger docs: http://localhost:${port}/api/docs`,
    );
  }
  console.log(
    `\x1b[33m[ECOA]\x1b[0m Environment: ${process.env.NODE_ENV ?? 'development'}`,
  );
  console.log(
    `\x1b[33m[ECOA]\x1b[0m Security: Helmet ✅ | CORS ✅ | Rate Limit ✅ | XSS Guard ✅ | AES-256 ✅`,
  );
}

bootstrap();
