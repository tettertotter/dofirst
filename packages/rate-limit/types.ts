/**
 * @todaypool/rate-limit
 * Rate limiting for API endpoints
 */

export interface RateLimitConfig {
  /** Maximum requests allowed in window */
  limit: number;
  /** Time window in milliseconds */
  window: number;
  /** Optional identifier prefix (for multiple rate limiters) */
  prefix?: string;
}

export interface RateLimitResult {
  /** Whether request is allowed */
  allowed: boolean;
  /** Total limit */
  limit: number;
  /** Remaining requests in window */
  remaining: number;
  /** Time when limit resets (Unix timestamp in ms) */
  reset: number;
  /** Time until reset in ms */
  retryAfter?: number;
}

export interface RateLimitStore {
  get(key: string): Promise<TokenBucket | null>;
  set(key: string, bucket: TokenBucket, ttl: number): Promise<void>;
  del(key: string): Promise<void>;
}

export interface TokenBucket {
  tokens: number;
  lastRefill: number;
}
