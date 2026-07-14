import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * JwtAuthGuard — Universal guard for REST and GraphQL endpoints.
 *
 * Extends Passport's AuthGuard('jwt') and overrides `getRequest()`
 * to handle both HTTP and GraphQL execution contexts.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)  — on any REST controller or GraphQL resolver
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Override to support GraphQL context extraction.
   * For REST: request is the standard Express Request.
   * For GraphQL: request lives inside context.req.
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    // If this is a GQL operation, extract req from GQL context
    const gqlReq = ctx.getContext<{ req: Request }>()?.req;
    if (gqlReq) return gqlReq;
    // Otherwise it's a standard HTTP request
    return context.switchToHttp().getRequest();
  }

  handleRequest<TUser>(err: Error, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
    return user;
  }
}

/**
 * OptionalJwtAuthGuard — Same as above but does NOT throw on missing token.
 * Useful for public endpoints that optionally personalize based on auth.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlReq = ctx.getContext<{ req: Request }>()?.req;
    if (gqlReq) return gqlReq;
    return context.switchToHttp().getRequest();
  }

  handleRequest<TUser>(_err: Error, user: TUser): TUser {
    // Return user if available, null if not — never throws
    return user;
  }
}

// ─── Param Decorator ─────────────────────────────────────────────────────────

/**
 * @CurrentUser() — Extracts the authenticated user from request.
 *
 * Usage in REST:   @CurrentUser() user: JwtPayload
 * Usage in GQL:    @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const gqlReq = ctx.getContext<{ req: any }>()?.req;
    if (gqlReq) return gqlReq.user;
    return context.switchToHttp().getRequest().user;
  },
);
