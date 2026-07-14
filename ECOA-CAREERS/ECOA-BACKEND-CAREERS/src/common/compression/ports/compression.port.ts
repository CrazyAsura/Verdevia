export interface CompressionPort {
  compress(data: string): Promise<Buffer>;
  decompress(compressed: Buffer): Promise<string>;
}
