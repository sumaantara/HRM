// ONEderland HRM — "Forgot password" email, sent through the company's SMTP account with the HRM's own template
// (instead of Supabase's default email). Called from the sign-in screen without a session, so:
//   • it never says whether an email exists (always answers {ok:true})
//   • only active employees in the directory who already have an account get a link
//   • one email per address every 2 minutes (a new link cancels the previous one) and at most 40 per 10 minutes overall
//   • the link carries a hashed token that is only used when the person saves a new password, so mail scanners can't use it up
// Deploy with verify_jwt = false (the sign-in screen has no session); secrets as send-email: SMTP_HOST, SMTP_PORT, SMTP_USER,
// SMTP_PASS, SMTP_FROM, optional HRM_SITE_URL.
import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const sha = async (t: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);

function resetMail(site: string, link: string, first: string, email: string) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>Reset your password</title></head>
<body style="margin:0;padding:0;background:#eef1f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#151a2d;-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Choose a new password for ONEderland HRM. The link works once.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f8;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
  <tr><td style="padding:0 4px 18px"><img src="${esc(site)}assets/logo.png" alt="ONEderland" width="150" style="display:block;width:150px;height:auto;border:0"></td></tr>
  <tr><td style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 1px 2px rgba(21,26,45,.06),0 8px 28px rgba(21,26,45,.06)">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="height:6px;line-height:6px;font-size:0;background:#3554f5;background-image:linear-gradient(90deg,#3554f5,#7c4ddb)">&nbsp;</td></tr>
      <tr><td style="padding:34px 36px 8px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:52px;height:52px;border-radius:14px;background:#eaeefe;text-align:center;vertical-align:middle;font-size:24px;line-height:52px">&#128273;</td></tr></table>
        <h1 style="margin:22px 0 10px;font-size:23px;line-height:1.3;font-weight:700;color:#151a2d">Reset your password</h1>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#3a4157">Hi ${esc(first || "there")},</p>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#3a4157">Someone (hopefully you) asked to reset the password for your ONEderland HRM account. Choose a new one with the button below.</p>
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:12px;background:#3554f5"><a href="${esc(link)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px">Choose a new password</a></td></tr></table>
      </td></tr>
      <tr><td style="padding:22px 36px 6px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;border-radius:12px"><tr><td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#3a4157">
          <b style="color:#151a2d">Sign-in email:</b> ${esc(email)}<br>The link works once. Asking for another reset cancels this one.</td></tr></table>
      </td></tr>
      <tr><td style="padding:16px 36px 30px;font-size:13px;line-height:1.6;color:#6e7489">Didn't ask for this? You can ignore this email — your password stays the same. If you keep getting these emails, tell HR.</td></tr>
    </table></td></tr>
  <tr><td style="padding:18px 8px 0;font-size:12px;line-height:1.6;color:#8a90a6;text-align:center">Button not working? Copy this link into your browser:<br><a href="${esc(link)}" style="color:#3554f5;word-break:break-all">${esc(link)}</a></td></tr>
  <tr><td style="padding:14px 8px 0;font-size:12px;line-height:1.6;color:#8a90a6;text-align:center">ONEderland HRM · automatic email, please don't reply.</td></tr>
</table></td></tr></table></body></html>`;
  const text = `Reset your password\n\nHi ${first || "there"},\n\nSomeone (hopefully you) asked to reset the password for your ONEderland HRM account (${email}).\nChoose a new password: ${link}\n\nThe link works once. Asking for another reset cancels this one.\nDidn't ask for this? Ignore this email — your password stays the same.\n\n— ONEderland HRM`;
  return { html, text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  const env = (k: string) => Deno.env.get(k) || "";
  const host = env("SMTP_HOST"), user = env("SMTP_USER"), pass = env("SMTP_PASS");
  if (!host || !user || !pass) return json(503, { error: "email_not_configured" });
  let site = env("HRM_SITE_URL") || "https://sumaantara.github.io/HRM/";
  if (!site.endsWith("/")) site += "/";

  let body: { action?: unknown; email?: unknown };
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  if (body.action !== "recover") return json(400, { error: "bad_request" });
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)) return json(400, { error: "bad_email" });

  const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  const now = Date.now(), ok = () => json(200, { ok: true });

  // rate limits (kept in docs/authrl/*, which only the server reads and writes)
  const key = "authrl/" + await sha("recover:" + email);
  const { data: rl } = await admin.from("docs").select("data").eq("path", key).maybeSingle();
  if (rl && now - Number((rl.data as Record<string, unknown>)?.at || 0) < 120000) return ok();
  const { data: g } = await admin.from("docs").select("data").eq("path", "authrl/_global").maybeSingle();
  const gd = (g?.data || {}) as { from?: number; n?: number };
  const windowFresh = gd.from && now - gd.from < 600000;
  if (windowFresh && (gd.n || 0) >= 40) return ok();
  await admin.from("docs").upsert({ path: "authrl/_global", col: "authrl", data: windowFresh ? { from: gd.from, n: (gd.n || 0) + 1 } : { from: now, n: 1 } });
  await admin.from("docs").upsert({ path: key, col: "authrl", data: { at: now } });

  // only active employees with an account
  const { data: rows } = await admin.from("docs").select("data").eq("col", "employees").ilike("data->>email", email);
  const e = (rows || []).map((r: { data: Record<string, unknown> }) => r.data).find((d) => String(d.email || "").trim().toLowerCase() === email && !d.system && d.status !== "Resigned" && d.userId);
  if (!e) return ok();

  const gen = await admin.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: site } });
  const hashed = gen.data?.properties?.hashed_token;
  if (gen.error || !hashed) { console.error("generateLink", gen.error?.message); return ok(); }
  const link = `${site}#vt=recovery&th=${encodeURIComponent(hashed)}&em=${encodeURIComponent(email)}`;
  const { html, text } = resetMail(site, link, String(e.name || "").split(" ")[0], email);
  try {
    const port = Number(env("SMTP_PORT") || 465);
    await nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
      .sendMail({ from: env("SMTP_FROM") || user, to: email, subject: "[HRM] Reset your password", text, html });
  } catch (err) { console.error("smtp", String(err)); }
  return ok();
});
