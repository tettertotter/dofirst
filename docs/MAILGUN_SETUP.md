# Mailgun Inbound Email Setup

## Overview

The mailgun-inbound edge function allows you to create tasks by sending emails to a special address like `mytasks@yourdomain.com`.

## Prerequisites

1. Mailgun account (free tier works for testing)
2. A domain (or use Mailgun sandbox for testing)
3. Supabase project with edge functions enabled

## Step 1: Get Mailgun Credentials

### Option A: Sandbox Domain (Testing)

1. Sign up at https://mailgun.com
2. Go to **Sending > Domains**
3. You'll see a sandbox domain like `sandboxXXX.mailgun.org`
4. Click on it and note:
   - Domain name (for routes)
   - HTTP webhook signing key (in Settings > Webhooks)
5. Add authorized recipients (Settings > Authorized Recipients)
   - Add your own email for testing

### Option B: Custom Domain (Production)

1. Go to **Sending > Domains > Add New Domain**
2. Enter your domain (e.g., `tasks.dofirst.today`)
3. Add DNS records shown by Mailgun:
   - TXT records for domain verification
   - MX records for receiving mail
   - CNAME for tracking (optional)
4. Wait for DNS propagation (5-30 minutes)
5. Verify domain is active (green checkmark)
6. Get HTTP webhook signing key from Settings > Webhooks

## Step 2: Deploy Edge Function

```bash
# From repo root
supabase functions deploy mailgun-inbound

# Set environment variables in Supabase dashboard
# Go to Edge Functions > mailgun-inbound > Settings
```

Required environment variables for the edge function:
```
MAILGUN_SIGNING_KEY=<your-webhook-signing-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Get the function URL from Supabase dashboard. It will be something like:
```
https://xxxxx.supabase.co/functions/v1/mailgun-inbound
```

## Step 3: Create Email Alias in Database

Create an alias that maps to your pool:

```sql
-- Get your pool ID
SELECT id, name FROM pools WHERE owner_id = auth.uid();

-- Create an alias
INSERT INTO email_aliases (pool_id, alias_local, provider)
VALUES (
  'YOUR_POOL_ID',
  'mytasks',  -- The part before @
  'mailgun'
)
RETURNING *;
```

This creates the address `mytasks@yourdomain.com` (or `mytasks@sandboxXXX.mailgun.org` for sandbox).

## Step 4: Configure Mailgun Route

1. In Mailgun dashboard, go to **Sending > Receiving > Routes**
2. Click **Create Route**
3. Configure:

**Expression type:** Match Recipient
**Recipient:** `mytasks@yourdomain.com` (use your alias and domain)

**Actions:**
- ✅ Forward
- **URL:** `https://xxxxx.supabase.co/functions/v1/mailgun-inbound`

**Priority:** 0
**Description:** TodayPool inbound tasks

4. Save route

## Step 5: Test Email-to-Task

Send an email to `mytasks@yourdomain.com`:

**Subject:**
```
Buy groceries #personal !2
```

**Body:**
```
Milk, bread, eggs
@today
```

This should create a task with:
- Title: "Buy groceries"
- Tag: personal
- Priority: 2
- Today proposal for today's date

**Verify in database:**
```sql
SELECT
  t.title,
  t.priority,
  array_agg(tag.name) as tags,
  tp.date as today_date,
  tp.status
FROM tasks t
LEFT JOIN task_tags tt ON t.id = tt.task_id
LEFT JOIN tags tag ON tt.tag_id = tag.id
LEFT JOIN today_proposals tp ON t.id = tp.task_id
WHERE t.title ILIKE '%groceries%'
GROUP BY t.id, tp.date, tp.status;
```

## Email Syntax

**In subject or body, use:**
- `#tagname` - Add tags (e.g., #work #urgent)
- `!1` to `!5` - Set priority (1 = highest)
- `@today` - Create today proposal for today
- `@2025-11-05` - Create proposal for specific date

**Examples:**

1. Simple task:
   ```
   Subject: Review PR #work !1
   Body: (empty or details)
   ```
   Creates: Task with work tag, priority 1

2. Today proposal:
   ```
   Subject: Call dentist @today
   Body: Schedule cleaning
   ```
   Creates: Task + today proposal for today

3. Future proposal:
   ```
   Subject: Birthday gift for mom @2025-11-25 #personal
   Body: Ideas: book, scarf
   ```
   Creates: Task + proposal for Nov 25

## Troubleshooting

### Email not received

1. **Check Mailgun logs:**
   - Go to Sending > Logs
   - Filter by recipient
   - Look for 200 response from webhook

2. **Check route is active:**
   - Go to Receiving > Routes
   - Ensure route is enabled
   - Verify expression matches your email

3. **Check Supabase function logs:**
   ```bash
   supabase functions logs mailgun-inbound
   ```
   Look for errors or "alias not found"

### Alias not found error

```sql
-- Verify alias exists
SELECT * FROM email_aliases WHERE alias_local = 'mytasks';

-- If not, create it:
INSERT INTO email_aliases (pool_id, alias_local, provider)
VALUES ('YOUR_POOL_ID', 'mytasks', 'mailgun');
```

### Invalid signature error

- Verify `MAILGUN_SIGNING_KEY` in edge function settings
- Get key from Mailgun dashboard > Settings > Webhooks > HTTP webhook signing key
- Note: This is NOT the same as API key

### Task created but no tags

- Tags are case-insensitive and normalized to lowercase
- Only alphanumeric, dash, and underscore allowed
- Max 32 characters per tag

## Multiple Aliases

You can create multiple aliases for different purposes:

```sql
-- Personal tasks
INSERT INTO email_aliases (pool_id, alias_local, provider)
VALUES ('YOUR_POOL_ID', 'personal', 'mailgun');

-- Work tasks
INSERT INTO email_aliases (pool_id, alias_local, provider)
VALUES ('YOUR_POOL_ID', 'work', 'mailgun');

-- Ideas inbox
INSERT INTO email_aliases (pool_id, alias_local, provider)
VALUES ('YOUR_POOL_ID', 'ideas', 'mailgun');
```

Then email to:
- `personal@yourdomain.com`
- `work@yourdomain.com`
- `ideas@yourdomain.com`

All go to the same pool but you can filter by source later.

## Security Notes

1. **HMAC verification:** Every inbound webhook is verified with Mailgun's signature to prevent spoofing
2. **Timestamp check:** Only accepts requests within 5 minutes to prevent replay attacks
3. **Service role key:** Stored in Supabase edge function secrets, never exposed
4. **Sender mapping:** For MVP, all tasks are created by pool owner with sender noted in description
5. **Private storage:** Future attachment support will use signed URLs with expiry

## Cost Estimates

**Mailgun:**
- Free tier: 5,000 emails/month
- Pay-as-you-go: $0.80 per 1,000 emails

**Supabase Edge Functions:**
- 500,000 invocations/month free
- $2 per 1 million after that

For personal use, both should stay within free tier.

## Next Steps

Once email-to-task is working:
- Add attachment support (save to Supabase Storage)
- Map sender email to pool member (requires email in profiles)
- Add reply-to-update feature (email thread becomes task comments)
- Add forwarding rules (forward from Gmail/Outlook to your alias)
