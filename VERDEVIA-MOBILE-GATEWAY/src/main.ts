import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MobileGatewayModule } from './mobile-gateway.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(MobileGatewayModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['warn', 'error']
        : ['log', 'debug', 'error', 'verbose', 'warn'],
  });

  const isProd = process.env.NODE_ENV === 'production';

  app.use(
    helmet({
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
    }),
  );

  app.use(compression());

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:8081',
    'http://localhost:19006',
    'https://verdevia.vercel.app',
    'https://verdevia-green.vercel.app',
    'https://localhost',
    'https://127.0.0.1',
    ...(process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? []),
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
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
    maxAge: 86400,
  });

  const port = process.env.MOBILE_GATEWAY_PORT ?? 3333;
  await app.listen(port);

  console.log(
    `\x1b[35m[MOBILE-GATEWAY]\x1b[0m Federated GraphQL Gateway running on: http://localhost:${port}/graphql`,
  );
}

bootstrap();
