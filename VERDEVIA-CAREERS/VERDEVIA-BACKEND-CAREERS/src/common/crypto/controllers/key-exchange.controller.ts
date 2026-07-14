import { Controller, Post, Body } from '@nestjs/common';
import { generateKeyPairSync, diffieHellman, createPublicKey } from 'crypto';
import { EncryptionService } from '../../security/encryption.service';

@Controller('api/security')
export class KeyExchangeController {
  constructor(private readonly encryptionService: EncryptionService) {}

  @Post('handshake')
  handshake(@Body() body: { clientPublicKey: string }) {
    const { clientPublicKey } = body;
    if (!clientPublicKey) {
      throw new Error('clientPublicKey is required');
    }

    // 1. Generate ephemeral X25519 server keypair
    const { publicKey, privateKey } = generateKeyPairSync('x25519');

    // 2. Import raw 32-byte client public key by prefixing X25519 SPKI DER header (12 bytes)
    const clientKeyBuffer = Buffer.from(clientPublicKey, 'hex');
    const x25519SpkiHeader = Buffer.from('302a300506032b656e032100', 'hex');
    const spkiDer = Buffer.concat([x25519SpkiHeader, clientKeyBuffer]);

    const clientPublicKeyObject = createPublicKey({
      key: spkiDer,
      format: 'der',
      type: 'spki',
    });

    // 3. Compute shared secret (32 bytes)
    const sharedSecret = diffieHellman({
      privateKey,
      publicKey: clientPublicKeyObject,
    });

    // 4. Export server public key to DER and strip the 12-byte header to get the raw 32-byte key
    const serverPublicKeyDer = publicKey.export({
      type: 'spki',
      format: 'der',
    });
    const serverPublicKeyRaw = serverPublicKeyDer.subarray(12);

    // 5. Encrypt shared secret statelessly using the backend's local ENCRYPTION_KEY
    const sessionToken = this.encryptionService.encrypt(
      sharedSecret.toString('hex'),
    );

    return {
      serverPublicKey: serverPublicKeyRaw.toString('hex'),
      sessionToken,
    };
  }
}
