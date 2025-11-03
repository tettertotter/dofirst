# @todaypool/nagging

Persistent notification scheduling based on Due's nagging reliability model.

## Features

- **Predictable cadence**: 5m → 10m (×3) → 15m (repeat)
- **Quiet hours**: Respect sleep with catch-up alerts
- **Healing**: Reschedule on app resume
- **Offline-first**: Schedule next 3 occurrences locally
- **Cross-platform**: Works on iOS, Android, Web

## Installation

```bash
# Already included in monorepo workspace
pnpm install
```

## Usage

### Basic Scheduling

```typescript
import { computeNextTimes, DEFAULT_CADENCE } from '@todaypool/nagging';

const due = new Date('2025-11-01T14:00:00'); // Task due at 2pm
const now = new Date();

// Compute next 3 notification times
const times = computeNextTimes(due, now, null, DEFAULT_CADENCE, 3);

// Returns:
// [
//   2025-11-01T14:05:00 (+5m),
//   2025-11-01T14:15:00 (+10m),
//   2025-11-01T14:25:00 (+10m)
// ]
```

### With Quiet Hours

```typescript
import { computeSchedule, type QuietHours } from '@todaypool/nagging';

const quiet: QuietHours = {
  start: '22:00', // 10pm
  end: '07:00'    // 7am
};

const result = computeSchedule(
  due,
  now,
  quiet,
  DEFAULT_CADENCE,
  3 // next 3 times
);

console.log(result.times);           // [Date, Date, Date]
console.log(result.hasQuietHours);   // true if any rolled
console.log(result.catchUpAt);       // Date at 7am if applicable
```

### Custom Cadence

```typescript
import { type Cadence } from '@todaypool/nagging';

// Aggressive: 1m → 2m → 5m → 5m (repeat)
const aggressive: Cadence = {
  firstAfterMin: 1,
  stepMinutes: [2, 5],
  repeatAfter: 5
};

// Gentle: 10m → 30m → 30m (repeat)
const gentle: Cadence = {
  firstAfterMin: 10,
  stepMinutes: [30],
  repeatAfter: 30
};
```

### Healing (Resume After App Termination)

```typescript
import { computeNextTimes } from '@todaypool/nagging';

// Task was due 30 minutes ago, missed 2 notifications
// Resume from step index 2
const times = computeNextTimes(
  due,
  new Date(),
  null,
  DEFAULT_CADENCE,
  3,
  2 // startIndex: skip first 2 steps
);
```

## API Reference

### Functions

#### `computeNextTimes()`

Compute next notification times following cadence.

```typescript
function computeNextTimes(
  due: Date,
  now: Date,
  quiet: QuietHours | null = null,
  cadence: Cadence = DEFAULT_CADENCE,
  limit: number = 3,
  startIndex: number = 0
): Date[]
```

**Parameters:**
- `due` - Task due date/time
- `now` - Current time (for testing)
- `quiet` - Quiet hours configuration (null = no quiet hours)
- `cadence` - Notification cadence (default = Due's cadence)
- `limit` - Number of times to compute (default = 3 for local scheduling)
- `startIndex` - Index in cadence.stepMinutes to start from (for healing)

**Returns:** Array of Date objects for next notifications

#### `computeSchedule()`

Enhanced version that returns metadata.

```typescript
function computeSchedule(
  due: Date,
  now: Date,
  quiet: QuietHours | null = null,
  cadence: Cadence = DEFAULT_CADENCE,
  limit: number = 3,
  startIndex: number = 0
): ScheduleResult
```

**Returns:**
```typescript
{
  times: Date[];          // Next notification times
  hasQuietHours: boolean; // Whether any times were rolled
  catchUpAt?: Date;       // Catch-up alert time if applicable
}
```

#### `inQuietHours()`

Check if a time falls within quiet hours.

```typescript
function inQuietHours(date: Date, quiet: QuietHours | null): boolean
```

#### `formatCadence()`

Format cadence for human display.

```typescript
function formatCadence(cadence: Cadence): string
// Returns: "5m → 10m (×3) → 15m (repeat)"
```

#### `parseCadence()`

Parse user input into cadence configuration.

```typescript
function parseCadence(input: string | null | undefined): Cadence
// "5, 10, 10, 15" → { firstAfterMin: 5, stepMinutes: [5, 10, 10], repeatAfter: 15 }
```

#### `isValidQuietHours()`

Validate quiet hours format.

```typescript
function isValidQuietHours(start: string, end: string): boolean
```

### Types

#### `Cadence`

```typescript
interface Cadence {
  firstAfterMin?: number;    // Minutes after due for first notification (default: 5)
  stepMinutes: number[];     // Step intervals in minutes
  repeatAfter?: number;      // Interval after stepMinutes exhausted (default: 15)
}
```

#### `QuietHours`

```typescript
interface QuietHours {
  start: string;  // "HH:MM" (24-hour format)
  end: string;    // "HH:MM" (24-hour format)
}
```

#### `NaggingConfig`

```typescript
interface NaggingConfig {
  cadence?: Cadence | null;
  quietHours?: QuietHours | null;
  stepIndex?: number;
  lastNotificationAt?: string;
  enabled?: boolean;
}
```

### Constants

```typescript
export const DEFAULT_CADENCE: Cadence = {
  firstAfterMin: 5,
  stepMinutes: [10, 10, 10, 15, 15],
  repeatAfter: 15
};
// → "5m → 10m (×3) → 15m (×2) → 15m (repeat)"

export const DEFAULT_QUIET_HOURS: QuietHours = {
  start: '22:00',  // 10pm
  end: '07:00'     // 7am
};
```

## Algorithm Details

### Cadence Progression

Default cadence follows Due's proven pattern:

1. **First notification**: 5 minutes after due time
2. **Escalation phase**: 10 minute intervals (×3)
3. **Sustained phase**: 15 minute intervals thereafter

Example timeline for task due at 2:00 PM:
```
2:00 PM - Task due
2:05 PM - 1st notification (+5m)
2:15 PM - 2nd notification (+10m)
2:25 PM - 3rd notification (+10m)
2:35 PM - 4th notification (+10m)
2:50 PM - 5th notification (+15m)
3:05 PM - 6th notification (+15m)
3:20 PM - 7th notification (+15m)
... every 15m until acted upon
```

### Quiet Hours Behavior

When a notification would occur during quiet hours:

1. **Roll forward**: Notification time moves to end of quiet hours
2. **Batch catch-up**: Multiple rolled notifications become one catch-up alert
3. **Silent delivery**: Notifications during quiet hours are silent/badge only
4. **Cross-midnight**: Correctly handles quiet hours like 22:00-07:00

Example with quiet hours (10pm - 7am):
```
9:00 PM  - Task due
9:05 PM  - 1st notification (+5m)
9:15 PM  - 2nd notification (+10m)
9:25 PM  - 3rd notification (+10m) → Would be 9:35pm, but quiet starts at 10pm
9:35 PM  - 4th notification (+10m) → Would be 9:45pm
9:45 PM  - 5th notification (+10m) → Would be 9:55pm
10:00 PM - Quiet hours begin
7:00 AM  - Catch-up alert (next day)
7:10 AM  - Resume normal cadence (+10m)
7:25 AM  - Next notification (+15m)
```

### Local Scheduling Strategy

To survive app termination and OS notification purges:

1. **Schedule next 3**: Always maintain 3 upcoming notifications
2. **On fire**: When notification fires, reschedule next 3
3. **On action**: When user acts (Done/Snooze), reschedule next 3
4. **On resume**: App resume detects missed notifications and reschedules

This ensures notifications persist even if:
- App is force-quit
- Device reboots
- OS purges notification queue
- Network is unavailable

## Testing

```bash
# Run tests
pnpm test packages/nagging/scheduler.test.ts
```

Test coverage:
- ✅ Basic cadence progression
- ✅ Quiet hours with midnight crossing
- ✅ Custom cadences
- ✅ Healing with startIndex
- ✅ Metadata computation
- ✅ Format and parse utilities
- ✅ Validation functions

## Integration

This package is used by:
- `apps/web/app/api/tasks.quickAdd/route.ts` - Schedule on task creation
- `apps/web/app/api/tasks.snooze/route.ts` - Reschedule on snooze
- `apps/web/app/api/tasks.complete/route.ts` - Cancel on completion
- `packages/notifications/*-adapter.ts` - Platform-specific scheduling

## Performance

- **Time complexity**: O(n) where n = limit (typically 3)
- **Memory**: Minimal - only allocates Date objects for result
- **No recursion**: Iterative algorithm, stack-safe
- **No network**: Pure computation, works offline

## Philosophy

Based on Due's approach to reminders:

> "A reminder that you dismiss and forget is worse than no reminder at all."

DoFirst ensures reminders persist until explicitly acted upon, matching Due's legendary reliability while respecting user preferences for quiet hours and notification cadence.

## License

MIT
