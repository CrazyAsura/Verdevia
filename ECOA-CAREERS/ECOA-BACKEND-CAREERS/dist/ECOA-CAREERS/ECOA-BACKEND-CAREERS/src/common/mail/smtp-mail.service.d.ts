import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
export declare class SmtpMailService {
    private readonly config;
    private readonly jwtService;
    constructor(config: ConfigService, jwtService: JwtService);
    sendPasswordReset(email: string, displayName?: string, portal?: string): Promise<{
        token: any;
    }>;
    private sendMail;
    private connect;
    private authenticate;
    private deliver;
    private buildMessage;
    private command;
    private expect;
    private extractEmail;
    private encodeHeader;
    private escapeHtml;
}
