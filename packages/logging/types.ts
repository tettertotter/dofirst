/**
 * @todaypool/logging
 * Structured logging system for DoFirst
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  component?: string;
  requestId?: string;
  userId?: string;
  taskId?: string;
  poolId?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  child(childContext: LogContext): Logger;
}

export interface LoggerOptions {
  level?: LogLevel;
  pretty?: boolean;
  redact?: string[];
  component?: string;
}
