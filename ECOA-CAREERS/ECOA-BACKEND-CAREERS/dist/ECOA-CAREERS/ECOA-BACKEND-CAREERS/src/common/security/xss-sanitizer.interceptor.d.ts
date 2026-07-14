import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class XssSanitizerInterceptor implements NestInterceptor {
    private readonly DANGEROUS_PATTERNS;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private sanitizeObject;
    private sanitizeString;
}
