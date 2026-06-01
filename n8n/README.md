# n8n integration — Nexora AI

## Overview

```
User schedules post → Supabase `scheduled_posts` (status: scheduled)
        ↓
n8n Cron (every 1 min) → Query `posts_ready_to_publish` view
        ↓
For each post → Platform API publish → `mark_post_published(post_id)`
        ↓
Email worker → Poll `notification_queue` → Send transactional emails
```

## Workflow 1: Scheduled publishing

**Trigger:** Schedule — every 1 minute

**Node 1 — Supabase (Postgres):** Select from view

```sql
SELECT * FROM public.posts_ready_to_publish;
```

**Node 2 — Loop** each row

**Node 3 — HTTP / platform node** publish using `access_token` + `content_payload`

**Node 4 — Supabase RPC** (service role key):

```sql
SELECT public.mark_post_published('{{ $json.id }}'::uuid, '{{ $json.external_post_id }}');
```

**On failure:** Update `scheduled_posts` set `status = 'failed'`, `error_message = '...'`

## Workflow 2: Email notifications

**Trigger:** Schedule — every 2 minutes

**Node 1 — Supabase:**

```sql
SELECT n.*, p.email, p.full_name
FROM notification_queue n
JOIN profiles p ON p.id = n.user_id
WHERE n.processed_at IS NULL
ORDER BY n.created_at
LIMIT 50;
```

**Node 2 — Switch** on `type`:

| type | Subject |
|------|---------|
| `welcome` | Welcome to Nexora AI |
| `post_scheduled` | Your post has been scheduled successfully |
| `post_published` | Your scheduled post has been published |

**Node 3 — Send email** (Resend, SendGrid, or SMTP)

**Node 4 — Mark processed:**

```sql
UPDATE notification_queue SET processed_at = now() WHERE id = '{{ $json.id }}';
```

## Environment variables (n8n)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (never expose to frontend)
- Email provider API key

## Supabase Auth emails

Configure in **Authentication → Email Templates**:

- Confirm signup
- Reset password

Enable **Confirm email** for production verification flow.
