/**
 * Request logging middleware for Next.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from './logger';
import type { LogContext } from './types';

const logger = createLogger({ component: 'API' });

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract user ID from request (assumes auth is already done)
 */
function extractUserId(req: NextRequest): string | undefined {
  // This would be populated by auth middleware
  return (req as any).userId;
}

/**
 * Request logging metadata
 */
export interface RequestLog {
  requestId: string;
  method: string;
  path: string;
  query: Record<string, string>;
  userId?: string;
  userAgent?: string;
  ip?: string;
  duration: number;
  status: number;
}

/**
 * Log incoming request
 */
export function logRequest(req: NextRequest, requestId: string): void {
  const context: LogContext = {
    requestId,
    method: req.method,
    path: req.nextUrl.pathname,
    userId: extractUserId(req)
  };

  logger.info('Incoming request', context);
}

/**
 * Log response with timing
 */
export function logResponse(
  req: NextRequest,
  response: NextResponse,
  requestId: string,
  startTime: number
): void {
  const duration = Date.now() - startTime;
  const context: LogContext = {
    requestId,
    method: req.method,
    path: req.nextUrl.pathname,
    status: response.status,
    duration,
    userId: extractUserId(req)
  };

  const level = response.status >= 500 ? 'error' : response.status >= 400 ? 'warn' : 'info';

  if (level === 'error') {
    logger.error('Request failed', undefined, context);
  } else if (level === 'warn') {
    logger.warn('Request error', context);
  } else {
    logger.info('Request completed', context);
  }
}

/**
 * Add request ID to response headers
 */
export function withRequestId(response: NextResponse, requestId: string): NextResponse {
  response.headers.set('X-Request-ID', requestId);
  return response;
}

/**
 * Request logger wrapper for API routes
 */
export function withRequestLogging<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>
): (req: NextRequest) => Promise<NextResponse<T>> {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    const requestId = req.headers.get('x-request-id') || generateRequestId();
    const startTime = Date.now();

    // Attach request ID to request object for use in handlers
    (req as any).requestId = requestId;

    logRequest(req, requestId);

    try {
      const response = await handler(req);
      logResponse(req, response, requestId, startTime);
      return withRequestId(response, requestId) as NextResponse<T>;
    } catch (error) {
      const errorResponse = NextResponse.json(
        { error: 'internal_error', message: 'An unexpected error occurred' },
        { status: 500 }
      );

      logger.error(
        'Unhandled error in request handler',
        error instanceof Error ? error : new Error(String(error)),
        {
          requestId,
          method: req.method,
          path: req.nextUrl.pathname,
          duration: Date.now() - startTime
        }
      );

      logResponse(req, errorResponse, requestId, startTime);
      return withRequestId(errorResponse, requestId) as NextResponse<T>;
    }
  };
}
