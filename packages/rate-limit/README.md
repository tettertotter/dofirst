# @todaypool/rate-limit

Token bucket rate limiting for API endpoints with automatic cleanup and flexible configuration.

## Features

- **Token bucket algorithm**: Smooth rate limiting with burst allowance
- **Multiple stores**: In-memory (default) or custom (Redis, etc.)
- **Automatic cleanup**: Memory-efficient with TTL-based expiration
- **Standard headers**: Returns X-RateLimit-* headers per RFC 6585
- **Flexible identification**: Rate limit by IP or authenticated user
- **Preset configurations**: Common rate limit patterns built-in

## Installation

```bash
# Already available in monorepo
import { withRateLimit, RateLimits } from '@todaypool/rate-limit';
```

## Basic Usage

### Apply to API Route

```typescript
import { withRateLimit, RateLimits } from '@todaypool/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withRateLimit(RateLimits.STANDARD)(async (req: NextRequest) => {
  // Your handler code
  return NextResponse.json({ success: true });
});

// Rate limited to 100 requests per minute per IP/user
```

### Custom Rate Limit

```typescript
export const POST = withRateLimit({
  limit: 50,        // 50 requests
  window: 60_000,   // per minute (in ms)
  prefix: 'custom'  // namespace for this limiter
})(async (req: NextRequest) => {
  return NextResponse.json({ success: true });
});
```

## Preset Configurations

Use built-in presets for common scenarios:

```typescript
import { RateLimits } from '@todaypool/rate-limit';

// Standard API endpoints (100 req/min)
withRateLimit(RateLimits.STANDARD)

// Strict (auth, sensitive operations) (10 req/min)
withRateLimit(RateLimits.STRICT)

// Generous (read operations) (300 req/min)
withRateLimit(RateLimits.GENEROUS)

// Daily limit (10,000 req/day)
withRateLimit(RateLimits.DAILY)

// Burst protection (20 req/10sec)
withRateLimit(RateLimits.BURST)
```

## How It Works

### Token Bucket Algorithm

1. Each user/IP gets a "bucket" with N tokens
2. Each request consumes 1 token
3. Tokens refill over time at a steady rate
4. If no tokens available, request is rejected (429)

Example: `limit: 100, window: 60_000` (60 seconds)
- Start with 100 tokens
- Each request consumes 1 token
- Tokens refill at ~1.67 tokens/second
- Allows bursts up to 100 requests, then steady 1.67 req/sec

### Identification

Rate limits are applied per identifier:
- **Authenticated**: Uses user ID (`user:123`)
- **Anonymous**: Uses IP address (`ip:192.168.1.1`)
- **Forwarded**: Respects X-Forwarded-For header

```typescript
// Priority order:
// 1. req.userId (set by auth middleware)
// 2. X-Forwarded-For header
// 3. X-Real-IP header
// 4. 'unknown' (fallback)
```

## Response Headers

All responses include standard rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1698765432
```

When rate limit exceeded (429):
```
Retry-After: 30
```

## Examples

### Combining Rate Limits

Apply multiple rate limiters to same endpoint:

```typescript
// Burst + Standard protection
const withBurst = withRateLimit(RateLimits.BURST);
const withStandard = withRateLimit(RateLimits.STANDARD);

export const POST = withBurst(withStandard(async (req: NextRequest) => {
  return NextResponse.json({ success: true });
}));

// Must pass both: 20 req/10sec AND 100 req/min
```

### Different Limits Per Endpoint

```typescript
// tasks.quickAdd: Standard rate
export const POST = withRateLimit(RateLimits.STANDARD)(handler);

// tasks.complete: Generous (called by notifications)
export const POST = withRateLimit(RateLimits.GENEROUS)(handler);

// auth.login: Strict (prevent brute force)
export const POST = withRateLimit(RateLimits.STRICT)(handler);
```

### Programmatic Check

```typescript
import { createRateLimiter } from '@todaypool/rate-limit';

const limiter = createRateLimiter({ limit: 10, window: 60_000 });

const result = await limiter.check('user:123');

if (!result.allowed) {
  console.log(`Rate limited. Try again in ${result.retryAfter}s`);
}
```

### Reset Rate Limit

```typescript
// Reset limit for specific user (admin action)
await limiter.reset('user:123');
```

## Custom Store (Redis)

For production with multiple servers, use Redis:

```typescript
import { createRateLimiter } from '@todaypool/rate-limit';
import Redis from 'ioredis';

class RedisStore implements RateLimitStore {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async get(key: string): Promise<TokenBucket | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, bucket: TokenBucket, ttl: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(bucket), 'PX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

const redis = new Redis(process.env.REDIS_URL);
const store = new RedisStore(redis);
const limiter = createRateLimiter({ limit: 100, window: 60_000 }, store);
```

## Testing

When testing, you can:

1. **Disable rate limiting**:
```typescript
// Set high limits for tests
const testConfig = { limit: 999999, window: 1000 };
```

2. **Use test-specific store**:
```typescript
import { MemoryStore } from '@todaypool/rate-limit';

const testStore = new MemoryStore();
// Reset between tests
afterEach(() => testStore.destroy());
```

3. **Mock the middleware**:
```typescript
jest.mock('@todaypool/rate-limit', () => ({
  withRateLimit: () => (handler) => handler
}));
```

## Best Practices

1. **Layer rate limits**: Use both burst and sustained limits
2. **Be generous with reads**: Only strict limit on writes
3. **Monitor 429 responses**: Alert if rate limits hit frequently
4. **Whitelist trusted IPs**: Bypass limits for internal services
5. **User-friendly errors**: Include retry-after information
6. **Log violations**: Track potential abuse patterns

## Performance

- **Memory usage**: ~100 bytes per active identifier
- **Cleanup interval**: Every 60 seconds
- **Overhead**: < 1ms per request (memory store)
- **Scalability**: 10,000+ identifiers with minimal impact

## Integration with Logging

Rate limit events are automatically logged:

```typescript
// Successful request
// DEBUG [RateLimit] Request allowed {"identifier":"user:123","remaining":42}

// Rate limited
// WARN [RateLimit] Rate limit exceeded {"identifier":"user:123","path":"/api/tasks"}
```

## Future Enhancements

- [ ] Sliding window algorithm option
- [ ] Dynamic limits based on user tier
- [ ] Distributed rate limiting with Redis
- [ ] Rate limit analytics dashboard
- [ ] Automatic backoff recommendations
