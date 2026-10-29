// ONEderland HRM — payslip generator.
// Called by payroll staff (Payroll flag, HRD, Admin) from the Payroll page.
//   action "preview":  one payslip, not stored, not encrypted, marked PREVIEW — returned as base64
//   action "generate": up to 25 payslips; each PDF is password-protected with the employee's date of birth (DDMMYYYY),
//                      stored privately at payslips/<employee id>/<period>.pdf and recorded in docs payslips/<employee id>_<period>
//   action "check":    which employees lack a birth date / address (field names only)
// Birth dates, addresses and phone numbers are read here with the service role — payroll staff never see them.
import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { buildSlip, type Img, type SlipData } from "./slip.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const env = (k: string) => Deno.env.get(k) || "";
const ID = /^[A-Za-z0-9_-]{1,60}$/, PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/;

function b64(u: Uint8Array) { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); }
function imgInfo(u: Uint8Array): Img {
  if (u[0] === 0x89 && u[1] === 0x50) { const v = new DataView(u.buffer, u.byteOffset); return { data: "data:image/png;base64," + b64(u), w: v.getUint32(16), h: v.getUint32(20), type: "PNG" }; }
  if (u[0] === 0xff && u[1] === 0xd8) {
    for (let i = 2; i < u.length - 9;) { if (u[i] !== 0xff) { i++; continue; } const m = u[i + 1], len = (u[i + 2] << 8) | u[i + 3];
      if (m >= 0xc0 && m <= 0xc3) return { data: "data:image/jpeg;base64," + b64(u), h: (u[i + 5] << 8) | u[i + 6], w: (u[i + 7] << 8) | u[i + 8], type: "JPEG" };
      i += 2 + len; }
  }
  return null;
}
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) && n >= 0 && n < 1e12 ? Math.round(n * 100) / 100 : 0; };
const str = (v: unknown, n: number) => String(v ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, n);
const pairs = (list: unknown) => (Array.isArray(list) ? list : []).slice(0, 20).map((p) => [String((p as unknown[])?.[0] ?? "").slice(0, 40), num((p as unknown[])?.[1])] as [string, number]).filter(([k]) => k);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  const auth = req.headers.get("Authorization") || "";
  const caller = createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY") || req.headers.get("apikey") || "", { global: { headers: { Authorization: auth } } });
  const { data: isPayroll } = await caller.rpc("hrm_is_payroll");
  if (isPayroll !== true) return json(403, { error: "not_allowed" });
  const { data: byEmp } = await caller.rpc("hrm_my_emp");

  let body: { action?: string; items?: unknown[] };
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  const items = Array.isArray(body.items) ? body.items.slice(0, 25) : [];
  if (!items.length || !["preview", "generate", "check"].includes(String(body.action))) return json(400, { error: "bad_request" });

  const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  const get = async (path: string) => (await admin.from("docs").select("data,version").eq("path", path).maybeSingle()).data;
  // "check": which employees are missing what the payslip needs (no values are returned, only field names)
  if (body.action === "check") {
    const missing: Record<string, string[]> = {};
    for (const raw of (body.items as Record<string, unknown>[]).slice(0, 25)) {
      const empId = String(raw?.empId || ""); if (!ID.test(empId)) continue;
      const p = ((await get("private/" + empId))?.data || {}) as Record<string, string>;
      const f = [!/^\d{4}-\d{2}-\d{2}$/.test(String(p.birthDate || "")) && "birthDate", !p.address && "address"].filter(Boolean) as string[];
      if (f.length) missing[empId] = f;
    }
    return json(200, { missing });
  }
  const cfg = ((await get("config/main"))?.data || {}) as Record<string, unknown>;
  const ps = ((await get("payruns/settings"))?.data || {}) as Record<string, string | string[]>;
  const asset = async (p?: unknown) => { if (!p || typeof p !== "string" || !p.startsWith("_assets/")) return null; const { data } = await admin.storage.from("payslips").download(p); return data ? imgInfo(new Uint8Array(await data.arrayBuffer())) : null; };
  const [letterhead, stamp, signature] = await Promise.all([asset(ps.letterhead), asset(ps.stamp), asset(ps.signature)]);
  const divisions = (Array.isArray(ps.divisions) && ps.divisions.length ? ps.divisions : (cfg.divisions as string[]) || []).map(String);

  const results: unknown[] = [];
  for (const raw of items) {
    const it = raw as Record<string, unknown>;
    const empId = String(it.empId || ""), period = String(it.period || "");
    if (!ID.test(empId) || !PERIOD.test(period)) { results.push({ empId, ok: false, error: "bad_item" }); continue; }
    const e = ((await get("employees/" + empId))?.data || null) as Record<string, string> | null;
    if (!e || (e as Record<string, unknown>).system) { results.push({ empId, ok: false, error: "not_found" }); continue; }
    const p = ((await get("private/" + empId))?.data || {}) as Record<string, string>;
    const income = pairs(it.income), deduction = pairs(it.deduction);
    const gross = income.reduce((s, [, v]) => s + v, 0), ded = deduction.reduce((s, [, v]) => s + v, 0);
    const payDate = /^\d{4}-\d{2}-\d{2}$/.test(String(it.payDate || "")) ? String(it.payDate) : `${period}-28`;
    const dob = String(p.birthDate || ""), m = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const data: SlipData = {
      company: String(ps.company || "Company"), no: String(it.no || "").slice(0, 60) || `${period}/${e.empNo}`, payDate, period, place: str(ps.place || "", 40),
      name: String(e.name || ""), empNo: String(e.empNo || ""), position: String(e.position || ""), division: str(it.division || e.division || "", 60), divisions,
      dept: str(e.dept || "", 60), office: str(e.office || "", 60), status: str(it.status || ((p as Record<string, unknown>).contract as Record<string, string> | undefined)?.type || e.status || "", 40),
      address: String(p.address || ""), phone: String(p.phone || ""), joinDate: String(e.joinDate || ""),
      attendance: (Array.isArray(it.attendance) ? it.attendance : []).slice(0, 8).map((x) => [str((x as unknown[])?.[0], 22), str((x as unknown[])?.[1], 12)] as [string, string]).filter(([k]) => k),
      bank: it.bank && typeof it.bank === "object" ? { name: str((it.bank as Record<string, unknown>).name, 40), account: str((it.bank as Record<string, unknown>).account, 40), holder: str((it.bank as Record<string, unknown>).holder, 60) } : undefined,
      income, deduction, signerName: String(ps.signerName || ""), signerTitle: String(ps.signerTitle || "Accounting"), letterhead, stamp, signature,
    };
    if (body.action === "preview") {
      const pdf = buildSlip({ ...data, preview: true });
      return json(200, { preview: b64(pdf), hasBirthDate: !!m });
    }
    if (!m) { results.push({ empId, ok: false, error: "no_birth_date" }); continue; }
    const pdf = buildSlip({ ...data, password: `${m[3]}${m[2]}${m[1]}`, ownerPassword: crypto.randomUUID() + crypto.randomUUID() });
    const file = `${empId}/${period}.pdf`;
    const up = await admin.storage.from("payslips").upload(file, new Blob([pdf as Uint8Array<ArrayBuffer>], { type: "application/pdf" }), { contentType: "application/pdf", upsert: true });
    if (up.error) { results.push({ empId, ok: false, error: "storage_failed" }); continue; }
    const path = `payslips/${empId}_${period}`, prev = await get(path);
    const meta = { id: `${empId}_${period}`, empId, period, no: data.no, payDate, income, deduction, gross, deductions: ded, takeHome: Math.round((gross - ded) * 100) / 100,
      file, bytes: pdf.length, issuedAt: new Date().toISOString(), issuedBy: byEmp || null, version: ((prev?.data as Record<string, number>)?.version || 0) + 1 };
    const { error } = await admin.from("docs").upsert({ path, data: meta }, { onConflict: "path" });
    results.push(error ? { empId, ok: false, error: "record_failed" } : { empId, ok: true, version: meta.version, takeHome: meta.takeHome });
  }
  return json(200, { results });
});
