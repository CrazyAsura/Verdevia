import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    sub: string;
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
declare const JwtStrategy_base: any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: JwtPayload): JwtPayload;
}
export {};
