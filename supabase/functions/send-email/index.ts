// ONEderland HRM — send a notification email through the company's SMTP account.
// Called by the app (js/backend.js) with the signed-in user's session. Rules:
//   • caller must be a linked employee (hrm_level() >= 1)
//   • every recipient must be the email of an employee in the directory (no open relay)
//   • at most 5 recipients, short subject/body
// Configure once in Supabase → Edge Functions → Secrets:
//   SMTP_HOST, SMTP_PORT (465 or 587), SMTP_USER, SMTP_PASS, SMTP_FROM (e.g. "ONEderland HRM <hr@yourdomain.com>")
import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const env = (k: string) => Deno.env.get(k) || "";
  const host = env("SMTP_HOST"), user = env("SMTP_USER"), pass = env("SMTP_PASS");
  if (!host || !user || !pass) return json(503, { error: "email_not_configured" });

  const auth = req.headers.get("Authorization") || "";
  const key = env("SUPABASE_ANON_KEY") || req.headers.get("apikey") || "";
  const sb = createClient(env("SUPABASE_URL"), key, { global: { headers: { Authorization: auth } } });

  const { data: level, error: lerr } = await sb.rpc("hrm_level");
  if (lerr || typeof level !== "number" || level < 1) return json(403, { error: "not_allowed" });

  let payload: { to?: unknown; subject?: unknown; body?: unknown };
  try { payload = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  const to = (Array.isArray(payload.to) ? payload.to : [payload.to]).map((x) => String(x || "").trim().toLowerCase()).filter(Boolean);
  const subject = String(payload.subject || "").slice(0, 200);
  const body = String(payload.body || "").slice(0, 20000);
  if (!to.length || to.length > 5 || !subject || !body) return json(400, { error: "bad_request" });

  // recipients must be employees (read with the caller's own rights — employees can read the directory)
  const { data: rows, error: rerr } = await sb.from("docs").select("data").eq("col", "employees");
  if (rerr) return json(500, { error: "lookup_failed" });
  const known = new Set((rows || []).map((r: { data: { email?: string } }) => String(r.data?.email || "").trim().toLowerCase()).filter(Boolean));
  if (!to.every((t) => known.has(t))) return json(403, { error: "recipient_not_employee" });

  const port = Number(env("SMTP_PORT") || 465);
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  try {
    const info = await transport.sendMail({ from: env("SMTP_FROM") || user, to, subject, text: body });
    return json(200, { ok: true, id: info.messageId });
  } catch (e) {
    console.error("smtp", e);
    return json(502, { error: "smtp_failed" });
  }
});
