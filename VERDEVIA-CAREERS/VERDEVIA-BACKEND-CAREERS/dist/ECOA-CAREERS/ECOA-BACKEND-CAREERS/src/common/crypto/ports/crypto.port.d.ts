export interface CryptoPort {
    encrypt(plaintext: string, key: Buffer): {
        iv: string;
        authTag: string;
        ciphertext: string;
    };
    decrypt(ciphertext: string, iv: string, authTag: string, key: Buffer): string;
}
