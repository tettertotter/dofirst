/**
 * Test suite for rate limiter
 */

import { createRateLimiter } from './limiter';
import { MemoryStore } from './store';

// Helper to advance time
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('RateLimiter', () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  afterEach(() => {
    store.destroy();
  });

  describe('basic rate limiting', () => {
    test('allows requests within limit', async () => {
      const limiter = createRateLimiter({ limit: 5, window: 60_000 }, store);

      // First 5 requests should be allowed
      for (let i = 0; i < 5; i++) {
        const result = await limiter.check('user:123');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    test('blocks requests exceeding limit', async () => {
      const limiter = createRateLimiter({ limit: 3, window: 60_000 }, store);

      // First 3 allowed
      await limiter.check('user:123');
      await limiter.check('user:123');
      await limiter.check('user:123');

      // 4th request blocked
      const result = await limiter.check('user:123');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    test('isolates different identifiers', async () => {
      const limiter = createRateLimiter({ limit: 2, window: 60_000 }, store);

      // user:123 uses up quota
      await limiter.check('user:123');
      await limiter.check('user:123');

      // user:456 has separate quota
      const result = await limiter.check('user:456');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('token refill', () => {
    test('refills tokens over time', async () => {
      const limiter = createRateLimiter({ limit: 10, window: 1000 }, store);

      // Use all tokens
      for (let i = 0; i < 10; i++) {
        await limiter.check('user:123');
      }

      // Should be blocked
      let result = await limiter.check('user:123');
      expect(result.allowed).toBe(false);

      // Wait for 500ms = half window = 5 tokens refilled
      await wait(500);

      // Should have ~5 tokens available
      result = await limiter.check('user:123');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(3);
    });

    test('caps tokens at limit', async () => {
      const limiter = createRateLimiter({ limit: 5, window: 1000 }, store);

      // Use 2 tokens
      await limiter.check('user:123');
      await limiter.check('user:123');

      // Wait for full refill
      await wait(1100);

      // Should have full 5 tokens, not more
      const result = await limiter.check('user:123');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // Used 1, have 4 left
    });
  });

  describe('response metadata', () => {
    test('returns correct limit and remaining', async () => {
      const limiter = createRateLimiter({ limit: 10, window: 60_000 }, store);

      const result1 = await limiter.check('user:123');
      expect(result1.limit).toBe(10);
      expect(result1.remaining).toBe(9);

      const result2 = await limiter.check('user:123');
      expect(result2.remaining).toBe(8);
    });

    test('returns reset timestamp', async () => {
      const limiter = createRateLimiter({ limit: 5, window: 60_000 }, store);
      const before = Date.now();

      const result = await limiter.check('user:123');

      expect(result.reset).toBeGreaterThan(before);
      expect(result.reset).toBeLessThanOrEqual(before + 60_000);
    });

    test('returns retry-after when blocked', async () => {
      const limiter = createRateLimiter({ limit: 1, window: 10_000 }, store);

      await limiter.check('user:123');
      const result = await limiter.check('user:123');

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(10); // seconds
    });
  });

  describe('reset', () => {
    test('clears rate limit for identifier', async () => {
      const limiter = createRateLimiter({ limit: 2, window: 60_000 }, store);

      // Use up quota
      await limiter.check('user:123');
      await limiter.check('user:123');

      // Should be blocked
      let result = await limiter.check('user:123');
      expect(result.allowed).toBe(false);

      // Reset
      await limiter.reset('user:123');

      // Should work again
      result = await limiter.check('user:123');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('prefix isolation', () => {
    test('different prefixes create separate limiters', async () => {
      const limiter1 = createRateLimiter({ limit: 2, window: 60_000, prefix: 'api1' }, store);
      const limiter2 = createRateLimiter({ limit: 2, window: 60_000, prefix: 'api2' }, store);

      // Use up api1 quota
      await limiter1.check('user:123');
      await limiter1.check('user:123');

      // api2 should still work
      const result = await limiter2.check('user:123');
      expect(result.allowed).toBe(true);
    });
  });

  describe('first request handling', () => {
    test('creates bucket on first request', async () => {
      const limiter = createRateLimiter({ limit: 10, window: 60_000 }, store);

      const result = await limiter.check('new:user');

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
    });
  });
});
