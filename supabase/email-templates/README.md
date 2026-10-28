# Supabase Auth email templates — ONEderland HRM

Paste each template into **Supabase Dashboard → Authentication → Emails → Templates** (subject + *Source*).

| Template in Supabase | Subject | File |
|---|---|---|
| Invite user | `[HRM] You're invited to ONEderland HRM` | `invite.html` |
| Reset password | `[HRM] Reset your password` | `recovery.html` |
| Confirm signup | `[HRM] Confirm your email` | `confirm-signup.html` |
| Magic link | `[HRM] Your sign-in link` | `magic-link.html` |
| Change email address | `[HRM] Confirm your new email address` | `email-change.html` |
| Reauthentication | `[HRM] Your verification code` | `reauthentication.html` |

Notes:
- *Reset password* and *Invite user* link to the HRM with `{{ .TokenHash }}`: the token is only used when the person saves a password, so mail scanners can't use the link up.
- The HRM itself sends invitations (function `send-email`) and "Forgot password" emails (function `auth-mail`) with the same design; these templates cover anything Supabase still sends by itself.
