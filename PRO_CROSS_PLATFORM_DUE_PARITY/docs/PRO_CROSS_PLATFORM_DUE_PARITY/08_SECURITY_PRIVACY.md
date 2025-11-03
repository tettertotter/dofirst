# Security & Privacy (Pro)

- RLS everywhere; no service role in clients.
- Mailgun webhook HMAC verify + timestamp age check.
- Rate limiting: per-IP and per-user for write routes; use Postgres function or external KV.
- Attachments private with signed URLs; minimal retention.
- Logging: request IDs, schedule decisions; PII scrubbing in logs.
