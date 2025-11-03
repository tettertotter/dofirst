# Test Plan

- Unit: parsing, recurrence next-instance generation, nagging schedule.
- Integration: API quota enforcement; email inbound parsing; Web Push subscribe/send loop.
- E2E: Playwright for web (push actions mocked); Detox for mobile (notification intent mocked).
- Manual: Cross-platform acceptance doc must pass on all three platforms.
