/**
 * In-memory rate limit store
 */

import type { RateLimitStore, TokenBucket } from './types';

interface CacheEntry {
  bucket: TokenBucket;
  expiresAt: number;
}

export class MemoryStore implements RateLimitStore {
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60_000);
  }

  async get(key: string): Promise<TokenBucket | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.bucket;
  }

  async set(key: string, bucket: TokenBucket, ttl: number): Promise<void> {
    this.cache.set(key, {
      bucket,
      expiresAt: Date.now() + ttl
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

/**
 * Default memory store instance
 */
export const defaultStore = new MemoryStore();
