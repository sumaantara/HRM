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

### Accounts are invitation-only
1. HRD adds the employee (one by one or by Excel import) with their **work email**.
2. The HRM emails an invitation automatically (switch: Settings → Notifications). HRD can also press
   **Send / Resend invitation** on the profile, or **Invite everyone not yet invited** in System → Accounts.
3. The person clicks **Set my password**, chooses a password and lands in the app — the account is already
   connected to their profile (verified email). Later sign-ins: work email + password, or *Forgot password?*.

### Sign-in security

- **Two-step verification (authenticator app, TOTP)** is **required** for the owner, Admin, HRD, GM/Director (job level with GM access) and anyone with Payroll access. It's **optional** for other staff (My Profile → Sign-in security); once someone turns it on it's required for them too.
- Enforced in the database (`0006_mfa.sql`): until the session is verified with the code (JWT `aal2`), `hrm_level()` is 0 and payroll / own-payslip checks return nothing — a stolen password alone gives no data.
- First sign-in after getting such access shows a QR code to scan with Google Authenticator, Microsoft Authenticator or Authy. Lost phone: an Admin uses **Reset 2-step** on the person's profile (or System → Accounts & Access); the owner's own authenticator can only be reset by the owner, or in the Supabase dashboard (Authentication → Users → the user → remove MFA factor).
- **Idle sign-out:** after 30 minutes without activity (shared across tabs; warning 2 minutes before) the session ends. Reopening the site after more than 30 minutes away also signs out. Optional extra server-side limit on paid Supabase plans: Authentication → Sessions → Inactivity timeout.

### How employees, attendance and payroll connect

- **Employee ID** (e.g. `ONE-0024`) is the key everywhere a person types or uploads data: employee import, daily/WFH attendance sheets and the salary sheet.
- **Fingerprint machines (F1/F2)** don't know the Employee ID, and machine user numbers restart at 1 on every machine, so they are **never** used. Each profile has a **Name on attendance machine** (e.g. Siti Rahmawati → `Siti`; several names separated by commas). Uploads match that name, case- and space-insensitive, only within the office chosen for the file. Exact full name is the only automatic fallback; a first-name match is just a suggestion HR confirms. The name must be unique per office (the profile form refuses duplicates). A name picked during import is saved on the profile.
- **Payroll ← attendance:** the salary template is made for a month and carries each person's recap for that month (work days, present, late, absent, leave, WFH, work hours, overtime hours — same numbers as the Attendance report, marked "(info)", ignored on upload). With an overtime rate set in Payroll → Payslip layout, the Overtime column is pre-filled (hours × rate). Overtime = time after the scheduled end on workdays + all hours on days off, counting days with at least the minimum (default 30 min). The upload preview shows attendance next to each payslip and warns when attendance has overtime but the sheet doesn't.

### Payroll & payslips

- **Who runs payroll:** employees with the *Payroll access* flag (set by HRD/Admin on the employee form or in System → Access), plus HRD and Admin. They see **Finance → Payroll**.
- **Monthly flow:** *Salary template* (pre-filled with active employees) → fill the amounts → *Upload salaries* → choose month and pay date → check the preview → *Publish*. Uploading the same month again replaces those payslips (marked *revised*, same number).
- **The PDF** is built server-side by the `payslip` Edge Function in the company layout (letterhead, division, income, deductions, take home pay, Accounting signature + company stamp, "ASLI"). Upload the letterhead, stamp and signature once in **Payroll → Payslip layout**.
- **Password:** every payslip PDF opens only with the employee's date of birth as `DDMMYYYY` (from the private profile). Employees without a date of birth are skipped and reported. PDF encryption (RC4) is basic; the real protection is that each file sits in a private bucket only the employee and payroll can read.
- **Employees** download their payslips any time from **Me → My Payslips** (also a tab on their profile) and get a notification + email (no amounts in the email).

## One-time setup (Supabase dashboard)

1. **Authentication → URL Configuration**
   - Site URL: `https://sumaantara.github.io/HRM/`
   - Redirect URLs: add `https://sumaantara.github.io/HRM/**`
2. **Authentication → Sign In / Providers:** turn **Allow new users to sign up = OFF** (accounts come only from
   HR invitations). Under **Email** keep **Confirm email = ON**, minimum password length 8, and set
   **Email OTP Expiration** to `86400` seconds so invitation links stay valid for 24 hours.
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
