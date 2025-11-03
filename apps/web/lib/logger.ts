/**
 * Production Logger
 *
 * Structured logging with request IDs for tracing requests across services.
 * All logs are formatted for easy parsing in production log aggregators.
 */

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

interface LogContext {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  [key: string]: any;
}

class Logger {
  private context: LogContext = {};

  withContext(context: LogContext): Logger {
    const newLogger = new Logger();
    newLogger.context = { ...this.context, ...context };
    return newLogger;
  }

  info(message: string, meta?: Record<string, any>) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...meta,
    }));
  }

  warn(message: string, meta?: Record<string, any>) {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...meta,
    }));
  }

  error(message: string, error?: Error | any, meta?: Record<string, any>) {
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      ...this.context,
      ...meta,
    }));
  }
}

export const logger = new Logger();

/**
 * Usage example:
 *
 * const requestLogger = logger.withContext({
 *   requestId: generateRequestId(),
 *   endpoint: '/api/tasks.quickAdd'
 * });
 *
 * requestLogger.info('Task created', { taskId: '123', userId: 'abc' });
 * requestLogger.error('Failed to create task', error);
 */
