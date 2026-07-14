import { EncryptionService } from '../../security/encryption.service';
export declare class KeyExchangeController {
    private readonly encryptionService;
    constructor(encryptionService: EncryptionService);
    handshake(body: {
        clientPublicKey: string;
    }): {
        serverPublicKey: any;
        sessionToken: string;
    };
}
