import { x25519 } from '@noble/curves/ed25519.js';
import { gcm } from '@noble/ciphers/aes.js';
import { deflateSync, inflateSync, strToU8, strFromU8 } from 'fflate';

export class ClientCryptoHelper {
  private ephemeralPrivateKey: Uint8Array;
  public ephemeralPublicKey: Uint8Array;
  private sharedSecret: Uint8Array | null = null;
  private sessionToken: string | null = null;

  constructor() {
    this.ephemeralPrivateKey = x25519.utils.randomSecretKey();
    this.ephemeralPublicKey = x25519.getPublicKey(this.ephemeralPrivateKey);
  }

  setSession(serverPublicKeyHex: string, sessionToken: string) {
    const serverPublicKey = this.hexToBytes(serverPublicKeyHex);
    this.sharedSecret = x25519.getSharedSecret(this.ephemeralPrivateKey, serverPublicKey);
    this.sessionToken = sessionToken;
  }

  hasSession(): boolean {
    return this.sharedSecret !== null && this.sessionToken !== null;
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }

  encryptAndCompress(plaintext: string): { ciphertext: string; iv: string; authTag: string } {
    if (!this.sharedSecret) {
      throw new Error('No active secure session. Perform handshake first.');
    }

    // 1. Compress plaintext
    const plaintextBytes = strToU8(plaintext);
    const compressedBytes = deflateSync(plaintextBytes);

    // 2. Encrypt compressed bytes using AES-GCM
    const iv = this.randomBytes(12);
    const cipher = gcm(this.sharedSecret, iv);
    
    const encryptedWithTag = cipher.encrypt(compressedBytes);
    
    const tagLength = 16;
    const ciphertextBytes = encryptedWithTag.slice(0, -tagLength);
    const authTagBytes = encryptedWithTag.slice(-tagLength);

    return {
      ciphertext: this.bytesToHex(ciphertextBytes),
      iv: this.bytesToHex(iv),
      authTag: this.bytesToHex(authTagBytes),
    };
  }

  decryptAndDecompress(ciphertextHex: string, ivHex: string, authTagHex: string): string {
    if (!this.sharedSecret) {
      throw new Error('No active secure session. Perform handshake first.');
    }

    const ciphertext = this.hexToBytes(ciphertextHex);
    const iv = this.hexToBytes(ivHex);
    const authTag = this.hexToBytes(authTagHex);

    const encryptedWithTag = new Uint8Array(ciphertext.length + authTag.length);
    encryptedWithTag.set(ciphertext);
    encryptedWithTag.set(authTag, ciphertext.length);

    const cipher = gcm(this.sharedSecret, iv);
    const decryptedCompressedBytes = cipher.decrypt(encryptedWithTag);

    const decompressedBytes = inflateSync(decryptedCompressedBytes);
    return strFromU8(decompressedBytes);
  }

  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private randomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(bytes);
    } else if (typeof global !== 'undefined' && (global as any).crypto) {
      (global as any).crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return bytes;
  }
}

export const cryptoHelper = new ClientCryptoHelper();
