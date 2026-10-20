# ONEderland HRM

Human resource management for ONEderland: employee profiles and contracts, leave & WFH with multi-level approvals,
leave quotas, performance reviews, recruitment, announcements, attendance import, reminders, backups and audit.

- **Site:** GitHub Pages — `https://sumaantara.github.io/HRM/`
- **Data, sign-in, files, email:** Supabase project `HRM` (Tokyo, `xsjjlorhevjewxyogidj`)

## How it fits together

```
Browser ──► GitHub Pages (index.html, js/app.js, js/backend.js)        static files, no secrets
   │
   └──► Supabase
         ├─ Auth            email + password / email link, verified emails only
         ├─ Postgres        public.docs  (every record, addressed by path, e.g. employees/e10)
         │                  Row Level Security decides who may read/write each path
         ├─ Realtime        live updates of public.docs
         ├─ Storage         files (photos, logo) · backups (cloud backups) — both private
         ├─ Edge Function   send-email (SMTP, recipients must be employees)
         └─ pg_cron         nightly snapshot 18:00 UTC (02:00 WITA), retention clean-up
```

### Who can see what (enforced in the database)

| Level | Who | Can |
|---|---|---|
| 3 Owner | the account whose verified email is `hrm.settings.owner_email` | everything, incl. restore |
| 2 HR editor | profile with role **HRD** or **General Manager**, or **Admin** flag | confidential data (contracts, quota ledger, phone, notes), reviews, candidates, settings, backups |
| 1 Employee | signed-in account linked to an active profile | own requests, approvals for their team, announcements, directory |
| 0 Not linked | signed in, no profile yet | only their own link request |
| — Signed out | anyone | nothing |

The level is computed on the server from the employee profile (`public.hrm_level()`), so changing someone's role in the
app changes their access within a minute. A profile set to **Resigned** loses access automatically.

### Account linking
1. HRD puts each person's **work email** on their profile.
2. The person opens the site → **Create your account** with that email → confirms the email.
3. On first sign-in the account connects to the profile automatically (verified email match).
   Without a matching email the person can send a request with Employee ID + full name; HRD/Admin approve it
   in Employees or System → Accounts.

## One-time setup (Supabase dashboard)

1. **Authentication → URL Configuration**
   - Site URL: `https://sumaantara.github.io/HRM/`
   - Redirect URLs: add `https://sumaantara.github.io/HRM/**`
2. **Authentication → Sign In / Providers → Email:** keep **Confirm email = ON** (required — linking trusts verified emails).
   Set minimum password length to 8.
3. **Authentication → SMTP Settings → Enable custom SMTP** (required: the built-in sender only delivers to your own
   Supabase team, max a few emails per hour). Example with Gmail (needs 2-Step Verification + an App Password):
   host `smtp.gmail.com`, port `465`, user `your@gmail.com`, password = the 16-character app password,
   sender name `ONEderland HRM`. Then raise **Rate Limits → emails per hour** to ~100.
4. **Edge Functions → Secrets** (for notification emails from the app — same SMTP account):
   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (e.g. `ONEderland HRM <your@gmail.com>`).
5. **SQL Editor:** run `supabase/migrations/0004_retention.sql` once (retention jobs + removes API access for signed-out
   visitors + clears the rows used while testing the rules).
6. **GitHub → repo Settings → Pages:** Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`.

The owner email is stored in the database, not in this repo:
```sql
insert into hrm.settings(key, value) values ('owner_email', 'owner@company.com')
  on conflict (key) do update set value = excluded.value;
```

## Backups — three layers
1. **Nightly server snapshot** (automatic, inside Postgres): daily kept 30 days, Sundays 6 months, manual 90 days.
   System → Backup & Restore → *Server snapshots* → Download or *Load into Restore*.
2. **Cloud backup** (one click, HRD/Admin): JSON file in the private `backups` storage bucket.
3. **Downloaded backup**: keep a copy outside Supabase (company laptop / shared drive). Treat it like payroll data.

All backups are the same JSON format with a SHA-256 checksum; Restore verifies it and downloads a safety copy of the
current data before writing. On the Supabase **Pro** plan you also get provider-level daily backups and no pausing —
recommended for production (the free plan pauses a project after 7 days without activity).

## Maintenance
| When | What |
|---|---|
| Weekly | Back up when the banner asks; clear *Needs attention* on the dashboard |
| Monthly | Upload attendance; System → Health shows zero integrity issues; Supabase → Advisors shows no security warnings |
| Quarterly | Restore drill (load a snapshot into Restore, stop before typing RESTORE); review audit log |
| Someone leaves | Set profile to Resigned (access ends), unlink in System → Accounts |

Server-side change log (who changed which record, kept ~13 months): `select * from hrm.changelog order by id desc limit 100;`

## Development
- `index.html`, `js/app.js` were generated once from the original Claude artifact with `tools/port.py`; edit them directly from now on.
- `js/backend.js` maps the app's small document API onto Supabase. `js/config.js` holds the public URL and publishable key
  (safe to publish — never put a `service_role`/secret key in this repo).
- Database changes: add a new numbered file in `supabase/migrations/` and apply it in the SQL editor.
- Hosting is static: any push to `main` redeploys GitHub Pages in about a minute. Roll back with `git revert`.

*This setup handles personal data under Indonesia's UU PDP; this README is operational guidance, not legal advice.*
