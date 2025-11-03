/**
 * Structured logger implementation
 */

import type { Logger, LogEntry, LogContext, LogLevel, LoggerOptions } from './types';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m'  // Red
};

const RESET_COLOR = '\x1b[0m';

export class StructuredLogger implements Logger {
  private level: LogLevel;
  private pretty: boolean;
  private redactFields: Set<string>;
  private baseContext: LogContext;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
    this.pretty = options.pretty ?? (process.env.NODE_ENV !== 'production');
    this.redactFields = new Set(options.redact ?? ['password', 'token', 'secret', 'apiKey']);
    this.baseContext = options.component ? { component: options.component } : {};
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  child(childContext: LogContext): Logger {
    const childLogger = new StructuredLogger({
      level: this.level,
      pretty: this.pretty,
      redact: Array.from(this.redactFields)
    });
    childLogger.baseContext = { ...this.baseContext, ...childContext };
    return childLogger;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    // Check if level is enabled
    if (LOG_LEVELS[level] < LOG_LEVELS[this.level]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.mergeContext(context),
      error: error ? this.serializeError(error) : undefined
    };

    const output = this.format(entry);
    this.write(level, output);
  }

  private mergeContext(context?: LogContext): LogContext | undefined {
    if (!this.baseContext && !context) return undefined;

    const merged = { ...this.baseContext, ...context };
    return this.redact(merged);
  }

  private redact(context: LogContext): LogContext {
    const redacted: LogContext = {};

    for (const [key, value] of Object.entries(context)) {
      if (this.redactFields.has(key)) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  private serializeError(error: Error): any {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  private format(entry: LogEntry): string {
    if (this.pretty) {
      return this.formatPretty(entry);
    }
    return JSON.stringify(entry);
  }

  private formatPretty(entry: LogEntry): string {
    const color = LEVEL_COLORS[entry.level];
    const levelStr = entry.level.toUpperCase().padEnd(5);
    const timestamp = entry.timestamp.split('T')[1].slice(0, 12); // HH:MM:SS.mmm

    let output = `${color}${levelStr}${RESET_COLOR} ${timestamp}`;

    if (entry.context?.component) {
      output += ` [${entry.context.component}]`;
    }

    output += ` ${entry.message}`;

    if (entry.context) {
      const contextCopy = { ...entry.context };
      delete contextCopy.component; // Already shown

      if (Object.keys(contextCopy).length > 0) {
        output += ` ${JSON.stringify(contextCopy)}`;
      }
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n${entry.error.stack.split('\n').map(line => `    ${line}`).join('\n')}`;
      }
    }

    return output;
  }

  private write(level: LogLevel, output: string): void {
    if (level === 'error' || level === 'warn') {
      console.error(output);
    } else {
      console.log(output);
    }
  }
}

/**
 * Create a logger instance
 */
export function createLogger(options?: LoggerOptions): Logger {
  return new StructuredLogger(options);
}

/**
 * Default logger instance
 */
export const logger = createLogger();
