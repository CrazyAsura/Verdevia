/**
 * Mock Redis client for demonstration.
 * In a real Next.js app, you would use 'ioredis' or '@upstash/redis'.
 */

class MockRedis {
  private cache: Map<string, { value: unknown; expiry: number }> = new Map();

  async get(key: string): Promise<unknown | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    console.log(`[Redis] Cache HIT: ${key}`);
    return item.value;
  }

  async set(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
    console.log(`[Redis] Cache SET: ${key}`);
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

export const redis = new MockRedis();
