import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // user ID
  id?: string;
  userName: string;
  email?: string;
  role?: string;
  roles?: string[];
  plan?: string;
  subscriptionStatus?: string;
  iat?: number;
  exp?: number;
}

/**
 * JwtStrategy — Passport strategy for JWT Bearer token validation.
 *
 * Extracts token from Authorization header (Bearer scheme).
 * Validates signature with JWT_SECRET.
 * Returns payload which NestJS injects as `request.user`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'fallback-dev-secret',
      // Additional hardening: validate audience and issuer
      audience: config.get<string>('JWT_AUDIENCE') ?? 'VERDEVIA-app',
      issuer: config.get<string>('JWT_ISSUER') ?? 'VERDEVIA-backend',
    });
  }

  /**
   * Called after Passport verifies the JWT signature.
   * Return value becomes `req.user` in the request context.
   */
  validate(payload: JwtPayload): JwtPayload {
    return {
      sub: payload.sub,
      id: payload.sub,
      userName: payload.userName,
      email: payload.email,
      role: payload.role,
      roles: payload.roles ?? [],
      plan: payload.plan,
      subscriptionStatus: payload.subscriptionStatus,
    };
  }
}
