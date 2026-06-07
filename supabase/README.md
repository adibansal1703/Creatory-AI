# Supabase setup — Creatory AI

## Run migrations (in order)

1. `migrations/20260331120000_scheduled_posts.sql` (if not already applied)
2. `migrations/20260401000000_production_schema.sql` — **full production schema**

Open **SQL Editor** in Supabase Dashboard → paste → Run.

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile + timezone |
| `connected_accounts` | Social platform connections |
| `drafts` | Saved composer drafts |
| `scheduled_posts` | Posts waiting to publish |
| `published_posts` | Published content history |
| `notification_queue` | Email jobs for the email worker |

## Auth settings

1. **Authentication → Providers → Email** — Enable email confirmations for production.
2. **URL Configuration** — Add these redirect URLs:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/auth/instagram/callback`
   - `http://localhost:5173/**` (or your production domain equivalents)
3. Customize email templates: Welcome, Confirm signup, Reset password.

Register the Instagram callback URL in the Meta Developer Console as well.

## RLS

All user tables enforce `auth.uid() = user_id`. Service role bypasses RLS for scheduler and email worker scripts.

## Background workers

- `npm run run:scheduler` — publishes scheduled posts
- `npm run run:email-worker` — sends queued emails
