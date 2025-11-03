/**
 * Test suite for structured logger
 */

import { createLogger, StructuredLogger } from './logger';
import type { LogContext } from './types';

// Mock console
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
let logOutput: string[] = [];
let errorOutput: string[] = [];

beforeEach(() => {
  logOutput = [];
  errorOutput = [];
  console.log = jest.fn((msg: string) => logOutput.push(msg));
  console.error = jest.fn((msg: string) => errorOutput.push(msg));
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('StructuredLogger', () => {
  describe('log levels', () => {
    test('respects minimum log level', () => {
      const logger = createLogger({ level: 'warn', pretty: false });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(logOutput.length).toBe(0); // debug and info filtered
      expect(errorOutput.length).toBe(2); // warn and error
    });

    test('logs all levels when set to debug', () => {
      const logger = createLogger({ level: 'debug', pretty: false });

      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(logOutput.length).toBe(2); // debug, info
      expect(errorOutput.length).toBe(2); // warn, error
    });
  });

  describe('context', () => {
    test('includes context in logs', () => {
      const logger = createLogger({ pretty: false });
      const context: LogContext = { userId: '123', taskId: '456' };

      logger.info('test message', context);

      const parsed = JSON.parse(logOutput[0]);
      expect(parsed.message).toBe('test message');
      expect(parsed.context).toEqual(context);
    });

    test('merges base context with log context', () => {
      const logger = createLogger({
        component: 'TestComponent',
        pretty: false
      });

      logger.info('test', { userId: '123' });

      const parsed = JSON.parse(logOutput[0]);
      expect(parsed.context).toEqual({
        component: 'TestComponent',
        userId: '123'
      });
    });
  });

  describe('child loggers', () => {
    test('inherits parent context', () => {
      const parent = createLogger({
        component: 'Parent',
        pretty: false
      });

      const child = parent.child({ requestId: 'req_123' });
      child.info('child message', { userId: 'user_456' });

      const parsed = JSON.parse(logOutput[0]);
      expect(parsed.context).toEqual({
        component: 'Parent',
        requestId: 'req_123',
        userId: 'user_456'
      });
    });

    test('child context overrides parent', () => {
      const parent = createLogger({
        component: 'Parent',
        pretty: false
      });

      const child = parent.child({ component: 'Child' });
      child.info('message');

      const parsed = JSON.parse(logOutput[0]);
      expect(parsed.context.component).toBe('Child');
    });
  });

  describe('error serialization', () => {
    test('captures error details', () => {
      const logger = createLogger({ pretty: false });
      const error = new Error('Something failed');

      logger.error('Error occurred', error);

      const parsed = JSON.parse(errorOutput[0]);
      expect(parsed.error).toBeDefined();
      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('Something failed');
      expect(parsed.error.stack).toBeDefined();
    });

    test('includes context with error', () => {
      const logger = createLogger({ pretty: false });
      const error = new Error('Failed');

      logger.error('Operation failed', error, { userId: '123' });

      const parsed = JSON.parse(errorOutput[0]);
      expect(parsed.context.userId).toBe('123');
      expect(parsed.error.message).toBe('Failed');
    });
  });

  describe('security', () => {
    test('redacts sensitive fields by default', () => {
      const logger = createLogger({ pretty: false });

      logger.info('User login', {
        email: 'user@example.com',
        password: 'secret123',
        token: 'jwt_abc',
        apiKey: 'key_xyz'
      });

      const parsed = JSON.parse(logOutput[0]);
      expect(parsed.context.email).toBe('user@example.com');
      expect(parsed.context.password).toBe('[REDACTED]');
      expect(parsed.context.token).toBe('[REDACTED]');
      expect(parsed.context.apiKey).toBe('[REDACTED]');
    });

    test('supports custom redaction list', () => {
      const logger = createLogger({
        pretty: false,
        redact: ['ssn', 'creditCard']
      });

      logger.info('Payment', {
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
        amount: 100
      });

      const parsed = JSON.parse(logOutput[0]);
      expect(parsed.context.ssn).toBe('[REDACTED]');
      expect(parsed.context.creditCard).toBe('[REDACTED]');
      expect(parsed.context.amount).toBe(100);
    });
  });

  describe('output formats', () => {
    test('JSON format in production', () => {
      const logger = createLogger({ pretty: false });

      logger.info('test message', { userId: '123' });

      expect(() => JSON.parse(logOutput[0])).not.toThrow();
      const parsed = JSON.parse(logOutput[0]);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('test message');
      expect(parsed.timestamp).toBeDefined();
    });

    test('pretty format in development', () => {
      const logger = createLogger({ pretty: true, component: 'Test' });

      logger.info('test message', { userId: '123' });

      expect(logOutput[0]).toContain('INFO');
      expect(logOutput[0]).toContain('[Test]');
      expect(logOutput[0]).toContain('test message');
      expect(logOutput[0]).toContain('userId');
    });

    test('includes timestamp in all logs', () => {
      const logger = createLogger({ pretty: false });

      logger.info('test');

      const parsed = JSON.parse(logOutput[0]);
      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('routing', () => {
    test('info logs go to stdout', () => {
      const logger = createLogger({ pretty: false });

      logger.info('info message');
      logger.debug('debug message');

      expect(logOutput.length).toBe(2);
      expect(errorOutput.length).toBe(0);
    });

    test('error logs go to stderr', () => {
      const logger = createLogger({ pretty: false });

      logger.error('error message');
      logger.warn('warn message');

      expect(logOutput.length).toBe(0);
      expect(errorOutput.length).toBe(2);
    });
  });
});
