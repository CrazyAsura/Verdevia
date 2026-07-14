import { CryptoPort } from '../ports/crypto.port';
export declare class AesGcmCryptoAdapter implements CryptoPort {
    private readonly ALGORITHM;
    encrypt(plaintextHex: string, key: Buffer): {
        iv: string;
        authTag: string;
        ciphertext: string;
    };
    decrypt(ciphertext: string, iv: string, authTag: string, key: Buffer): string;
}
