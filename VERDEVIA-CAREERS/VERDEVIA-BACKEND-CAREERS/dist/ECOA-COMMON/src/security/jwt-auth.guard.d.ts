import { ExecutionContext } from '@nestjs/common';
declare const JwtAuthGuard_base: any;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    getRequest(context: ExecutionContext): any;
    handleRequest<TUser>(err: Error, user: TUser): TUser;
}
declare const OptionalJwtAuthGuard_base: any;
export declare class OptionalJwtAuthGuard extends OptionalJwtAuthGuard_base {
    getRequest(context: ExecutionContext): any;
    handleRequest<TUser>(_err: Error, user: TUser): TUser;
}
export declare const CurrentUser: any;
export {};
