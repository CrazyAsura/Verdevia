export declare class CryptoUtil {
    private static readonly algorithm;
    private static readonly key;
    static encrypt(text: string): string;
    static decrypt(encryptedData: string): string;
}
export declare const EncryptionTransformer: {
    to: (value: string) => string;
    from: (value: string) => string;
};
