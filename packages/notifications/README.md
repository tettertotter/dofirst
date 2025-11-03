# @todaypool/notifications

Cross-platform notification adapters for iOS, Android, and Web.

## Features

- **Platform-agnostic API** - Same interface works on all platforms
- **Local scheduling** - iOS and Android schedule notifications locally
- **Server scheduling** - Web uses server-side scheduling + Web Push
- **Action buttons** - Done, +10m, +1h, Tomorrow AM on all platforms
- **Permission handling** - Proper request flows for each platform
- **Fallbacks** - Graceful degradation when permissions denied

## Installation

```bash
# Already included in monorepo workspace
pnpm install
```

### Platform-Specific Setup

#### iOS
```bash
cd apps/mobile
npx pod-install
```

Add to `Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

#### Android
Add to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.USE_EXACT_ALARM"/>
```

#### Web
Service worker must be registered:
```typescript
// Already done in apps/web/public/sw.js
```

## Usage

### Initialize (Once at App Start)

```typescript
import { initializeNotifications } from '@todaypool/notifications';

// In app/_layout.tsx (React Native) or app/layout.tsx (Next.js)
useEffect(() => {
  initializeNotifications();
}, []);
```

### Request Permission

```typescript
import { createNotificationAdapter } from '@todaypool/notifications';

const notifications = createNotificationAdapter();
const granted = await notifications.requestPermission();

if (!granted) {
  // Show UI explaining why notifications are important
}
```

### Schedule Notifications

```typescript
import { createNotificationAdapter } from '@todaypool/notifications';

const notifications = createNotificationAdapter();

const taskId = 'task-123';
const times = [
  new Date(Date.now() + 5 * 60 * 1000),   // 5 minutes
  new Date(Date.now() + 15 * 60 * 1000),  // 15 minutes
  new Date(Date.now() + 30 * 60 * 1000),  // 30 minutes
];

const payload = {
  taskId: 'task-123',
  title: 'Pick up groceries',
  body: '#personal !2',
  dueAt: new Date().toISOString(),
  priority: 2,
};

const result = await notifications.schedule(taskId, times, payload);

if (result.success) {
  console.log(`Scheduled ${result.scheduledCount} notifications`);
} else {
  console.error('Failed to schedule:', result.error);
}
```

### Cancel Notifications

```typescript
// Cancel for specific task
await notifications.cancel('task-123');

// Cancel all
await notifications.cancelAll();
```

### Handle Actions

Actions are handled automatically by platform-specific code:
- **iOS**: Action categories call API endpoints
- **Android**: BroadcastReceiver calls API endpoints
- **Web**: Service worker calls API endpoints

See:
- `apps/mobile/app/notification-handler.tsx` for mobile
- `apps/web/public/sw.js` for web

### Check Status

```typescript
import { getNotificationStatus } from '@todaypool/notifications';

const status = await getNotificationStatus();

console.log('Platform:', status.platform);
console.log('Has Permission:', status.hasPermission);
console.log('Is Ready:', status.isReady);
```

## Architecture

### Interface (`types.ts`)
Defines `NotificationAdapter` interface that all platforms implement.

### Adapters
- **`ios-adapter.ts`** - UNUserNotificationCenter
- **`android-adapter.ts`** - AlarmManager with fallbacks
- **`web-adapter.ts`** - Web Push via service worker

### Factory (`factory.ts`)
Auto-detects platform and returns correct adapter.

## Platform Details

### iOS
- Uses `UNUserNotificationCenter` for local notifications
- Schedules max 3 notifications at a time (iOS limit: 64 total)
- Action categories: TASK_REMINDER with 4 actions
- Respects iOS permission model

### Android
- Uses `AlarmManager` for exact scheduling
- Requires `SCHEDULE_EXACT_ALARM` permission on Android 12+
- Falls back to `setExactAndAllowWhileIdle` if permission denied
- Notification channels: `task_reminders` (high priority)
- Handles Doze mode and battery optimization

### Web
- Uses Web Push with VAPID authentication
- Server-side scheduling (browsers can't schedule locally)
- Service worker handles notifications and actions
- Fallback to in-app notifications if service worker unavailable

## Troubleshooting

### iOS: Notifications not appearing
- Check permissions: Settings > DoFirst > Notifications
- Verify action categories are set up (call `initializeNotifications()`)
- Check console for scheduling errors

### Android: Notifications delayed or missing
- Check exact alarm permission: Settings > Apps > DoFirst > Alarms & reminders
- Verify notification channel is created
- Check battery optimization settings
- Some OEMs (Xiaomi, OnePlus) aggressively kill background apps

### Web: Push not received
- Check service worker is registered: DevTools > Application > Service Workers
- Verify VAPID keys are configured
- Check browser permissions: Site settings > Notifications
- Ensure HTTPS (required for service workers)

## Testing

### Manual Testing
```bash
# iOS
cd apps/mobile && pnpm ios

# Android
cd apps/mobile && pnpm android

# Web
cd apps/web && pnpm dev
```

### Expo Go Testing
Notifications work in Expo Go with limitations:
- iOS: Local notifications work
- Android: Local notifications work
- For full testing, use development builds

## API Reference

See `types.ts` for complete interface documentation.

## Examples

See:
- `apps/mobile/app/index.tsx` - Mobile Quick Add with notifications
- `apps/web/app/test-push/page.tsx` - Web Push testing page
- `apps/web/public/sw.js` - Service worker action handling
