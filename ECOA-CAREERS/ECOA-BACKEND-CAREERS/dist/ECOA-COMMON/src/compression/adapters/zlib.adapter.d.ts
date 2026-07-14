import { CompressionPort } from '../ports/compression.port';
export declare class ZlibCompressionAdapter implements CompressionPort {
    compress(data: string): Promise<Buffer>;
    decompress(compressed: Buffer): Promise<string>;
}
