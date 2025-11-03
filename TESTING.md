# Testing Guide

## Manual Smoke Test

Critical user flow to verify before deployment:

### 1. Authentication Flow
1. Navigate to app homepage
2. Sign in with Supabase Auth (Google/Email)
3. Verify redirect to /today page
4. Check user profile appears in header

### 2. Quick Add Flow
1. Click "Quick Add" button in header
2. Enter task title: "Test task"
3. Press Enter key (keyboard accessibility)
4. Verify toast: "Added to pool"
5. Navigate to /pool page
6. Verify task appears in list

### 3. Task Actions Flow
1. On /pool page, find the test task
2. Click "Snooze" button (+10m)
3. Verify task disappears from current list
4. Wait 10 seconds, refresh page
5. Verify task hasn't reappeared yet (snoozed)

### 4. Today Proposals Flow (if owner)
1. Navigate to /today page
2. Click propose button on a task
3. Verify quota indicator updates
4. Check today_proposals table in Supabase

### 5. Accessibility Smoke Test
- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader**: Enable VoiceOver (Mac) or NVDA (Windows)
  - Verify buttons announce correctly
  - Verify form labels are read
  - Verify modal announces title
- **Touch Targets**: Verify all buttons are easy to tap on mobile

### 6. Mobile Responsiveness
1. Resize browser to 375px width (iPhone SE)
2. Verify bottom navigation appears
3. Verify top app bar is compact
4. Verify all touch targets ≥ 44x44px
5. Test navigation between tabs

### 7. Dark Mode
1. Toggle theme in /settings
2. Verify colors update across app
3. Verify no white flashes on page transitions
4. Verify contrast meets WCAG AA (4.5:1)

## Automated Testing

### Setup (Future)
```bash
# Install Playwright
pnpm add -D @playwright/test

# Install browsers
npx playwright install
```

### Example E2E Test
```typescript
// tests/smoke.spec.ts
import { test, expect } from '@playwright/test';

test('quick add flow', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000');
  await page.click('text=Sign in');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('[type=submit]');

  // Quick Add
  await page.click('[aria-label="Quick add task"]');
  await page.fill('[label="Task"]', 'E2E Test Task');
  await page.press('[label="Task"]', 'Enter');

  // Verify
  await expect(page.locator('text=Added to pool')).toBeVisible();
  await page.goto('http://localhost:3000/pool');
  await expect(page.locator('text=E2E Test Task')).toBeVisible();
});
```

## Performance Testing

### Lighthouse Audit
```bash
# Run Lighthouse CLI
npx lighthouse http://localhost:3000 --view
```

**Target Scores**:
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 90

### Load Testing
```bash
# Install k6
brew install k6

# Run load test
k6 run tests/load.js
```

Example load test:
```javascript
// tests/load.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '3m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
};

export default function() {
  let res = http.get('http://localhost:3000/api/tasks.list');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Database Testing

### Verify RLS Policies
```sql
-- Test as anonymous user (should fail)
SELECT * FROM tasks;

-- Test as authenticated user (should only see own tasks)
SET request.jwt.claims = '{"sub": "user-id"}';
SELECT * FROM tasks;
```

### Test Migrations
```bash
# Reset database
supabase db reset

# Apply migrations
supabase db push

# Verify schema
supabase db diff
```

## API Testing

### Postman/Thunder Client Collection
Test all API endpoints:
- `POST /api/tasks.quickAdd`
- `POST /api/tasks.snooze`
- `POST /api/tasks.complete`
- `POST /api/today.propose`
- `GET /api/today.quota`

Include tests for:
- Valid input
- Invalid input (validation errors)
- Authentication (401)
- Authorization (403)
- Rate limiting (429)
