# Environment Setup Guide

## Overview

TodayPool requires configuration across three locations:
1. Repository root `.env` (for tooling/scripts)
2. `apps/web/.env.local` (for Next.js)
3. `apps/mobile/.env` (for Expo)

## Required Services

### 1. Supabase Project
Create a new Supabase project at https://supabase.com

**Get these values from Project Settings > API:**
- `SUPABASE_URL` (Project URL)
- `SUPABASE_ANON_KEY` (anon public key)
- `SUPABASE_SERVICE_ROLE_KEY` (service_role secret key)

**CRITICAL:** Never commit service role key or expose it to browser/mobile clients.

### 2. Resend Account
Sign up at https://resend.com

**Get these values:**
- `RESEND_API_KEY` from API Keys page
- Verify a sending domain or use resend.dev for testing

### 3. Mailgun Account
Sign up at https://mailgun.com

**Get these values:**
- `MAILGUN_SIGNING_KEY` from Settings > Webhooks > HTTP webhook signing key
- `MAILGUN_DOMAIN` (e.g., inbound.dofirst.today)

## Configuration Files

### Repository Root: `.env`

```bash
# For seed scripts and tooling
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Web App: `apps/web/.env.local`

```bash
# Public (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Server-only (never exposed)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
RESEND_API_KEY=re_...

# App config
APP_BASE_URL=http://localhost:3000
```

### Mobile App: `apps/mobile/.env`

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Verification Checklist

Before running the app, verify:

- [ ] Supabase project created
- [ ] Database migrations applied (001_init.sql, 002_indexes.sql)
- [ ] RLS enabled on all tables
- [ ] Storage bucket `attachments` created (private)
- [ ] `.env` files created with actual values (not placeholder)
- [ ] Service role key is ONLY in server-side files
- [ ] Resend domain verified or using resend.dev
- [ ] Mailgun webhook signing key obtained

## Security Notes

1. **Service Role Key:** Has full admin access, bypasses RLS. ONLY use in:
   - Repository root `.env` for seed scripts
   - `apps/web/.env.local` for Next.js API routes
   - Supabase Edge Functions via Deno.env

   NEVER use in browser or mobile client code.

2. **Git Ignore:** All `.env` and `.env.local` files are gitignored. Never commit secrets.

3. **Production:** Use Vercel/Netlify environment variables, not `.env` files.

## Readiness Test

Run this command to verify environment is ready:

```bash
# From repo root
node -e "console.log('Supabase URL:', process.env.SUPABASE_URL?.slice(0,20) + '...', '✓'); console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0,10) + '...', '✓');"
```

Should output:
```
Supabase URL: https://xxxxx... ✓
Service Key: eyJhbGc... ✓
```
