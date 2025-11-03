/**
 * Token bucket rate limiter
 */

import type { RateLimitConfig, RateLimitResult, RateLimitStore, TokenBucket } from './types';
import { defaultStore } from './store';

export class RateLimiter {
  private config: Required<RateLimitConfig>;
  private store: RateLimitStore;

  constructor(config: RateLimitConfig, store?: RateLimitStore) {
    this.config = {
      limit: config.limit,
      window: config.window,
      prefix: config.prefix ?? 'rl'
    };
    this.store = store ?? defaultStore;
  }

  /**
   * Check if request is allowed for given identifier
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.prefix}:${identifier}`;
    const now = Date.now();

    // Get current bucket
    let bucket = await this.store.get(key);

    if (!bucket) {
      // First request - create new bucket
      bucket = {
        tokens: this.config.limit - 1,
        lastRefill: now
      };

      await this.store.set(key, bucket, this.config.window);

      return {
        allowed: true,
        limit: this.config.limit,
        remaining: bucket.tokens,
        reset: now + this.config.window
      };
    }

    // Calculate tokens to refill based on elapsed time
    const elapsed = now - bucket.lastRefill;
    const refillAmount = Math.floor((elapsed / this.config.window) * this.config.limit);

    if (refillAmount > 0) {
      // Refill tokens (up to limit)
      bucket.tokens = Math.min(this.config.limit, bucket.tokens + refillAmount);
      bucket.lastRefill = now;
    }

    // Check if we have tokens available
    if (bucket.tokens > 0) {
      // Allow request and consume token
      bucket.tokens--;
      await this.store.set(key, bucket, this.config.window);

      return {
        allowed: true,
        limit: this.config.limit,
        remaining: bucket.tokens,
        reset: now + this.config.window
      };
    }

    // Rate limit exceeded
    const resetTime = bucket.lastRefill + this.config.window;
    const retryAfter = resetTime - now;

    return {
      allowed: false,
      limit: this.config.limit,
      remaining: 0,
      reset: resetTime,
      retryAfter: Math.ceil(retryAfter / 1000) // Convert to seconds
    };
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    const key = `${this.config.prefix}:${identifier}`;
    await this.store.del(key);
  }
}

/**
 * Create a rate limiter instance
 */
export function createRateLimiter(config: RateLimitConfig, store?: RateLimitStore): RateLimiter {
  return new RateLimiter(config, store);
}
