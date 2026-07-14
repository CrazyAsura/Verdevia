import { Injectable } from '@nestjs/common';
import { CompressionPort } from '../ports/compression.port';
import { deflateRaw, inflateRaw } from 'zlib';
import { promisify } from 'util';

const deflateAsync = promisify(deflateRaw);
const inflateAsync = promisify(inflateRaw);

@Injectable()
export class ZlibCompressionAdapter implements CompressionPort {
  async compress(data: string): Promise<Buffer> {
    return deflateAsync(Buffer.from(data, 'utf8'));
  }

  async decompress(compressed: Buffer): Promise<string> {
    const decompressed = await inflateAsync(compressed);
    return decompressed.toString('utf8');
  }
}
