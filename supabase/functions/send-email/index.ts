// ONEderland HRM — notification email through the company's SMTP account.
// Called by the app (js/backend.js) with the signed-in user's session. Rules:
//   • caller must be a linked employee (hrm_level() >= 1)
//   • every recipient must be the email of an employee in the directory (no open relay)
//   • the HTML is built HERE from a fixed template; every field from the app is escaped,
//     and the only link is a button back to the HRM site (allow-listed views)
// Secrets (Supabase → Edge Functions → Secrets):
//   SMTP_HOST, SMTP_PORT (465 or 587), SMTP_USER, SMTP_PASS, SMTP_FROM, optional HRM_SITE_URL
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
const cut = (s: unknown, n: number) => String(s ?? "").slice(0, n);
const VIEWS = new Set(["dashboard", "approvals", "myrequests", "reviews", "announcements", "profile", "reminders", "directory"]);

type Mail = {
  to?: unknown; subject?: unknown; body?: unknown;
  heading?: unknown; name?: unknown; intro?: unknown; rows?: unknown; quote?: unknown; tone?: unknown;
  cta?: { label?: unknown; go?: unknown; ref?: unknown };
};

function render(m: Mail, site: string) {
  const heading = cut(m.heading || m.subject, 150);
  const name = cut(m.name, 60);
  const intro = cut(m.intro || m.body, 2000);
  const rows = (Array.isArray(m.rows) ? m.rows : []).slice(0, 12)
    .map((r) => [cut(Array.isArray(r) ? r[0] : "", 60), cut(Array.isArray(r) ? r[1] : "", 400)])
    .filter(([k, v]) => k && v);
  const quote = cut(m.quote, 2000);
  const tones: Record<string, [string, string]> = { ok: ["#14804a", "#e3f5ea"], bad: ["#c2352b", "#fbe7e5"], warn: ["#b26205", "#fdf1df"], info: ["#3554f5", "#eaeefe"] };
  const [toneInk, toneBg] = tones[String(m.tone || "info")] || tones.info;
  const go = VIEWS.has(String(m.cta?.go || "")) ? String(m.cta!.go) : "dashboard";
  const ref = /^[A-Za-z0-9_-]{1,60}$/.test(String(m.cta?.ref || "")) ? String(m.cta!.ref) : "";
  const link = `${site}?go=${encodeURIComponent(go)}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}`;
  const label = cut(m.cta?.label || "Open in HRM", 40);
  const para = (t: string) => esc(t).split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3a4157">${p.replace(/\n/g, "<br>")}</p>`).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#151a2d">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(cut(intro, 140))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e6e8f0;border-radius:14px;overflow:hidden">
  <tr><td style="height:4px;background:${toneInk};line-height:4px;font-size:0">&nbsp;</td></tr>
  <tr><td style="padding:24px 28px 8px"><img src="${esc(site)}assets/logo.png" alt="ONEderland" width="170" style="display:block;width:170px;max-width:60%;height:auto;border:0"></td></tr>
  <tr><td style="padding:12px 28px 4px">
    <h1 style="margin:0 0 16px;font-size:21px;line-height:1.3;font-weight:700;color:#151a2d">${esc(heading)}</h1>
    ${name ? `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3a4157">Hi ${esc(name)},</p>` : ""}
    ${para(intro)}
  </td></tr>
  ${rows.length ? `<tr><td style="padding:4px 28px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${toneBg};border-radius:10px">
    ${rows.map(([k, v], i) => `<tr><td style="padding:${i ? 8 : 14}px 16px ${i === rows.length - 1 ? 14 : 8}px;font-size:13px;color:#6e7489;width:38%;vertical-align:top">${esc(k)}</td><td style="padding:${i ? 8 : 14}px 16px ${i === rows.length - 1 ? 14 : 8}px;font-size:14px;color:#151a2d;font-weight:600;vertical-align:top">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}
  </table></td></tr>` : ""}
  ${quote ? `<tr><td style="padding:10px 28px 4px"><div style="border-left:3px solid #c9d3fd;background:#f5f6fa;border-radius:0 8px 8px 0;padding:12px 16px;font-size:14px;line-height:1.6;color:#3a4157">${esc(quote).replace(/\n/g, "<br>")}</div></td></tr>` : ""}
  <tr><td style="padding:20px 28px 28px"><a href="${esc(link)}" style="display:inline-block;background:#3554f5;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px">${esc(label)}</a>
    <p style="margin:14px 0 0;font-size:12px;color:#6e7489">Or open <a href="${esc(link)}" style="color:#3554f5">${esc(site)}</a></p></td></tr>
  <tr><td style="padding:16px 28px;border-top:1px solid #e6e8f0;font-size:12px;line-height:1.5;color:#6e7489">ONEderland HRM · automatic notification. HRD can change which emails are sent in Settings → Notifications. Please don't reply to this email.</td></tr>
</table></td></tr></table></body></html>`;

  const text = [heading, "", name ? `Hi ${name},` : "", intro, "", ...rows.map(([k, v]) => `${k}: ${v}`), quote ? `\n"${quote}"` : "", "", `${label}: ${link}`, "", "— ONEderland HRM (automatic notification)"]
    .filter((x, i, a) => !(x === "" && a[i - 1] === "")).join("\n");
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

  const auth = req.headers.get("Authorization") || "";
  const key = env("SUPABASE_ANON_KEY") || req.headers.get("apikey") || "";
  const sb = createClient(env("SUPABASE_URL"), key, { global: { headers: { Authorization: auth } } });

  const { data: level, error: lerr } = await sb.rpc("hrm_level");
  if (lerr || typeof level !== "number" || level < 1) return json(403, { error: "not_allowed" });

  let m: Mail;
  try { m = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  const to = (Array.isArray(m.to) ? m.to : [m.to]).map((x) => String(x || "").trim().toLowerCase()).filter(Boolean);
  const subject = cut(m.subject, 200).replace(/[\r\n]+/g, " ");
  if (!to.length || to.length > 5 || !subject || !(m.intro || m.body || m.heading)) return json(400, { error: "bad_request" });

  const { data: rows, error: rerr } = await sb.from("docs").select("data").eq("col", "employees");
  if (rerr) return json(500, { error: "lookup_failed" });
  const known = new Set((rows || []).map((r: { data: { email?: string } }) => String(r.data?.email || "").trim().toLowerCase()).filter(Boolean));
  if (!to.every((t) => known.has(t))) return json(403, { error: "recipient_not_employee" });

  const { html, text } = render(m, site);
  const port = Number(env("SMTP_PORT") || 465);
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  try {
    const info = await transport.sendMail({ from: env("SMTP_FROM") || user, to, subject, text, html });
    return json(200, { ok: true, id: info.messageId });
  } catch (e) {
    console.error("smtp", e);
    return json(502, { error: "smtp_failed" });
  }
});
