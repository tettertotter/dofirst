# API Contracts (server-only handlers; Zod-validated)

POST /api/tasks.quickAdd
- body: { title, notes?, due?, parseNatural?: boolean, tags?: string[], priority?: 1..5, source: 'app'|'voice'|'email' }
- result: { taskId }

POST /api/today.suggest
- body: { ownerId, suggestedDate, taskId? | suggestedTitle? }
- errors: 409 quota_exceeded

POST /api/today.decide
- body: { suggestionId, decision: 'accept'|'decline'|'move', moveToDate? }
- result: { status }

POST /api/webpush/subscribe
- body: PushSubscription JSON
- result: { ok: true }

POST /api/webpush/send
- body: { userId, payload }
- result: { ok: true }
