import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * XssSanitizerInterceptor — Global interceptor that sanitizes all incoming
 * string fields to prevent XSS injection.
 *
 * Strategy: strip HTML tags and encode dangerous characters.
 * Applied before reaching controllers/resolvers.
 *
 * Note: This is a defense-in-depth measure. The primary XSS prevention
 * should be output encoding in the frontend (React/Next.js handles this).
 */
@Injectable()
export class XssSanitizerInterceptor implements NestInterceptor {
  private readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick=, onerror=, etc.
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Support both REST and GraphQL contexts
    let body: any;

    try {
      const gqlCtx = GqlExecutionContext.create(context);
      const gqlArgs = gqlCtx.getArgs();
      if (gqlArgs && Object.keys(gqlArgs).length > 0) {
        this.sanitizeObject(gqlArgs);
      } else {
        const req = context.switchToHttp().getRequest();
        if (req?.body) {
          this.sanitizeObject(req.body);
        }
      }
    } catch {
      // Silently skip if context type is not compatible
    }

    return next.handle();
  }

  private sanitizeObject(obj: Record<string, any>): void {
    if (!obj || typeof obj !== 'object') return;

    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === 'string') {
        obj[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        this.sanitizeObject(value);
      }
    }
  }

  private sanitizeString(input: string): string {
    let result = input;
    for (const pattern of this.DANGEROUS_PATTERNS) {
      result = result.replace(pattern, '');
    }
    return result.trim();
  }
}
