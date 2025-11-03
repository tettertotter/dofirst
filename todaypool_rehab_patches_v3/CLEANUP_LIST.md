# Cleanup (remove clashing demo pages) — 2025-11-03 04:17 UTC

Delete these old pages to let the new app shell shine:

Web:
- apps/web/app/page.tsx (legacy sandbox page)
- apps/web/app/design-system-demo/page.tsx
- apps/web/app/mobile-ux-test/page.tsx
- apps/web/app/test-push/page.tsx
- apps/web/app/test-snooze/page.tsx

Mobile:
- apps/mobile/app/index.tsx (replaced by redirect in this patch)

After deleting, run:
  pnpm --filter @todaypool/web dev
  pnpm --filter @todaypool/mobile start
Then visit /today on web and the Today tab on mobile.
