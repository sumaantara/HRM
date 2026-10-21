// ONEderland HRM — approved leave → shared Google Calendar.
// Uses a Google service account that has "Make changes to events" on one company calendar.
// Secrets (Supabase → Edge Functions → Secrets):
//   GOOGLE_SERVICE_ACCOUNT  the service account's JSON key (whole file)
//   GOOGLE_CALENDAR_ID      the calendar's ID (Google Calendar → calendar settings → Integrate calendar)
// actions:
//   "sync"     {id}  any signed-in employee; the request is re-read here, so the event always matches the database:
//                    approved → event created/updated, anything else → event removed
//   "backfill"       HRD / GM / Admin: approved leave ending in the last 30 days or later
//   "status"         HRD / GM / Admin: is it configured, which calendar
// The reason for the leave is never put on the calendar.
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const env = (k: string) => Deno.env.get(k) || "";
const ID = /^[A-Za-z0-9_-]{1,60}$/;
type Doc = Record<string, unknown>;

// ---- Google auth (service account JWT → access token), cached for the life of the worker
let token = { value: "", exp: 0 };
const b64url = (b: ArrayBuffer | Uint8Array | string) => {
  const u = typeof b === "string" ? new TextEncoder().encode(b) : b instanceof Uint8Array ? b : new Uint8Array(b);
  let s = ""; for (const c of u) s += String.fromCharCode(c); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
async function googleToken(sa: { client_email: string; private_key: string; token_uri?: string }) {
  if (token.value && token.exp > Date.now() + 60000) return token.value;
  const now = Math.floor(Date.now() / 1000), aud = sa.token_uri || "https://oauth2.googleapis.com/token";
  const unsigned = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." + b64url(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly", aud, iat: now, exp: now + 3600 }));
  const der = Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const r = await fetch(aud, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: unsigned + "." + b64url(sig) }) });
  const j = await r.json();
  if (!r.ok || !j.access_token) throw new Error("google_auth_failed: " + (j.error_description || j.error || r.status));
  token = { value: j.access_token, exp: Date.now() + (Number(j.expires_in) || 3600) * 1000 };
  return token.value;
}

const addDay = (iso: string) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };
const hex = (s: string) => [...new TextEncoder().encode(s)].map((b) => b.toString(16).padStart(2, "0")).join("");
const eventId = (reqId: string) => "hrm" + hex(reqId);            // stable id (base32hex alphabet) → one event per request
const COLORS: Record<string, string> = { annual: "10", sick: "11", wfh: "7" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  const caller = createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY") || req.headers.get("apikey") || "", { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } });
  const { data: level } = await caller.rpc("hrm_level");
  if (typeof level !== "number" || level < 1) return json(403, { error: "not_allowed" });
  let body: { action?: string; id?: string };
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }

  let sa: { client_email: string; private_key: string; token_uri?: string } | null = null;
  try { sa = JSON.parse(env("GOOGLE_SERVICE_ACCOUNT") || "null"); } catch { sa = null; }
  const cal = env("GOOGLE_CALENDAR_ID");
  if (!sa?.client_email || !sa?.private_key || !cal) return json(503, { error: "gcal_not_configured" });
  const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal)}`;
  const g = async (method: string, path: string, payload?: unknown) => {
    const r = await fetch(base + path, { method, headers: { Authorization: "Bearer " + await googleToken(sa!), "Content-Type": "application/json" }, body: payload ? JSON.stringify(payload) : undefined });
    const text = await r.text(); let j: Doc = {}; try { j = text ? JSON.parse(text) : {}; } catch { /* empty */ }
    return { status: r.status, ok: r.ok, body: j };
  };

  const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  const get = async (path: string) => ((await admin.from("docs").select("data").eq("path", path).maybeSingle()).data?.data || null) as Doc | null;
  const cfg = (await get("config/main")) || {};
  const withWfh = !!((cfg.gcal as Doc) || {}).wfh;
  const types = (cfg.leaveTypes || {}) as Record<string, { name?: string }>;
  let site = env("HRM_SITE_URL") || "https://sumaantara.github.io/HRM/"; if (!site.endsWith("/")) site += "/";

  async function sync(r: Doc) {
    const id = eventId(String(r.id));
    const want = r.status === "approved" && (r.kind === "leave" || (r.kind === "wfh" && withWfh));
    if (!want) { const d = await g("DELETE", `/events/${id}`); return d.ok || d.status === 404 || d.status === 410 ? "removed" : "error:" + d.status; }
    const e = (await get("employees/" + String(r.empId))) || {};
    const typeName = r.kind === "wfh" ? "WFH" : (types[String(r.type)]?.name || String(r.type || "Leave").replace(/^\w/, (c) => c.toUpperCase()) + (/(leave)$/i.test(String(r.type)) ? "" : " Leave"));
    const steps = (Array.isArray(r.steps) ? r.steps : []) as Doc[];
    const lastBy = steps.filter((s) => s.status === "approved").map((s) => s.approverId).pop();
    const approver = lastBy ? ((await get("employees/" + String(lastBy))) || {}).name : "";
    const backup = r.delegateId ? ((await get("employees/" + String(r.delegateId))) || {}).name : "";
    const ev = {
      id, status: "confirmed", transparency: "transparent", colorId: COLORS[String(r.type)] || (r.kind === "wfh" ? "7" : "5"),
      summary: `${r.kind === "wfh" ? "🏠" : "🌴"} ${e.name || "Employee"} — ${typeName}`,
      description: [`${e.position || ""}${e.division ? " · " + e.division : ""}${e.office ? " · " + e.office : ""}`, `${r.no || ""} · ${r.days || ""} day(s)`,
        backup ? `Backup during leave: ${backup}` : "", approver ? `Approved by ${approver}` : "", "", `Added automatically by ONEderland HRM · ${site}`].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n"),
      start: { date: String(r.start) }, end: { date: addDay(String(r.end)) },
      extendedProperties: { private: { hrmReq: String(r.id), hrmEmp: String(r.empId) } },
      reminders: { useDefault: false, overrides: [] },
    };
    const u = await g("PUT", `/events/${id}`, ev);
    if (u.ok) return "updated";
    if (u.status === 404) { const c = await g("POST", "/events", ev); return c.ok ? "created" : "error:" + c.status + ":" + JSON.stringify(c.body).slice(0, 200); }
    return "error:" + u.status + ":" + JSON.stringify(u.body).slice(0, 200);
  }

  try {
    if (body.action === "status") {
      if (level < 2) return json(403, { error: "not_allowed" });
      const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal)}`, { headers: { Authorization: "Bearer " + await googleToken(sa) } });
      const j = await r.json().catch(() => ({}));
      return json(200, { configured: true, ok: r.ok, calendar: r.ok ? j.summary : "", account: sa.client_email, error: r.ok ? "" : (j.error?.message || String(r.status)), wfh: withWfh });
    }
    if (body.action === "sync") {
      const id = String(body.id || ""); if (!ID.test(id)) return json(400, { error: "bad_request" });
      const r = await get("requests/" + id); if (!r) return json(404, { error: "not_found" });
      const res = await sync(r); return res.startsWith("error") ? json(502, { error: "google_failed", detail: res }) : json(200, { result: res });
    }
    if (body.action === "backfill") {
      if (level < 2) return json(403, { error: "not_allowed" });
      const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
      const { data } = await admin.from("docs").select("data").eq("col", "requests").eq("data->>status", "approved").gte("data->>end", since).limit(300);
      const out: Record<string, number> = {}; let failed = 0;
      for (const row of data || []) { const res = await sync(row.data as Doc); if (res.startsWith("error")) failed++; else out[res] = (out[res] || 0) + 1; }
      return json(200, { synced: out, failed });
    }
    return json(400, { error: "bad_request" });
  } catch (e) {
    console.error("gcal", e);
    return json(502, { error: String((e as Error).message || e).startsWith("google_auth_failed") ? "google_auth_failed" : "google_failed" });
  }
});
