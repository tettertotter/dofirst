# Security Checklist

- [ ] RLS enabled for all user tables with least-privilege policies
- [ ] No Service Role key exposed to browser or mobile clients
- [ ] Next.js server handlers use Service Role via server-only environment
- [ ] Mailgun webhook signature verified with HMAC + timestamp age check
- [ ] Inbound email tokens are 24+ chars, rotated on demand
- [ ] Attachments stored in private bucket with signed URLs
- [ ] Secrets stored in Vercel/Supabase vaults, never committed
- [ ] Rate limiting on API routes (IP + user) to prevent abuse
- [ ] Structured logs with request IDs for auditability
