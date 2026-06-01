# Nexora AI — Production architecture

## Application routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing |
| `/signup` | Registration + verification |
| `/login` | Authentication |
| `/dashboard` | Home + stats |
| `/dashboard/publishing` | Multi-platform composer |
| `/dashboard/scheduler` | Schedule + manage posts |
| `/dashboard/accounts` | Social connections |
| `/dashboard/settings` | Profile + timezone |

## Database tables

- **profiles** — user metadata, default timezone
- **connected_accounts** — platform OAuth / connection records
- **drafts** — saved composer state
- **scheduled_posts** — future publishes (n8n picks up)
- **published_posts** — completed publishes
- **notification_queue** — email jobs for n8n

## Security

- Row Level Security on all user tables
- `email_exists()` RPC for login UX (limited enumeration risk)
- `mark_post_published()` — service role only
- Anon key in frontend; service role in n8n only

## Email notifications

Queued in `notification_queue` on:

- Signup (welcome — via DB trigger)
- Post scheduled (app)
- Post published (n8n RPC)

Processed by n8n Workflow 2 (see `n8n/README.md`).
