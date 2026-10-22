// ONEderland HRM — attendance tablets (face recognition with PIN fallback).
// Deployed with verify_jwt = false: tablets have no user session; they authenticate with their own device token.
//
// Signed-in HRM users (Authorization: Bearer <user JWT>):
//   create {name, office, tz}          HRD/GM/Admin → one-time pairing code for a new tablet (15 minutes)
//   revoke {id}                         HRD/GM/Admin
//   consent {on}                        the employee: agree / withdraw (withdrawing deletes their face data)
//   hrconsent {empId, on}               HRD/GM/Admin: written consent on file
//   enroll {empId, descriptors[]}       HRD/GM/Admin: 3–8 face descriptors (128 numbers each) — needs consent
//   forget {empId}                      HRD/GM/Admin: delete face data (and PIN with {pin:true})
//   setpin {pin}                        the employee sets their own 6-digit PIN
//   resetpin {empId}                    HRD/GM/Admin
// Tablets ({token}):
//   pair {code} → {token, kiosk}        hello → kiosk info, server time, settings (+ photo clean-up once a day)
//   identify {descriptor, photo, at?}   face → employee → scan recorded (server time; "at" only for scans queued offline)
//   pin {empNo, pin, photo, at?}        PIN fallback (5 wrong tries → locked 15 minutes)
// Face descriptors never leave the server; tablets only send the descriptor of the face in front of them.
import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { applyPunch, localParts, matchFace, punchLabel, validDesc, weakPin } from "./core.mjs";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const env = (k: string) => Deno.env.get(k) || "";
const ID = /^[A-Za-z0-9_-]{1,60}$/;
type Doc = Record<string, any>;

const enc = new TextEncoder();
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const sha = async (s: string) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
const rand = (n: number) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; };
const b64url = (a: Uint8Array) => btoa(String.fromCharCode(...a)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function pbkdf2(pin: string, salt: string, iter = 120000) {
  const key = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations: iter }, key, 256));
}
const safeEq = (a: string, b: string) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const pairCode = () => [...rand(6)].map((x) => CODE_ALPHABET[x % CODE_ALPHABET.length]).join("");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  let body: Doc;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  const action = String(body.action || "");
  const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  const get = async (path: string) => ((await admin.from("docs").select("data").eq("path", path).maybeSingle()).data?.data || null) as Doc | null;
  const put = async (path: string, data: Doc) => { const { error } = await admin.from("docs").upsert({ path, data }, { onConflict: "path" }); if (error) throw new Error("db: " + error.message); };
  const del = (path: string) => admin.from("docs").delete().eq("path", path);
  const cfg = ((await get("config/main")) || {}) as Doc;
  const kc = Object.assign({ retentionDays: 30, threshold: 0.5 }, cfg.kiosk || {});
  const now = new Date(), nowIso = now.toISOString();

  try {
    // ---------------------------------------------------------------- tablet actions
    if (["pair", "hello", "identify", "pin"].includes(action)) {
      if (action === "pair") {
        const code = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (code.length !== 6) return json(400, { error: "bad_code" });
        const h = await sha("pair:" + code);
        const { data: rows } = await admin.from("docs").select("path,data").eq("col", "kiosks").eq("data->>pairHash", h).limit(1);
        const k = rows?.[0]?.data as Doc | undefined;
        if (!k || k.revoked || !k.pairExp || k.pairExp < nowIso) return json(403, { error: "code_invalid" });
        const token = b64url(rand(32));
        await put("kiosks/" + k.id, Object.assign({}, k, { tokenHash: await sha("tok:" + token), pairHash: null, pairExp: null, pairedAt: nowIso, lastSeen: nowIso }));
        return json(200, { token, kiosk: { id: k.id, name: k.name, office: k.office, tz: k.tz } });
      }
      const token = String(body.token || "");
      if (token.length < 30) return json(401, { error: "no_token" });
      const th = await sha("tok:" + token);
      const { data: rows } = await admin.from("docs").select("data").eq("col", "kiosks").eq("data->>tokenHash", th).limit(1);
      const k = rows?.[0]?.data as Doc | undefined;
      if (!k || k.revoked) return json(401, { error: "kiosk_revoked" });
      const tz = k.tz || "Asia/Makassar";
      const touch = () => put("kiosks/" + k.id, Object.assign({}, k, { lastSeen: nowIso }));

      if (action === "hello") {
        await touch();
        // photo clean-up, at most once a day (folders are named by date)
        const st = (await get("kioskstate/main")) || {};
        if (!st.lastCleanup || Date.parse(st.lastCleanup) < Date.now() - 20 * 3600e3) {
          const cutoff = localParts(new Date(Date.now() - Number(kc.retentionDays) * 864e5), tz).date; let removed = 0;
          const { data: dirs } = await admin.storage.from("kiosk").list("", { limit: 1000 });
          for (const d of dirs || []) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(d.name) || d.name >= cutoff) continue;
            for (;;) { const { data: files } = await admin.storage.from("kiosk").list(d.name, { limit: 1000 }); if (!files?.length) break;
              await admin.storage.from("kiosk").remove(files.map((f) => `${d.name}/${f.name}`)); removed += files.length; if (files.length < 1000) break; }
          }
          await put("kioskstate/main", { lastCleanup: nowIso, removed, cutoff });
        }
        return json(200, { kiosk: { id: k.id, name: k.name, office: k.office, tz }, serverTime: nowIso, threshold: kc.threshold, retentionDays: kc.retentionDays });
      }

      // when: server time, or the tablet's (server-synced) time for scans that were queued while offline (max 24 h old)
      let when = now;
      if (body.at) { const t = Date.parse(String(body.at)); if (isFinite(t) && t <= Date.now() + 60e3 && t >= Date.now() - 24 * 3600e3) when = new Date(t); }
      const { data: emps } = await admin.from("docs").select("data").eq("col", "employees");
      const active = (emps || []).map((r) => r.data as Doc).filter((e) => e && !e.system && e.status !== "Resigned");

      let e: Doc | undefined, how = "", dist: number | null = null;
      if (action === "identify") {
        const desc = body.descriptor;
        if (!validDesc(desc)) return json(400, { error: "bad_descriptor" });
        const { data: frows } = await admin.from("docs").select("data").eq("col", "faces");
        const faces = (frows || []).map((r) => r.data as Doc).filter((f) => f && active.some((x) => x.id === f.empId));
        const here = faces.filter((f) => active.find((x) => x.id === f.empId)?.office === k.office);
        let m = matchFace(desc, here, Number(kc.threshold));
        if (!m.empId && !m.ambiguous) m = matchFace(desc, faces, Number(kc.threshold) - 0.04);   // other offices: a bit stricter
        if (!m.empId) return json(200, { ok: false, reason: m.ambiguous ? "ambiguous" : "unknown" });
        e = active.find((x) => x.id === m.empId); how = "face"; dist = Math.round((m.dist || 0) * 1000) / 1000;
      } else {
        const empNo = String(body.empNo || "").trim().toUpperCase(), pin = String(body.pin || "");
        e = active.find((x) => String(x.empNo || "").toUpperCase() === empNo);
        if (!e || !/^\d{6}$/.test(pin)) return json(200, { ok: false, reason: "wrong_pin" });
        const rec = await get("kioskpin/" + e.id);
        if (!rec) return json(200, { ok: false, reason: "no_pin" });
        if (rec.lockUntil && rec.lockUntil > nowIso) return json(200, { ok: false, reason: "locked", until: rec.lockUntil });
        if (!safeEq(await pbkdf2(pin, rec.salt, rec.iter), rec.hash)) {
          const fails = (rec.fails || 0) + 1;
          await put("kioskpin/" + e.id, Object.assign({}, rec, { fails: fails >= 5 ? 0 : fails, lockUntil: fails >= 5 ? new Date(Date.now() + 15 * 60e3).toISOString() : null }));
          return json(200, { ok: false, reason: fails >= 5 ? "locked" : "wrong_pin" });
        }
        if (rec.fails || rec.lockUntil) await put("kioskpin/" + e.id, Object.assign({}, rec, { fails: 0, lockUntil: null }));
        how = "pin";
      }
      if (!e) return json(200, { ok: false, reason: "unknown" });

      const lp = localParts(when, tz), ym = lp.date.slice(0, 7), apath = `attendance/${e.id}_${ym}`;
      const doc = (await get(apath)) || { id: `${e.id}_${ym}`, empId: e.id, month: ym, days: {} };
      const r = applyPunch(doc.days?.[lp.date] || null, lp.min);
      if (r.dup) return json(200, { ok: true, dup: true, name: e.name, empNo: e.empNo, time: lp.hm, label: punchLabel(r.n) });
      const day = Object.assign(r.day, { kh: (r.day.kh || []).concat([{ t: lp.hm, how, k: k.id }]).slice(-20) });
      doc.days = Object.assign({}, doc.days, { [lp.date]: day }); doc.updatedAt = nowIso;
      await put(apath, doc);
      let photo = "";
      const b64 = String(body.photo || "").replace(/^data:image\/jpeg;base64,/, "");
      if (b64 && b64.length < 340000) {
        try { const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          if (bin[0] === 0xff && bin[1] === 0xd8) { photo = `${lp.date}/${e.id}-${lp.hms}-${how}.jpg`;
            const up = await admin.storage.from("kiosk").upload(photo, new Blob([bin], { type: "image/jpeg" }), { contentType: "image/jpeg", upsert: true }); if (up.error) photo = ""; } } catch { photo = ""; }
      }
      await touch();
      return json(200, { ok: true, name: e.name, empNo: e.empNo, time: lp.hm, date: lp.date, label: punchLabel(r.n), how, dist, photo: !!photo });
    }

    // ---------------------------------------------------------------- signed-in HRM users
    const auth = req.headers.get("Authorization") || "";
    const caller = createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY") || req.headers.get("apikey") || "", { global: { headers: { Authorization: auth } } });
    const [{ data: level }, { data: me }] = await Promise.all([caller.rpc("hrm_level"), caller.rpc("hrm_my_emp")]);
    if (typeof level !== "number" || level < 1) return json(403, { error: "not_allowed" });
    const hr = level >= 2;
    const stat = async (empId: string) => (await get("facestat/" + empId)) || { empId };

    if (action === "create") {
      if (!hr) return json(403, { error: "not_allowed" });
      const name = String(body.name || "Tablet").slice(0, 60), office = String(body.office || "").slice(0, 60), tz = String(body.tz || "Asia/Makassar");
      if (!office || !["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"].includes(tz)) return json(400, { error: "bad_request" });
      const id = "k" + hex(rand(5)), code = pairCode();
      await put("kiosks/" + id, { id, name, office, tz, createdAt: nowIso, createdBy: me || null, pairHash: await sha("pair:" + code), pairExp: new Date(Date.now() + 15 * 60e3).toISOString(), tokenHash: null, revoked: false });
      return json(200, { id, code, exp: new Date(Date.now() + 15 * 60e3).toISOString() });
    }
    if (action === "repair") {
      if (!hr) return json(403, { error: "not_allowed" });
      const k = await get("kiosks/" + String(body.id || "")); if (!k) return json(404, { error: "not_found" });
      const code = pairCode();
      await put("kiosks/" + k.id, Object.assign({}, k, { pairHash: await sha("pair:" + code), pairExp: new Date(Date.now() + 15 * 60e3).toISOString(), tokenHash: null, revoked: false }));
      return json(200, { id: k.id, code });
    }
    if (action === "revoke") {
      if (!hr) return json(403, { error: "not_allowed" });
      const k = await get("kiosks/" + String(body.id || "")); if (!k) return json(404, { error: "not_found" });
      await put("kiosks/" + k.id, Object.assign({}, k, { revoked: true, tokenHash: null, pairHash: null, revokedAt: nowIso }));
      return json(200, { ok: true });
    }
    if (action === "consent" || action === "hrconsent") {
      const empId = action === "consent" ? String(me || "") : String(body.empId || "");
      if (!ID.test(empId) || (action === "hrconsent" && !hr)) return json(403, { error: "not_allowed" });
      const s = await stat(empId), on = !!body.on;
      if (on) Object.assign(s, { consentAt: nowIso, consentBy: action === "consent" ? "self" : "hr:" + me, withdrawnAt: null });
      else { Object.assign(s, { consentAt: null, consentBy: null, withdrawnAt: nowIso, enrolledAt: null, samples: 0 }); await del("faces/" + empId); }
      await put("facestat/" + empId, s);
      return json(200, { ok: true, stat: s });
    }
    if (action === "enroll") {
      if (!hr) return json(403, { error: "not_allowed" });
      const empId = String(body.empId || ""), list = Array.isArray(body.descriptors) ? body.descriptors : [];
      if (!ID.test(empId) || list.length < 3 || list.length > 8 || !list.every(validDesc)) return json(400, { error: "bad_request" });
      const s = await stat(empId); if (!s.consentAt) return json(409, { error: "no_consent" });
      await put("faces/" + empId, { empId, desc: list.map((d: number[]) => d.map((x) => Math.round(x * 1e5) / 1e5)), enrolledAt: nowIso, enrolledBy: me || null });
      Object.assign(s, { enrolledAt: nowIso, samples: list.length, enrolledBy: me || null }); await put("facestat/" + empId, s);
      return json(200, { ok: true, stat: s });
    }
    if (action === "forget") {
      if (!hr) return json(403, { error: "not_allowed" });
      const empId = String(body.empId || ""); if (!ID.test(empId)) return json(400, { error: "bad_request" });
      await del("faces/" + empId); if (body.pin) await del("kioskpin/" + empId);
      if (body.all) await del("facestat/" + empId);
      else { const s = await stat(empId); Object.assign(s, { enrolledAt: null, samples: 0 }, body.pin ? { pinSet: false } : {}); await put("facestat/" + empId, s); }
      return json(200, { ok: true });
    }
    if (action === "setpin") {
      if (!me) return json(403, { error: "not_allowed" });
      const pin = String(body.pin || ""); if (weakPin(pin)) return json(400, { error: "weak_pin" });
      const salt = b64url(rand(16)), iter = 120000;
      await put("kioskpin/" + me, { salt, iter, hash: await pbkdf2(pin, salt, iter), fails: 0, lockUntil: null, at: nowIso });
      const s = await stat(String(me)); Object.assign(s, { pinSet: true, pinAt: nowIso }); await put("facestat/" + me, s);
      return json(200, { ok: true });
    }
    if (action === "resetpin") {
      if (!hr) return json(403, { error: "not_allowed" });
      const empId = String(body.empId || ""); if (!ID.test(empId)) return json(400, { error: "bad_request" });
      await del("kioskpin/" + empId); const s = await stat(empId); Object.assign(s, { pinSet: false, pinAt: null }); await put("facestat/" + empId, s);
      return json(200, { ok: true });
    }
    return json(400, { error: "bad_request" });
  } catch (err) {
    console.error("kiosk", err);
    return json(500, { error: "server_error" });
  }
});
