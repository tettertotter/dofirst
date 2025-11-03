# @todaypool/logging

Structured logging system for DoFirst with consistent formatting, context tracking, and security.

## Features

- **Structured logs**: JSON format in production, pretty-printed in development
- **Log levels**: debug, info, warn, error with configurable threshold
- **Context tracking**: Attach metadata like requestId, userId, taskId to all logs
- **Child loggers**: Create scoped loggers that inherit parent context
- **Security**: Automatic redaction of sensitive fields (passwords, tokens, etc.)
- **Request middleware**: Automatic logging for Next.js API routes
- **Error serialization**: Proper stack trace capture

## Installation

```bash
# Already available in monorepo
import { createLogger, logger } from '@todaypool/logging';
```

## Basic Usage

```typescript
import { createLogger } from '@todaypool/logging';

// Create a logger for your component
const logger = createLogger({ component: 'TaskService' });

logger.info('Task created', { taskId: '123', poolId: '456' });
logger.warn('Task due soon', { taskId: '123', dueAt: '2025-11-01T14:00:00Z' });
logger.error('Task creation failed', error, { userId: '789' });
```

## Child Loggers

Create scoped loggers that inherit parent context:

```typescript
const apiLogger = createLogger({ component: 'API' });

// Child logger automatically includes requestId in all logs
function handleRequest(req: NextRequest) {
  const requestLogger = apiLogger.child({
    requestId: req.headers.get('x-request-id'),
    userId: user.id
  });

  requestLogger.info('Processing request');
  // Output: INFO [API] Processing request {"requestId":"req_123","userId":"user_456"}

  requestLogger.error('Request failed', error);
  // Output: ERROR [API] Request failed {"requestId":"req_123","userId":"user_456"}
}
```

## Request Logging Middleware

Automatically log all API requests with timing and context:

```typescript
import { withRequestLogging } from '@todaypool/logging';

export const POST = withRequestLogging(async (req: NextRequest) => {
  // Your handler code
  return NextResponse.json({ success: true });
});

// Logs:
// INFO [API] Incoming request {"requestId":"req_123","method":"POST","path":"/api/tasks"}
// INFO [API] Request completed {"requestId":"req_123","method":"POST","path":"/api/tasks","status":200,"duration":45}
```

## Log Levels

Set log level via environment or options:

```typescript
// Via environment
process.env.LOG_LEVEL = 'warn'; // Only warn and error logs

// Via options
const logger = createLogger({ level: 'debug' });
```

Default levels:
- **Production**: `info` (hides debug logs)
- **Development**: `debug` (shows all logs)

## Security Features

### Automatic Redaction

Sensitive fields are automatically redacted:

```typescript
logger.info('User login', {
  email: 'user@example.com',
  password: 'secret123',  // Will be [REDACTED]
  token: 'jwt_token'      // Will be [REDACTED]
});

// Output: {"email":"user@example.com","password":"[REDACTED]","token":"[REDACTED]"}
```

Default redacted fields: `password`, `token`, `secret`, `apiKey`

### Custom Redaction

```typescript
const logger = createLogger({
  component: 'Auth',
  redact: ['password', 'ssn', 'creditCard']
});
```

## Output Formats

### Development (Pretty)

```
INFO  14:30:45.123 [TaskService] Task created {"taskId":"123","poolId":"456"}
WARN  14:30:46.456 [TaskService] Task due soon {"taskId":"123"}
ERROR 14:30:47.789 [TaskService] Task creation failed {"userId":"789"}
  Error: Validation failed
    at createTask (task-service.ts:45)
    at POST (route.ts:23)
```

### Production (JSON)

```json
{"timestamp":"2025-11-01T14:30:45.123Z","level":"info","message":"Task created","context":{"component":"TaskService","taskId":"123","poolId":"456"}}
{"timestamp":"2025-11-01T14:30:46.456Z","level":"warn","message":"Task due soon","context":{"component":"TaskService","taskId":"123"}}
{"timestamp":"2025-11-01T14:30:47.789Z","level":"error","message":"Task creation failed","context":{"component":"TaskService","userId":"789"},"error":{"name":"ValidationError","message":"Validation failed","stack":"..."}}
```

## Migration Guide

Replace existing console statements:

```typescript
// Before
console.log('[Complete] Task completed:', taskId);
console.error('[Complete] Error:', error);

// After
import { createLogger } from '@todaypool/logging';
const logger = createLogger({ component: 'Complete' });

logger.info('Task completed', { taskId });
logger.error('Task completion failed', error, { taskId });
```

## Best Practices

1. **Create component-specific loggers**
   ```typescript
   const logger = createLogger({ component: 'TaskService' });
   ```

2. **Use child loggers for request scope**
   ```typescript
   const requestLogger = logger.child({ requestId: req.requestId });
   ```

3. **Include relevant context**
   ```typescript
   logger.info('Action taken', { userId, taskId, poolId });
   ```

4. **Use appropriate log levels**
   - `debug`: Development/troubleshooting info
   - `info`: Normal operations (task created, user logged in)
   - `warn`: Unexpected but handled (rate limit hit, retrying)
   - `error`: Failures requiring attention

5. **Don't log sensitive data**
   - Logger auto-redacts, but be careful with custom fields
   - Use generic field names when possible

## Integration with External Services

The structured JSON format makes it easy to integrate with logging services:

- **CloudWatch**: Parse JSON logs with CloudWatch Insights
- **Datadog**: Forward logs via CloudWatch or direct agent
- **Sentry**: Use for error-level logs only
- **Elastic/Splunk**: Ingest JSON logs directly

Example CloudWatch Insights query:
```
fields @timestamp, level, message, context.userId, context.duration
| filter level = "error"
| sort @timestamp desc
```
