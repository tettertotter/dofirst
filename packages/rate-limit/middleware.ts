/**
 * Rate limiting middleware for Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from './limiter';
import type { RateLimitConfig } from './types';
import { createLogger } from '@todaypool/logging';

const logger = createLogger({ component: 'RateLimit' });

/**
 * Get identifier from request (IP address or user ID)
 */
function getIdentifier(req: NextRequest): string {
  // Prefer user ID if authenticated
  const userId = (req as any).userId;
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() :
    req.headers.get('x-real-ip') ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * Add rate limit headers to response
 */
function withRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.floor(reset / 1000).toString());
  return response;
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  config: RateLimitConfig
): (handler: (req: NextRequest) => Promise<NextResponse<any>>) => (req: NextRequest) => Promise<NextResponse<any>> {
  const limiter = new RateLimiter(config);

  return (handler: (req: NextRequest) => Promise<NextResponse<any>>) => {
    return async (req: NextRequest): Promise<NextResponse<any>> => {
      const identifier = getIdentifier(req);
      const requestId = (req as any).requestId || 'unknown';

      try {
        const result = await limiter.check(identifier);

        if (!result.allowed) {
          logger.warn('Rate limit exceeded', {
            requestId,
            identifier,
            path: req.nextUrl.pathname
          });

          const response = NextResponse.json(
            {
              error: 'rate_limit_exceeded',
              message: 'Too many requests. Please try again later.',
              retryAfter: result.retryAfter
            },
            { status: 429 }
          );

          response.headers.set('Retry-After', result.retryAfter!.toString());
          return withRateLimitHeaders(response, result.limit, result.remaining, result.reset);
        }

        // Allow request
        const response = await handler(req);
        return withRateLimitHeaders(response, result.limit, result.remaining, result.reset);

      } catch (error) {
        logger.error('Rate limit check failed',
          error instanceof Error ? error : new Error(String(error)),
          { requestId, identifier }
        );

        // On error, allow request but log
        return handler(req);
      }
    };
  };
}

/**
 * Common rate limit configurations
 */
export const RateLimits = {
  /** Standard API: 100 requests per minute */
  STANDARD: { limit: 100, window: 60_000, prefix: 'std' },

  /** Strict (auth endpoints): 10 requests per minute */
  STRICT: { limit: 10, window: 60_000, prefix: 'strict' },

  /** Generous (reads): 300 requests per minute */
  GENEROUS: { limit: 300, window: 60_000, prefix: 'gen' },

  /** Per-user daily: 10,000 requests per day */
  DAILY: { limit: 10_000, window: 86_400_000, prefix: 'daily' },

  /** Burst protection: 20 requests per 10 seconds */
  BURST: { limit: 20, window: 10_000, prefix: 'burst' }
} satisfies Record<string, RateLimitConfig>;
