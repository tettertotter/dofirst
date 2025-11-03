# TodayPool Execution Notes

## Implementation Plan

### Phase A: Repository Audit and Foundation (2025-11-01)
- [x] Read all documentation
- [x] Verify scaffold structure
- [x] Identify gaps and TODOs
- [ ] Fix SQL migration issues (002_indexes.sql references wrong columns)
- [ ] Create server-side Supabase client utilities
- [ ] Set up environment variables
- [ ] Create CHANGELOG.md structure

### Phase B: Database and RLS (2025-11-01)
- [ ] Apply 001_init.sql migration
- [ ] Fix and apply 002_indexes.sql migration
- [ ] Verify RLS policies are working
- [ ] Create Storage bucket for attachments (private)
- [ ] Update seed script with real auth users
- [ ] Run seed script to populate test data

### Phase C: Auth and Client Setup (2025-11-01)
- [ ] Web: Create server-only Supabase client helper
- [ ] Web: Create client-side Supabase client for reads
- [ ] Mobile: Set up anon client with session persistence
- [ ] Mobile: Configure Quick Add as initial route

### Phase D: Quick Add (Milestone 1) (2025-11-01)
- [ ] Implement /api/tasks.quickAdd with full logic
  - Extract auth user from session
  - Parse inline tags using parseInline
  - Link or create tags
  - Set default visibility by role
  - Create task with RLS enforced
- [ ] Web UI: Quick Add form with text input
- [ ] Mobile UI: Quick Add screen with mic button
- [ ] Test: Create tasks as owner, spouse, colleague
- [ ] Test: Verify visibility rules work correctly
- [ ] Update CHANGELOG.md with timestamp

### Phase E: Today Proposals (Milestone 2) (2025-11-01)
- [ ] Implement /api/today.propose
  - Check per-person daily limits
  - Create proposal with validation
  - Return remaining quota
- [ ] Implement /api/today.respond
  - Accept: create task if needed
  - Decline: mark declined
  - Move: update date
- [ ] Web UI: Today screen with proposals and accepted list
- [ ] Mobile UI: Simplified Today flow
- [ ] Test: Quota enforcement
- [ ] Test: Accept/decline/move flows
- [ ] Update CHANGELOG.md with timestamp

### Phase F: Email Inbound (Milestone 3) (2025-11-02)
- [ ] Complete /supabase/functions/mailgun-inbound/index.ts
  - Map recipient token to owner
  - Map sender to creator with allowlist
  - Parse inline tokens
  - Create task or suggestion
  - Handle attachments to Storage
- [ ] Deploy edge function
- [ ] Configure Mailgun route
- [ ] Test: Send email, verify task created
- [ ] Update CHANGELOG.md with timestamp

### Phase G: Email Outbound (Milestone 3) (2025-11-02)
- [ ] Implement /api/cron/daily-digest
  - Query today's tasks and pending proposals
  - Send via Resend with template
- [ ] Implement /api/cron/nag
  - Find stale items
  - Send gentle reminders
- [ ] Configure Vercel Cron schedules
- [ ] Test cron endpoints manually
- [ ] Update CHANGELOG.md with timestamp

### Phase H: Polish and Security (Milestone 4) (2025-11-02)
- [ ] Add rate limiting to API routes
- [ ] Add structured logging with request IDs
- [ ] Empty states for UI
- [ ] Loading spinners and error messages
- [ ] Work through SECURITY_CHECKLIST.md
- [ ] Add unit tests for parsing
- [ ] Add unit tests for quota logic
- [ ] Add RLS query tests
- [ ] Manual smoke test full flow
- [ ] Update CHANGELOG.md with final timestamp

## Known Issues and Gaps

### Critical Fixes Needed
1. **002_indexes.sql** references wrong columns:
   - Uses `owner_id` but tasks table has `pool_id`
   - Uses `state` but table has `status`
   - Uses `tags` column but tags are in separate `task_tags` table
   - Uses `today_suggestions` but table is `today_proposals`
   - Uses `suggester_id` but column is `proposed_by`

2. **Seed script** uses random UUIDs instead of real auth users

3. **Missing server-only client** for Next.js routes

### Design Decisions
- Use Next.js Route Handlers (not Server Actions) for API endpoints
- Keep service role key server-only, never expose to client
- Use RLS for all queries, including server-side
- Default visibility: owner for owner role, work for colleagues, household for spouse
- Quota enforcement: check count of proposals for date before insert
- Email parsing: use parseInline utility from packages/api

## Environment Setup

Required variables:
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
MAILGUN_SIGNING_KEY=
MAILGUN_DOMAIN=
APP_BASE_URL=
```

## Testing Strategy

### Unit Tests
- parseInline with various inputs
- Quota calculation logic
- Visibility rules

### Integration Tests
- RLS policies with different roles
- Task creation with tags
- Proposal limits

### Manual Smoke Tests
1. Colleague adds 2 suggestions (success), 3rd fails (quota)
2. Spouse adds 3 suggestions (success, higher limit)
3. Owner accepts proposal creates task
4. Owner declines proposal marks declined
5. Owner moves proposal changes date
6. Email creates task with correct visibility
7. Daily digest sends at scheduled time

## Risks and Mitigations

### Security Risks
- Service role key exposure: Keep in Next.js server env only
- HMAC verification: Use timing-safe comparison
- Email token rotation: Implement on-demand rotation
- Attachment access: Use signed URLs with expiry

### Performance Risks
- Large tag lists: Use GIN index on task_tags join
- Proposal queries: Use composite index on (pool_id, date, status)
- Mobile bundle size: Lazy load screens

### Reliability Risks
- Email delivery: Add exponential backoff retry
- Cron job failure: Add structured logging and alerts
- RLS policy bugs: Test with multiple roles thoroughly

## Next Steps After MVP

- Push notifications
- Recurring tasks
- Calendar view
- ICS export
- Offline sync for mobile
- Shared team pools
