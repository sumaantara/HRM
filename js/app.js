/* ONEderland HRM — app logic (ported from the Claude artifact). Data access goes through js/backend.js. */
(() => {
"use strict";
/* ================= icons ================= */
const P = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>',
  cal:'<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 3v3M16 3v3"/>',
  star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  bell:'<path d="M6 9a6 6 0 0 1 12 0c0 6.5 2.5 8 2.5 8h-17S6 15.5 6 9"/><path d="M10.3 20.5a2 2 0 0 0 3.4 0"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  cog:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  moon:'<path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a7 7 0 0 0 10 10z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  right:'<path d="m9 6 6 6-6 6"/>', left:'<path d="m15 6-6 6 6 6"/>', down:'<path d="m6 9 6 6 6-6"/>', up:'<path d="m6 15 6-6 6 6"/>',
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
  clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  doc:'<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7M9 8h3"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  download:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  fp:'<path d="M12 11v4a6 6 0 0 1-1 3.4M8.5 7.6A5 5 0 0 1 17 11v2.5M7 11a5 5 0 0 1 .6-2.4M7 14.5V11M15.5 17.5c.3-1.1.5-2.4.5-3.5V11a4 4 0 0 0-8 0"/><path d="M4.5 9A8 8 0 0 1 19.5 9M4 13v-1.5M20 13.5V12"/>',
  pinmap:'<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  mega:'<path d="M3 10.5v3a1 1 0 0 0 1 1h2l5 4V5.5l-5 4H4a1 1 0 0 0-1 1z"/><path d="M15 8.5a4.5 4.5 0 0 1 0 7M18 6a8 8 0 0 1 0 12"/>',
  pin:'<path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z"/><path d="M12 14v7"/>',
  shield:'<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>'
};
const ic = (n, cls="") => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]||""}</svg>`;

/* ================= constants ================= */
const ROLES = {employee:"Employee", supervisor:"Supervisor", hrd:"HRD", gm:"General Manager"};
const APPROVERS = {supervisor:"Direct Supervisor", hrd:"HRD", gm:"General Manager"};
const STAGES = [["applied","Applied"],["screening","Screening"],["interview","Interview"],["offer","Offer"],["hired","Hired"]];
const NOTE_KINDS = ["Training","Note","Achievement","Warning","Session","Contract"];
const REM_TYPES = {contract:"Contract", probation:"Probation", training:"Training session", review:"Performance review", other:"Other"};
const RECS = ["Exceeds expectations","Meets expectations","Needs improvement","Pass probation","Extend probation","Do not continue"];
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOWL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const COLS = ["employees","private","requests","candidates","tasks","reviews","reminders","notifs","announcements","attendance","attImports"];
const DEFAULT_CONFIG = {
  flows:{wfh:["supervisor"], annual:["supervisor","hrd"], bereavement:["supervisor","hrd"], marriage:["supervisor","hrd"], maternity:["supervisor","hrd"], paternity:["supervisor","hrd"], sick:["supervisor","hrd"], unpaid:["supervisor","hrd","gm"]},
  leaveTypes:{
    annual:{name:"Annual Leave", track:true, renewal:12, probation:0, unit:"work", paid:true, doc:false, gender:"all", active:true},
    bereavement:{name:"Bereavement Leave", track:true, renewal:3, probation:3, unit:"work", paid:true, doc:false, gender:"all", active:true},
    marriage:{name:"Marriage Leave", track:true, renewal:3, probation:3, unit:"work", paid:true, doc:true, gender:"all", active:true},
    maternity:{name:"Maternity Leave", track:true, renewal:90, probation:90, unit:"calendar", paid:true, doc:true, gender:"F", active:true},
    paternity:{name:"Paternity Leave", track:true, renewal:2, probation:2, unit:"work", paid:true, doc:false, gender:"M", active:true},
    sick:{name:"Sick Leave", track:true, renewal:14, probation:7, unit:"work", paid:true, doc:true, gender:"all", active:true},
    unpaid:{name:"Unpaid Leave", track:false, renewal:0, probation:0, unit:"work", paid:false, doc:false, gender:"all", active:true}
  },
  wfhMaxPerMonth:8, contractReminderDays:30,
  holidays:[{date:"2026-12-25",name:"Christmas Day"},{date:"2027-01-01",name:"New Year's Day"}],
  email:{onTask:true, onRequest:false},
  criteria:["Quality of work","Productivity","Teamwork","Communication","Initiative & ownership"],
  offices:["Bali","Jakarta","Surabaya","Gili Trawangan","Gili Air"],
  divisions:["ONEderland Consulting","Education ONE","Carbon Energy","PeraONE Xperience","English Cafe","Strategy and Growth"],
  departments:["Management","Human Resources","Strategy & Growth","Operations","Finance"],
  schedule:{start:"08:30", end:"17:30", grace:10, workdays:[1,2,3,4,5]},
  company:{name:"ONEderland", tagline:"HRM · Enterprise", logo:""},
  jobLevels:[{name:"General Manager", access:"gm"},{name:"Operational Manager", access:"manager"},{name:"Supervisor", access:"supervisor"},{name:"Staff", access:"staff"}]
};

/* ================= state ================= */
const S = {
  mode:"loading", db:null, mcp:undefined, D:{employees:[],requests:[],candidates:[],tasks:[],reviews:[],reminders:[],notifs:[],announcements:[],attendance:[],attImports:[],backups:[]},
  R:{employees:[],private:[],requests:[],candidates:[],tasks:[],reviews:[],reminders:[],notifs:[],announcements:[],attendance:[],attImports:[],backups:[],dec:[],links:[],rd:[],ph:[],sub:[],ingest:null,sync:null},
  pv:{}, P:{}, prof:{}, profAsk:new Set(), errors:[], mySubs:[], uid:null, who:null, user:null, canEdit:false, canWrite:null, isOwner:false, realEmpId:null, preview:null, loadedAll:false, offline:false,
  config:clone(DEFAULT_CONFIG), me:null, view:"dashboard", prm:{}, pop:null, modal:null, drafts:{}, ui:{}, loaded:{}, q:""
};
function clone(o){ return JSON.parse(JSON.stringify(o)); }
const LS = (k, v) => { try { if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(e) { return null; } };
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const cfg = () => S.config;

/* ================= dates ================= */
const pad = n => String(n).padStart(2,"0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const today = () => tzToday();
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate()+n); return iso(d); };
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const fmt = s => { if(!s) return "—"; const d = parse(s.slice(0,10)); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
const fmtS = s => { const d = parse(s); return `${pad(d.getDate())} ${MON[d.getMonth()]}`; };
const range = (a, b) => a === b ? fmtS(a) : `${fmtS(a)} – ${fmtS(b)}`;
const rangeL = (a, b) => a === b ? fmt(a) : `${fmtS(a)} – ${fmt(b)}`;
const ago = t => { if(!t) return ""; const m = Math.round((Date.now() - new Date(t)) / 6e4); if(m < 1) return "just now"; if(m < 60) return m + "m ago"; const h = Math.round(m/60); if(h < 24) return h + "h ago"; const d = Math.round(h/24); return d < 30 ? d + "d ago" : fmt(iso(new Date(t))); };
const tenure = s => { if(!s) return "—"; const m = Math.max(0, Math.floor(diffDays(s, today()) / 30.44)); return m < 12 ? `${m} mo` : `${Math.floor(m/12)} yr ${m%12} mo`; };
const months = s => s ? Math.floor(diffDays(s, today()) / 30.44) : 0;
const holMap = office => Object.fromEntries((cfg().holidays||[]).filter(h => !h.offices?.length || !office || h.offices.includes(office)).map(h => [h.date, h.name]));
function countDays(a, b, unit, office){
  const o = {days:0, skipped:[]}; if(!a || !b || b < a) return o;
  const hol = holMap(office); const d = parse(a), e = parse(b); let g = 0;
  while(d <= e && g++ < 400){ const s = iso(d), w = d.getDay();
    if(unit === "calendar") o.days++; else if(w === 0 || w === 6) {} else if(hol[s]) o.skipped.push(`${fmtS(s)} (${hol[s]})`); else o.days++;
    d.setDate(d.getDate()+1); }
  return o;
}
const overlap = (a1,b1,a2,b2) => a1 <= b2 && a2 <= b1;

/* ================= data helpers ================= */
const E = () => S.D.employees.filter(e => !e.system);
const emp = id => S.D.employees.find(e => e.id === id);
const nm = id => emp(id)?.name || "Unknown";
const first = id => nm(id).split(" ")[0];
const me = () => emp(S.me);
const role = () => me()?.role;
const isAdmin = () => !!me()?.admin;
const isHR = () => role() === "hrd" || isAdmin();
const isGM = () => role() === "gm";
const isMgmt = () => isHR() || isGM();
const reports = id => E().filter(e => e.supervisorId === id && e.status !== "Resigned");
const isLead = () => isMgmt() || reports(S.me).length > 0;
const byRole = r => E().find(e => e.role === r && e.status !== "Resigned");
const ini = id => (emp(id)?.name || "?").split(/\s+/).filter(Boolean).slice(0,2).map(w => w[0]).join("").toUpperCase();
const hue = id => { let h = 0; for(const c of String(id)) h = (h*31 + c.charCodeAt(0)) % 997; return "c" + (h % 6 + 1); };
const av = (id, sz="") => { const ph = assetSrc(emp(id)?.photo); return ph ? `<img class="av ${sz}" src="${esc(ph)}" alt="" aria-hidden="true">` : `<span class="av ${sz} ${hue(id)}" aria-hidden="true">${esc(ini(id))}</span>`; };
const who = (id, sub) => `<div class="who">${av(id)}<div><b>${esc(nm(id))}</b><span>${esc(sub ?? emp(id)?.dept ?? "")}</span></div></div>`;
const canSeePrivate = target => { const t = emp(target), m = me(); if(!t || !m) return false; return m.admin || m.id === t.id || t.supervisorId === m.id || ["hrd","gm"].includes(m.role); };
const LT = () => cfg().leaveTypes;
const typeName = r => r.kind === "wfh" ? "Work From Home" : (LT()[r.type]?.name || r.type);
const reqRows = r => [["Request", `${typeName(r)} · ${r.no}`], ["Employee", nm(r.empId)], ["Dates", rangeL(r.start, r.end)], ["Duration", `${r.days} day${r.days === 1 ? "" : "s"}`]]
  .concat(r.location ? [["Location", r.location]] : []).concat(r.steps?.length > 1 ? [["Approval", r.steps.map((x, i) => `${i+1}. ${x.label} (${nm(x.approverId)})`).join("\n")]] : []);
const unitOf = r => r.kind === "wfh" ? "work" : (LT()[r.type]?.unit || "work");
const pendingFor = id => S.D.requests.filter(r => r.status === "pending" && r.steps[r.current]?.approverId === id);
/* Leave quota = ledger of grants/adjustments on the employee profile (HRD only) minus approved & pending leave. */
function balance(eid, type){
  const t = LT()[type] || {}, e = emp(eid); let used = 0, pend = 0;
  for(const r of S.D.requests){ if(r.empId !== eid || r.kind !== "leave" || r.type !== type) continue;
    if(r.status === "approved") used += r.days; else if(r.status === "pending") pend += r.days; }
  const granted = e?.quotaLog ? e.quotaLog.filter(x => x.type === type).reduce((s,x) => s + Number(x.delta||0), 0) : Number(e?.granted?.[type] || 0);
  return {quota:granted, granted, used, pend, avail:granted - used - pend, unlimited:!t.track};
}
const grantDefaults = (e, ctype) => Object.fromEntries(typesFor(e).filter(([k,t]) => t.track).map(([k,t]) => [k, Number(ctype === "Probation" ? t.probation : t.renewal) || 0]));
const grantEntries = (amounts, reason, date) => Object.entries(amounts).filter(([k,v]) => Number(v) > 0).map(([type,v]) => ({id:uid("g"), date:date||today(), type, delta:Number(v), reason, by:S.me}));
const typesFor = e => Object.entries(LT()).filter(([k,t]) => t.active && (t.gender === "all" || !e?.gender || t.gender === e.gender));
/* Job levels (jabatan) are managed by HRD. Each level has an access type that sets what the person can do in the app. */
const ACCESS = {staff:"Staff — own data only", supervisor:"Supervisor — manages direct reports", manager:"Manager — manages direct reports", gm:"General Manager — company-wide view"};
const JOBS = () => cfg().jobLevels || [];
const jobAccess = name => JOBS().find(j => j.name === name)?.access;
const roleFor = (job, hr) => hr ? "hrd" : ({gm:"gm", manager:"supervisor", supervisor:"supervisor", staff:"employee"})[jobAccess(job)] || "employee";
const jobOf = e => e?.jobLevel || ROLES[e?.role] || "";
const apLabel = r => APPROVERS[r] || (r.startsWith("job:") ? r.slice(4) : r);
function resolveApprover(r, e){
  if(r === "supervisor") return emp(e.supervisorId);
  if(r.startsWith("job:")){ const holders = activeE().filter(x => x.jobLevel === r.slice(4) && x.id !== e.id);
    return holders.find(x => x.division === e.division) || holders.find(x => x.office === e.office) || holders[0]; }
  return byRole(r);
}
function buildSteps(e, flowKey){
  const flow = cfg().flows[flowKey] || ["supervisor","hrd"], steps = [], seen = new Set([e.id]);
  for(const r of flow){ const a = resolveApprover(r, e); if(a && !seen.has(a.id)){ seen.add(a.id); steps.push({role:r, label:apLabel(r), approverId:a.id, status:"waiting", note:"", at:null}); } }
  if(!steps.length){ const a = [byRole("hrd"), byRole("gm")].find(x => x && x.id !== e.id); if(a) steps.push({role:a.role, label:APPROVERS[a.role], approverId:a.id, status:"waiting", note:"", at:null}); }
  return steps;
}
function contractState(c){
  if(!c) return {k:"neutral", t:"No contract"};
  if(!c.end) return {k:"active", t:"Permanent"};
  const d = diffDays(today(), c.end);
  if(d < 0) return {k:"expired", t:`Expired ${fmt(c.end)}`, d};
  if(d <= (cfg().contractReminderDays||30)) return {k:"pending", t:`Ends in ${d} day${d===1?"":"s"}`, d};
  return {k:"active", t:`Until ${fmt(c.end)}`, d};
}
function autoReminders(){
  const out = [], lim = Math.max(cfg().contractReminderDays || 30, 30);
  for(const e of E()){ if(e.status === "Resigned" || !e.contract?.end) continue;
    const d = diffDays(today(), e.contract.end);
    if(d <= lim && d >= -14) out.push({id:"auto-"+e.id, auto:true, date:e.contract.end, empId:e.id,
      type:e.contract.type === "Probation" ? "probation" : "contract",
      title:e.contract.type === "Probation" ? `Probation ends — ${e.name}` : `${e.contract.type} contract ends — ${e.name}`, audience:["hrd","supervisor"]}); }
  return out;
}
function remindersFor(m){
  if(!m) return [];
  const all = S.D.reminders.filter(r => !r.done).concat(autoReminders());
  return all.filter(r => m.role === "hrd" || m.role === "gm" ||
    (r.audience||[]).includes("all") ||
    (r.empId === m.id && (r.audience||[]).includes("employee")) ||
    (r.empId && emp(r.empId)?.supervisorId === m.id && (r.audience||[]).includes("supervisor")))
    .sort((a,b) => a.date.localeCompare(b.date));
}

/* ================= persistence ================= */
const store = {
  async put(col, obj){
    previewGuard();
    if(col === "employees") return putEmployee(obj);
    if(S.mode === "db") await withRetry(() => S.db.collection(col).doc(obj.id).set(obj));
    localPut(col, obj);
  },
  async del(col, id){
    previewGuard();
    if(S.mode === "db"){ await withRetry(() => S.db.collection(col).doc(id).delete()); if(col === "employees") await withRetry(() => S.db.collection("private").doc(id).delete()); }
    if(S.R[col]) S.R[col] = S.R[col].filter(x => x.id !== id); if(col === "employees") S.R.private = S.R.private.filter(x => x.id !== id); rebuild();
  },
  async config(c){ previewGuard(); if(S.mode === "db") await withRetry(() => S.db.collection("config").doc("main").set(c)); else S.config = c; }
};
async function run(fn, ok){
  try { await fn(); if(ok) toast(ok); if(S.mode !== "db") render(); return true; }
  catch(err){ console.error(err); const c = err && err.code;
    toast(c === "preview" ? "Preview is read-only for people who have their own account. Exit preview to make changes." :
          c === "invalid_argument" ? (dbOn() && !S.canEdit ? "This change needs HRD or Admin access." : "The database refused this change (permission or invalid data).") :
          c === "quota_exceeded" ? "Storage is full. Ask Admin to archive old records in System → Maintenance." :
          c === "resource_exhausted" ? "Too many changes at once. Wait a moment and try again." : "Couldn't save. Check your connection and try again.");
    render(); return false; }
}
/* Notification catalogue: every event the HRM tells people about.
   [label, who receives it, icon, tile colour, email on by default, group] — HRD switches emails per event in Settings → Notifications. */
const NOTIFY = {
  request_new:       ["Request waiting for approval", "First approver", "check", 1, true, "Leave & WFH"],
  request_next:      ["Request moved to the next approver", "Next approver", "check", 1, true, "Leave & WFH"],
  request_step:      ["An approval step was completed", "Employee who applied", "history", 1, false, "Leave & WFH"],
  request_approved:  ["Request fully approved", "Employee who applied", "check", 5, true, "Leave & WFH"],
  request_rejected:  ["Request rejected", "Employee who applied", "x", 6, true, "Leave & WFH"],
  request_cancelled: ["Request cancelled by the employee", "Approver waiting on it", "x", 3, true, "Leave & WFH"],
  review_task:       ["Performance review assigned", "Supervisor", "star", 4, true, "Performance"],
  review_submitted:  ["Review submitted by a supervisor", "HRD who assigned it", "star", 4, false, "Performance"],
  review_ready:      ["Review result available", "Employee reviewed", "star", 4, true, "Performance"],
  announcement:      ["New or updated announcement", "All staff (when “notify” is ticked)", "mega", 2, true, "Company"],
  reminder:          ["Reminder created", "People in the reminder's audience", "clock", 2, true, "Company"],
  team_member:       ["New team member", "Their supervisor", "users", 5, true, "People"],
  contract:          ["New contract or renewal", "Employee", "doc", 3, true, "People"],
  quota:             ["Leave quota changed", "Employee", "cal", 1, true, "People"],
  note:              ["New note on profile", "Employee", "file", 3, false, "People"],
  account:           ["Account connected", "Employee", "shield", 5, false, "People"],
};
const LEGACY_NOTIF = {review_task:"onTask"};
const emailOn = kind => { const n = cfg().notify || {}; if(kind in n) return !!n[kind]; const l = LEGACY_NOTIF[kind]; if(l && cfg().email && l in cfg().email) return !!cfg().email[l]; return !!(NOTIFY[kind] && NOTIFY[kind][4]); };
const notifKind = n => n.kind && NOTIFY[n.kind] ? n.kind
  : n.view === "approvals" ? "request_new" : n.view === "myrequests" ? (/rejected/i.test(n.title) ? "request_rejected" : /approved/i.test(n.title) ? "request_approved" : "request_step")
  : n.view === "reviews" ? "review_task" : n.view === "announcements" ? "announcement" : /review/i.test(n.title || "") ? "review_ready"
  : /quota/i.test(n.title || "") ? "quota" : /contract/i.test(n.title || "") ? "contract" : /team member/i.test(n.title || "") ? "team_member" : /reminder/i.test(n.title || "") ? "reminder" : "note";
/* notify(to, title, body, view, ref, kind, mail)
   mail = {subject, heading, intro, rows:[[label, value]], quote, tone, cta} — sent when the event's email is on and the person has an email */
async function notify(to, title, body, view, ref, kind, mail){
  if(!to || !emp(to)) return;
  await store.put("notifs", {id:uid("n"), to, title, body, view, ref:ref||null, kind:kind||null, at:new Date().toISOString(), read:false});
  if(mail && kind && emailOn(kind) && S.mode === "db") queueMail(to, Object.assign({subject:title, heading:title, intro:body, cta:{label:"Open in HRM", go:view, ref:ref||""}}, mail));
}
const mailQ = []; let mailBusy = false;
function queueMail(to, m){ const e = emp(to); if(!e?.email || /@example\.com$/i.test(e.email) || e.status === "Resigned") return; mailQ.push([e, m]); if(!mailBusy) drainMail(); }
async function drainMail(){
  mailBusy = true; let fails = 0, reason = "";
  while(mailQ.length){ const [e, m] = mailQ.shift(); const r = await sendRich(e, m); if(!r.ok){ fails++; reason = r.reason; } }
  mailBusy = false; if(fails) toast(`${fails} email(s) couldn't be sent: ${reason}`);
}
async function sendRich(e, m){
  if(!e?.email) return {ok:false, reason:"No email address on file."};
  const mcp = await getMcp(); if(!mcp) return {ok:false, reason:"Email isn't available right now."};
  try { await mcp.callTool("Gmail", "send_message", Object.assign({}, m, {to:[e.email], name:first(e.id), subject:"[HRM] " + String(m.subject || "").replace(/^\[HRM\]\s*/, "")})); return {ok:true}; }
  catch(err){ const c = err && err.code;
    return {ok:false, reason: c === "server_not_connected" ? "email isn't set up yet (SMTP in Supabase)" : c === "not_in_manifest" ? "not allowed for this recipient" : "the mail server didn't accept it"}; }
}
async function getMcp(){ if(S.mcp !== undefined) return S.mcp; try { S.mcp = window.claude?.use ? await window.claude.use("mcp") : null; } catch(e){ S.mcp = null; } return S.mcp; }
async function sendEmail(to, subject, body){
  if(!to) return {ok:false, reason:"No email address on file."};
  const mcp = await getMcp(); if(!mcp) return {ok:false, reason:"Email isn't available right now."};
  try { await mcp.callTool("Gmail", "send_message", {to:[to], subject, body}); return {ok:true}; }
  catch(err){ const c = err && err.code;
    return {ok:false, reason: c === "server_not_connected" ? "Email isn't set up yet (Admin: add the SMTP settings in Supabase — see README)." :
      c === "not_in_manifest" ? "Your account isn't allowed to send this email." : "The email couldn't be sent."}; }
}
let tt; function toast(m){ const t = document.getElementById("toast"); t.textContent = m; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 3600); }
const dv = (k, n, d) => (S.drafts[k] && n in S.drafts[k]) ? S.drafts[k][n] : d;

/* ================= infrastructure: data layer, identity, integrity ================= */
/* Storage model (schema 2)
   employees/<id>   public profile (everyone signed in reads; only Editors write)
   private/<id>     confidential HR data: phone, gender, birth date, contracts, notes, quota ledger (Editors only)
   pv/<uid>/d/self  + team   per-person mirror of the confidential data that person may see (written by Editors' clients)
   sub/<uid>        submissions from non-Editors that touch confidential data (reviews, notes), ingested by an Editor's client
   dec/<uid>        each approver's own signed decisions (only that person can write) — used to verify approvals
   links/<uid>      account-link request of a signed-in person (claim → verified by email or approved by HRD/Admin)
   rd/<uid>, ph/<uid>   per-person read receipts and self-uploaded profile photo
   audit/<uid>/m/<yyyy-mm>  each person's own monthly audit trail
   requests, notifs, counters   shared working data (Contributors write) */
const APP_VERSION = "3.2.0", SCHEMA = 2;
const PRIVATE_FIELDS = ["phone","gender","birthDate","exitReason","contract","contracts","notes","quotaLog"];
const SUB_COLS = ["employees","private","requests","candidates","tasks","reviews","reminders","notifs","announcements","attendance","attImports","backups","dec","links","rd","ph","sub"];
const CORE_COLS = ["employees","requests","tasks","notifs","announcements","attendance"];
const BACKUP_COLS = ["employees","private","requests","candidates","tasks","reviews","reminders","notifs","announcements","attendance","attImports","backups","dec","links","rd","ph","counters"];
const DB_RULES = [
  {path:"", read:"interact", write:"admin"},
  {path:"requests", read:"interact", write:"interact"},
  {path:"notifs", read:"interact", write:"interact"},
  {path:"counters", read:"interact", write:"interact"},
  {path:"private", read:"admin", write:"admin"},
  {path:"reviews", read:"admin", write:"admin"},
  {path:"candidates", read:"admin", write:"admin"},
  {path:"reminders", read:"admin", write:"admin"},
  {path:"attImports", read:"admin", write:"admin"},
  {path:"backups", read:"admin", write:"admin"},
  {path:"sync", read:"admin", write:"admin"},
  {path:"dec", read:"interact", write:"owner"}, {path:"dec/{self}", read:"interact", write:"interact"},
  {path:"ph", read:"interact", write:"owner"}, {path:"ph/{self}", read:"interact", write:"interact"},
  {path:"links", read:"admin", write:"admin"}, {path:"links/{self}", read:"interact", write:"interact"},
  {path:"rd", read:"admin", write:"admin"}, {path:"rd/{self}", read:"interact", write:"interact"},
  {path:"sub", read:"admin", write:"admin"}, {path:"sub/{self}", read:"interact", write:"interact"},
  {path:"pv", read:"admin", write:"admin"}, {path:"pv/{self}", read:"interact", write:"admin"},
  {path:"audit", read:"admin", write:"owner"}, {path:"audit/{self}", read:"interact", write:"interact"}
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const hash = s => { let h = 2166136261; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + s.length.toString(36); };
async function sha256(text){ try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,"0")).join(""); } catch(e){ return "fnv-" + hash(text); } }
async function withRetry(fn){
  try { return await fn(); }
  catch(e){ if(e && (e.code === "unavailable" || e.code === "resource_exhausted")){ await sleep(500 + Math.random()*900); return fn(); } throw e; }
}
const dbOn = () => S.mode === "db" && !!S.db;
const realMe = () => emp(S.realEmpId);
const realAdmin = () => S.mode !== "db" ? isAdmin() : !!realMe()?.admin;
const pick = (o, keys) => Object.fromEntries(keys.filter(k => o[k] !== undefined).map(k => [k, o[k]]));
const grantedOf = log => (log||[]).reduce((m,x) => (m[x.type] = Math.round(((m[x.type]||0) + Number(x.delta||0))*100)/100, m), {});
const assetSrc = ref => !ref ? "" : /^[0-9a-f]{32}$/i.test(ref) ? ((window.HRM && window.HRM.assetUrl(ref)) || "") : ref;

/* ---- rebuild merged views from raw snapshots ---- */
function rebuild(){
  const R = S.R, priv = {};
  if(S.mode !== "db" || S.canEdit){ for(const p of R.private) priv[p.id] = p; }
  else {
    const self = S.pv.self, team = S.pv.team;
    if(team?.p) for(const [id, p] of Object.entries(team.p)) priv[id] = p;
    if(self?.empId && self.p) priv[self.empId] = self.p;
  }
  S.P = priv;
  const phById = Object.fromEntries(R.ph.map(x => [x.id, x]));
  S.D.employees = R.employees.map(p => {
    const e = priv[p.id] ? Object.assign({}, p, priv[p.id], {id:p.id}) : Object.assign({}, p);
    const ph = e.userId && phById[e.userId];
    if(ph && (ph.at || "") > (e.photoAt || "")) e.photo = ph.asset || "";
    return e;
  });
  const mine = (R.sub.find(d => d.id === S.uid)?.items) || {};
  S.mySubs = Object.entries(mine).map(([k, v]) => Object.assign({key:k, state:(R.ingest?.done||{})[S.uid + ":" + k] || "pending"}, v));
  if(S.mode !== "db" || S.canEdit){ S.D.reviews = R.reviews; S.D.reminders = R.reminders; }
  else {
    const seen = new Set(), rv = [];
    for(const r of [...(S.pv.self?.reviews||[]), ...(S.pv.team?.reviews||[])]) if(!seen.has(r.id)){ seen.add(r.id); rv.push(r); }
    S.D.reviews = rv;
    const rs = new Map(); for(const r of [...(S.pv.self?.reminders||[]), ...(S.pv.team?.reminders||[])]) rs.set(r.id, r);
    S.D.reminders = [...rs.values()];
  }
  for(const c of ["requests","candidates","tasks","notifs","announcements","attendance","attImports","backups"]) S.D[c] = R[c];
}
const pendingReview = (taskId, empId) => (S.mySubs||[]).some(s => s.kind === "review" && s.taskId === taskId && s.empId === empId && !String(s.state).startsWith("rejected"));

/* ---- writes ---- */
async function putEmployee(e){
  const now = new Date().toISOString(), cur = S.R.employees.find(x => x.id === e.id);
  const full = Object.assign({}, e);
  full.rev = (Number(cur?.rev)||0) + 1; full.updatedAt = now; full.updatedBy = S.realEmpId || S.me || null;
  full.granted = grantedOf(full.quotaLog);
  full.bday = full.birthDate ? full.birthDate.slice(5) : (full.bday || "");
  if(S.mode !== "db"){ localPut("employees", full); return; }
  const pub = Object.assign({}, full); for(const k of PRIVATE_FIELDS) delete pub[k];
  const priv = Object.assign({id:full.id, rev:full.rev, updatedAt:now}, pick(full, PRIVATE_FIELDS));
  await withRetry(() => S.db.collection("private").doc(full.id).set(priv));
  await withRetry(() => S.db.collection("employees").doc(full.id).set(pub));
  localPut("private", priv); localPut("employees", pub);
}
/* optimistic local copy so follow-up steps see the write before the live snapshot arrives */
function localPut(col, obj){ const a = S.R[col]; if(!Array.isArray(a)) return; const i = a.findIndex(x => x.id === obj.id); const c = JSON.parse(JSON.stringify(obj)); if(i < 0) a.push(c); else a[i] = c; rebuild(); }
function previewGuard(){ if(S.preview && !S.preview.writable) throw {code:"preview"}; }

/* ---- audit trail: each person appends to their own monthly document ---- */
const AUD = {q:[], busy:false, doc:null, path:null};
function audit(action, target, info){
  if(!dbOn() || !S.uid) return;
  AUD.q.push({t:new Date().toISOString(), a:action, x:String(target||"").slice(0,120), i:String(info||"").slice(0,300), by:S.realEmpId || null, as:S.preview ? S.me : undefined});
  flushAudit();
}
async function flushAudit(){
  if(AUD.busy || !AUD.q.length || !dbOn()) return; AUD.busy = true;
  try {
    const path = `audit/${S.uid}/m/${today().slice(0,7)}`;
    if(AUD.path !== path){ const s = await S.db.doc(path).get(); AUD.doc = s.exists ? s.data() : {ev:[]}; AUD.path = path; }
    AUD.doc.ev = (AUD.doc.ev || []).concat(AUD.q.splice(0)).slice(-1000);
    await withRetry(() => S.db.doc(path).set({ev:AUD.doc.ev, uid:S.uid, at:new Date().toISOString()}));
  } catch(e){ console.warn("audit", e); }
  finally { AUD.busy = false; if(AUD.q.length) setTimeout(flushAudit, 800); }
}

/* ---- signed approval decisions ---- */
async function signDecision(reqId, step, verdict){
  if(!dbOn() || !S.uid) return;
  const cur = S.R.dec.find(d => d.id === S.uid), d = Object.assign({}, cur?.d || {});
  d[`${reqId}:${step}`] = verdict + "@" + new Date().toISOString() + (S.preview ? "#" + S.me : "");
  const keys = Object.keys(d);
  if(keys.length > 1500){ const live = new Set(S.R.requests.map(r => r.id)); for(const k of keys) if(!live.has(k.split(":")[0])) delete d[k]; }
  await withRetry(() => S.db.doc("dec/" + S.uid).set({d, at:new Date().toISOString()}));
}
function verifyStep(r, i){
  const s = r.steps[i]; if(!s || !["approved","rejected"].includes(s.status) || !dbOn()) return null;
  const a = S.R.employees.find(e => e.id === s.approverId);
  if(!a?.userId) return "unlinked";
  const v = S.R.dec.find(d => d.id === a.userId)?.d?.[`${r.id}:${i}`];
  if(!v) return (s.at || "") < (cfg().signingSince || "9999") ? "legacy" : "missing";
  return v[0] === (s.status === "approved" ? "a" : "r") ? "ok" : "mismatch";
}

/* ---- sequential request numbers with a short lease ---- */
async function nextNumber(prefix, year){
  const base = Math.max(0, ...S.D.requests.filter(r => (r.no||"").startsWith(prefix + "/" + year)).map(r => parseInt((r.no||"").split("/").pop(), 10) || 0));
  if(!dbOn()) return base + 1;
  const ref = S.db.doc(`counters/${prefix}-${year}`);
  for(let i = 0; i < 4; i++){
    try {
      const l = await ref.acquire({holder:S.uid || "anon", ttlMs:6000});
      if(l.acquired){ const s = await ref.get(); const n = Math.max(s.exists ? Number(s.data().n)||0 : 0, base) + 1; await ref.set({n, at:new Date().toISOString()}); return n; }
    } catch(e){}
    await sleep(300 + Math.random()*700);
  }
  return null;
}

/* ---- submissions from non-Editors (ingested by an Editor's client) ---- */
async function submitItem(kind, payload){
  previewGuard();
  const key = uid("s"), cur = S.R.sub.find(d => d.id === S.uid);
  const items = Object.assign({}, cur?.items || {}, {[key]: Object.assign({kind, at:new Date().toISOString()}, payload)});
  await withRetry(() => S.db.doc("sub/" + S.uid).set({items, at:new Date().toISOString()}));
  audit("submit_" + kind, payload.empId ? nm(payload.empId) : "", payload.taskId || "");
}
let pruneT;
function pruneOwnSubs(){
  if(!dbOn() || !S.uid || S.canEdit) return;
  const cur = S.R.sub.find(d => d.id === S.uid); if(!cur?.items) return;
  const done = S.R.ingest?.done || {}, keep = {}; let drop = 0;
  for(const [k, v] of Object.entries(cur.items)){ const st = done[S.uid + ":" + k]; if(st && (st === "ok" || Date.now() - new Date(v.at) > 7*864e5)) drop++; else keep[k] = v; }
  if(!drop) return;
  clearTimeout(pruneT); pruneT = setTimeout(() => S.db.doc("sub/" + S.uid).set({items:keep, at:new Date().toISOString()}).catch(() => {}), 1500);
}

/* ---- Editor-side background work: verify account links, ingest submissions, refresh private mirrors ---- */
let syncT, syncing = false;
function scheduleSync(force){ if(!dbOn() || !S.canEdit || !S.loadedAll) return; clearTimeout(syncT); syncT = setTimeout(() => runSync(force), force ? 50 : 3000); }
async function runSync(force){
  if(syncing) return; syncing = true;
  try {
    const lock = await S.db.doc("sync/lock").acquire({holder:S.uid || "editor", ttlMs:25000});
    if(!lock.acquired) return;
    await autoLink(); await ingest(); await mirror(force);
    S.ui.lastSync = new Date().toISOString();
  } catch(e){ console.warn("sync", e); S.ui.syncErr = e?.message || String(e?.code || e); }
  finally { syncing = false; }
}
function privOf(id){ const e = emp(id); return e ? pick(e, PRIVATE_FIELDS) : {}; }
function remindersOf(e, kind, teamIds){
  return S.R.reminders.filter(r => !r.done && (kind === "self"
    ? ((r.audience||[]).includes("all") || (r.empId === e.id && (r.audience||[]).includes("employee")))
    : (r.empId && teamIds.has(r.empId) && (r.audience||[]).includes("supervisor"))));
}
async function mirror(force){
  const h = force ? {} : Object.assign({}, S.R.sync?.h || {}), want = {};
  for(const e of E()){
    if(!e.userId || e.status === "Resigned") continue;
    want[e.userId + "/self"] = {empId:e.id, p:privOf(e.id), reviews:S.R.reviews.filter(r => r.empId === e.id), reminders:remindersOf(e, "self")};
    const team = reports(e.id);
    if(team.length){ const ids = new Set(team.map(m => m.id));
      want[e.userId + "/team"] = {p:Object.fromEntries(team.map(m => [m.id, privOf(m.id)])), reviews:S.R.reviews.filter(r => ids.has(r.empId) || r.reviewerId === e.id), reminders:remindersOf(e, "team", ids)}; }
  }
  let n = 0;
  for(const [k, v] of Object.entries(want)){
    const hv = hash(JSON.stringify(v)); if(h[k] === hv) continue;
    const [u, d] = k.split("/"); await withRetry(() => S.db.doc(`pv/${u}/d/${d}`).set(Object.assign({}, v, {at:new Date().toISOString()}))); h[k] = hv; n++;
  }
  for(const k of Object.keys(h)) if(!want[k]){ const [u, d] = k.split("/"); try { await S.db.doc(`pv/${u}/d/${d}`).delete(); } catch(e){} delete h[k]; n++; }
  if(n || force) await S.db.doc("sync/state").set({h, at:new Date().toISOString()});
}
async function autoLink(){
  for(const L of S.R.links){
    if(L.status && L.status !== "pending") continue;
    const e = S.R.employees.find(x => x.id === L.empId);
    if(!e || e.userId || S.R.employees.some(x => x.userId === L.id)) continue;
    let email = null; try { const ps = await S.user?.profiles([L.id]); email = ps?.[L.id]?.email || null; } catch(_){}
    if(email && e.email && email.trim().toLowerCase() === e.email.trim().toLowerCase()) await approveLink(L, "verified email match");
  }
}
async function approveLink(L, how){
  const e = emp(L.empId); if(!e) return;
  await putEmployee(Object.assign(clone(e), {userId:L.id}));
  await S.db.doc("links/" + L.id).set(Object.assign({}, L, {status:"approved", how, decidedBy:S.realEmpId || null, decidedAt:new Date().toISOString()}));
  audit("account_linked", e.empNo + " " + e.name, how);
  await notify(e.id, "Your account is connected", `You can now use the HRM as ${e.name}.`, "dashboard", null, "account",
    {intro:`Your sign-in is now connected to your employee profile. From now on you can submit leave and WFH requests, see your leave balance and follow your approvals in the HRM.`, tone:"ok"});
}
async function ingest(){
  const done = Object.assign({}, S.R.ingest?.done || {}); let changed = false;
  for(const sd of S.R.sub){
    const who = S.R.employees.find(e => e.userId === sd.id);
    for(const [key, it] of Object.entries(sd.items || {})){
      const dk = sd.id + ":" + key; if(done[dk]) continue;
      let res = [false, "unknown item"];
      try {
        if(!who) res = [false, "account not linked"];
        else if(it.kind === "review") res = await ingestReview(emp(who.id), it, key);
        else if(it.kind === "note") res = await ingestNote(emp(who.id), it, key);
      } catch(e){ res = [false, "could not save"]; }
      done[dk] = res[0] ? "ok" : "rejected: " + res[1]; changed = true;
      audit(res[0] ? "ingested_" + it.kind : "rejected_" + it.kind, who ? who.name : sd.id, res[1] || "");
    }
  }
  const live = new Set(S.R.sub.flatMap(sd => Object.keys(sd.items || {}).map(k => sd.id + ":" + k)));
  for(const k of Object.keys(done)) if(!live.has(k)){ delete done[k]; changed = true; }
  if(changed) await S.db.doc("ingest/state").set({done, at:new Date().toISOString()});
}
async function ingestReview(who, it, key){
  const t0 = S.R.tasks.find(t => t.id === it.taskId);
  if(!t0) return [false, "review task not found"];
  if(t0.supervisorId !== who.id) return [false, "not the assigned reviewer"];
  if(!t0.memberIds.includes(it.empId)) return [false, "employee is not part of this task"];
  if(!S.R.reviews.some(r => r.taskId === t0.id && r.empId === it.empId)){
    const rv = {id:"v" + key, taskId:t0.id, empId:it.empId, reviewerId:who.id, period:t0.period, scores:it.scores || {}, overall:Number(it.overall)||0, recommendation:it.recommendation || "",
      strengths:it.strengths || "", improvements:it.improvements || "", goals:it.goals || "", submittedAt:it.at};
    await withRetry(() => S.db.collection("reviews").doc(rv.id).set(rv)); localPut("reviews", rv);
  }
  const t = clone(t0); if(!t.done.includes(it.empId)) t.done.push(it.empId); if(t.done.length >= t.memberIds.length) t.status = "done";
  await withRetry(() => S.db.collection("tasks").doc(t.id).set(t)); localPut("tasks", t);
  await notify(t.createdBy, `Review submitted: ${nm(it.empId)}`, `${t.period} · by ${who.name}`, "reviews", t.id, "review_submitted",
    {intro:`${who.name} submitted the ${t.period} performance review for ${nm(it.empId)}.`, rows:[["Task", t.title], ["Progress", `${t.done.length} of ${t.memberIds.length} reviewed`]]});
  await notify(it.empId, `Your ${t.period} performance review is available`, `Reviewed by ${who.name}`, "profile", it.empId, "review_ready",
    {intro:`Your ${t.period} performance review by ${who.name} is ready. You can read the scores and feedback on your profile under Performance.`, rows:[["Period", t.period], ["Reviewer", who.name]], cta:{label:"Read my review", go:"profile", ref:it.empId}});
  return [true, ""];
}
async function ingestNote(who, it, key){
  const target = emp(it.empId);
  if(!target) return [false, "employee not found"];
  if(target.supervisorId !== who.id) return [false, "only the direct supervisor can add notes"];
  if((target.notes || []).some(n => n.id === "n" + key)) return [true, ""];
  const e = clone(target); e.notes = (e.notes || []).concat([{id:"n" + key, date:it.date || today(), kind:it.noteKind || "Note", by:who.id, text:String(it.text || "").slice(0, 4000)}]);
  await putEmployee(e);
  await notify(e.id, `New ${(it.noteKind || "note").toLowerCase()} note on your profile`, `Added by ${who.name}`, "profile", e.id, "note",
    {intro:`${who.name} added a ${(it.noteKind || "note").toLowerCase()} entry to your history.`, quote:it.text || "", cta:{label:"View my history", go:"profile", ref:e.id}});
  return [true, ""];
}

/* ---- photos & logo via the asset store (falls back to a small inline image) ---- */
let assetsNS;
async function getAssets(){ if(assetsNS !== undefined) return assetsNS; try { assetsNS = window.claude?.use ? await window.claude.use("assets") : null; } catch(e){ assetsNS = null; } return assetsNS; }
function imageToBlob(file, size){
  return new Promise((res, rej) => {
    if(!/^image\//.test(file.type)) return rej(new Error("type"));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { try {
      const m = Math.min(img.naturalWidth, img.naturalHeight), w = Math.min(size, m), c = document.createElement("canvas"); c.width = c.height = w;
      c.getContext("2d").drawImage(img, (img.naturalWidth - m)/2, (img.naturalHeight - m)/2, m, m, 0, 0, w, w);
      c.toBlob(b => { URL.revokeObjectURL(url); b ? res(b) : rej(new Error("read")); }, "image/jpeg", .86);
    } catch(e){ URL.revokeObjectURL(url); rej(e); } };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("read")); };
    img.src = url;
  });
}
async function uploadImage(file, opts){
  const a = dbOn() ? await getAssets() : null;
  if(a){ try { const blob = opts.logo ? await (await fetch(await imageToDataURL(file, {maxW:480, maxH:160, type:"image/png"}))).blob() : await imageToBlob(file, 320);
    const up = await a.upload(blob, {type:opts.logo ? "image/png" : "image/jpeg"}); return up.id; } catch(e){ if(e?.message === "type") throw e; console.warn("asset upload", e); } }
  return opts.logo ? imageToDataURL(file, {maxW:360, maxH:120, type:"image/png"}) : imageToDataURL(file, {square:true, size:160});
}

/* ---- timezone-aware "today" ---- */
const TZ = () => cfg().timezone || "Asia/Makassar";
function tzToday(){ try { return new Intl.DateTimeFormat("en-CA", {timeZone:TZ(), year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date()); } catch(e){ return iso(new Date()); } }

/* ================= sample data ================= */
function sample(){
  const C = (type, no, start, end) => ({type, no, start, end:end||null});
  const em = (id, empNo, name, gender, position, dept, role, supervisorId, joinDate, status, contract, extra={}) =>
    Object.assign({id, empNo, name, gender, position, dept, role, supervisorId, joinDate, status, email:name.toLowerCase().split(" ")[0]+"@example.com",
      phone:"", contract, contracts:[contract], notes:[], example:true}, extra);
  const employees = [
    em("e01","ONE-0001","Ratna Wijaya","F","General Manager","Management","gm",null,"2015-03-02","Active",C("PKWTT","PKWTT/ONE/2015/001","2015-03-02")),
    em("e02","ONE-0004","Budi Santoso","M","HR Manager","Human Resources","hrd","e01","2018-07-16","Active",C("PKWTT","PKWTT/ONE/2019/004","2019-07-16")),
    em("e03","ONE-0021","Dewi Lestari","F","HR Officer","Human Resources","employee","e02","2024-11-18","Active",C("PKWT","PKWT/ONE/2025/021","2025-11-18","2026-11-17"),
      {contracts:[C("Probation","PRB/ONE/2024/021","2024-11-18","2025-02-17"),C("PKWT","PKWT/ONE/2025/007","2025-02-18","2025-11-17"),C("PKWT","PKWT/ONE/2025/021","2025-11-18","2026-11-17")]}),
    em("e04","ONE-0009","Gede Saputra","M","Strategy Lead","Strategy & Growth","supervisor","e01","2019-05-06","Active",C("PKWTT","PKWTT/ONE/2020/009","2020-05-06")),
    em("e05","ONE-0017","Nadia Kurnia","F","Growth Analyst","Strategy & Growth","employee","e04","2023-01-09","Active",C("PKWT","PKWT/ONE/2025/012","2025-07-01","2027-06-30")),
    em("e06","ONE-0031","Komang Wira","M","Marketing Associate","Strategy & Growth","employee","e04","2026-08-17","Probation",C("Probation","PRB/ONE/2026/031","2026-08-17","2026-11-16"),
      {notes:[
        {id:"n1",date:"2026-08-21",kind:"Training",by:"e02",text:"Completed onboarding week: company policies, HRM tools and brand guidelines."},
        {id:"n2",date:"2026-09-04",kind:"Training",by:"e04",text:"Product knowledge training. Quiz score 85/100. Strong on positioning, still learning pricing tiers."},
        {id:"n3",date:"2026-09-26",kind:"Note",by:"e04",text:"Needs coaching on weekly campaign reporting: numbers often submitted late. Agreed on a Friday 3 pm deadline."},
        {id:"n4",date:"2026-10-09",kind:"Achievement",by:"e04",text:"Led the Bali launch social campaign; engagement 2.3× the previous quarter."}]}),
    em("e07","ONE-0012","Made Ariani","F","Operational Manager","Operations","supervisor","e01","2019-09-02","Active",C("PKWTT","PKWTT/ONE/2020/012","2020-09-02")),
    em("e08","ONE-0026","Putu Sari","F","Operations Staff","Operations","employee","e07","2025-03-03","Active",C("PKWT","PKWT/ONE/2026/003","2026-03-03","2027-03-02")),
    em("e09","ONE-0010","Hendra Gunawan","M","Finance Supervisor","Finance","supervisor","e01","2016-10-03","Active",C("PKWTT","PKWTT/ONE/2017/010","2017-10-03")),
    em("e10","ONE-0024","Siti Rahmawati","F","Accounting Staff","Finance","employee","e09","2024-04-22","Active",C("PKWT","PKWT/ONE/2025/015","2025-04-22","2027-04-21")),
    em("e11","ONE-0022","Wayan Darma","M","Operations Staff","Operations","employee","e07","2024-01-08","Resigned",C("PKWT","PKWT/ONE/2025/002","2025-01-08","2026-07-31"),{exitDate:"2026-07-31",exitReason:"Resigned — joined another company"}),
    em("e12","ONE-0029","Kadek Ayu Pratiwi","F","Operations Staff","Operations","employee","e07","2026-05-04","Active",C("PKWT","PKWT/ONE/2026/029","2026-08-03","2027-08-02"),
      {contracts:[C("Probation","PRB/ONE/2026/029","2026-05-04","2026-08-02"),C("PKWT","PKWT/ONE/2026/029","2026-08-03","2027-08-02")]}),
    em("e13","ONE-0032","Rizky Hidayat","M","Finance Staff","Finance","employee","e09","2026-09-14","Probation",C("Probation","PRB/ONE/2026/032","2026-09-14","2026-12-13")),
    em("e14","ONE-0027","Agung Wirawan","M","Content Specialist","Strategy & Growth","employee","e04","2025-10-27","Active",C("PKWT","PKWT/ONE/2026/004","2026-01-26","2027-01-25"),
      {contracts:[C("Probation","PRB/ONE/2025/027","2025-10-27","2026-01-25"),C("PKWT","PKWT/ONE/2026/004","2026-01-26","2027-01-25")]}),
    em("e15","ONE-0019","Yudi Kurniawan","M","Finance Staff","Finance","employee","e09","2023-03-06","Resigned",C("PKWT","PKWT/ONE/2025/005","2025-03-06","2026-02-27"),{exitDate:"2026-02-27",exitReason:"Contract not renewed"})
  ];
  const BD = {e01:"1979-03-12",e02:"1985-11-08",e03:"1997-06-21",e04:"1988-01-30",e05:"1996-11-05",e06:"2000-04-18",e07:"1990-08-09",e08:"1995-10-24",e09:"1983-12-02",e10:"1994-07-15",e11:"1998-09-09",e12:"2001-02-26",e13:"1999-12-11",e14:"1997-05-03",e15:"1992-03-03"};
  employees.forEach(e => {
    if(e.status === "Resigned") { e.quotaLog = []; return; }
    const lt = DEFAULT_CONFIG.leaveTypes, ok = t => t.track && (t.gender === "all" || t.gender === e.gender);
    const grant = (ctype, date, reason) => Object.entries(lt).filter(([k,t]) => ok(t) && Number(ctype === "Probation" ? t.probation : t.renewal) > 0)
      .map(([k,t]) => ({id:"g-"+e.id+"-"+k+"-"+date, date, type:k, delta:Number(ctype === "Probation" ? t.probation : t.renewal), reason, by:"e02"}));
    const recent = (e.contracts||[]).filter(c => c.start >= "2026-01-01");
    e.quotaLog = recent.length ? recent.flatMap(c => grant(c.type, c.start, `${c.type} contract ${c.no} — added on ${c === e.contracts[0] ? "new contract" : "renewal"}`))
      : grant(e.contract.type, "2026-01-01", "Opening balance 2026");
  });
  const ORGS = {e01:["Bali","ONEderland Consulting"],e02:["Bali","ONEderland Consulting"],e03:["Jakarta","ONEderland Consulting"],e04:["Bali","Strategy and Growth"],e05:["Jakarta","Strategy and Growth"],
    e06:["Bali","Strategy and Growth"],e07:["Gili Trawangan","PeraONE Xperience"],e08:["Gili Trawangan","PeraONE Xperience"],e09:["Surabaya","ONEderland Consulting"],e10:["Surabaya","Carbon Energy"],
    e11:["Gili Air","PeraONE Xperience"],e12:["Gili Air","English Cafe"],e13:["Surabaya","Carbon Energy"],e14:["Jakarta","Education ONE"],e15:["Jakarta","Education ONE"]};
  employees.forEach(e => { [e.office, e.division] = ORGS[e.id] || ["",""]; });
  employees.unshift({id:"e00", empNo:"SYS-0001", name:"Admin", system:true, admin:true, role:"employee", jobLevel:"", gender:"", position:"System Administrator", dept:"", division:"", office:"",
    supervisorId:null, joinDate:"2026-01-01", status:"Active", email:"admin@example.com", phone:"", contract:null, contracts:[], notes:[], quotaLog:[], birthDate:""});
  const JL = {e01:"General Manager", e07:"Operational Manager", e02:"Supervisor", e04:"Supervisor", e09:"Supervisor"};
  employees.forEach(e => { if(!e.system) e.jobLevel = JL[e.id] || "Staff"; });
  employees.forEach((e,i) => { e.birthDate = BD[e.id] || ""; if(!["e06","e13"].includes(e.id)) e.phone = "+62 812-3" + String(400 + i*37).padStart(3,"0") + "-" + String(1200 + i*311).slice(0,4); });
  const st = (role, approverId, status, note, at) => ({role, label:APPROVERS[role], approverId, status, note:note||"", at:at||null});
  const R = o => Object.assign({reason:"", doc:false, location:"", example:true, updatedAt:o.createdAt}, o);
  const requests = [
    R({id:"q01",no:"LV/2026/10/0012",kind:"leave",type:"annual",empId:"e05",start:"2026-11-03",end:"2026-11-06",days:4,status:"pending",current:0,reason:"Family trip to Lombok",createdAt:"2026-10-19T09:05:00+08:00",
       steps:[st("supervisor","e04","waiting"),st("hrd","e02","waiting")]}),
    R({id:"q02",no:"WFH/2026/10/0018",kind:"wfh",type:"wfh",empId:"e06",start:"2026-10-22",end:"2026-10-22",days:1,status:"pending",current:0,reason:"Waiting for internet installation at new rental",location:"Home, Denpasar",createdAt:"2026-10-20T07:40:00+08:00",
       steps:[st("supervisor","e04","waiting")]}),
    R({id:"q03",no:"LV/2026/10/0010",kind:"leave",type:"sick",empId:"e08",start:"2026-10-19",end:"2026-10-21",days:3,status:"approved",current:1,doc:true,reason:"Dengue fever, outpatient care",createdAt:"2026-10-19T06:55:00+08:00",
       steps:[st("supervisor","e07","approved","Get well soon. Shift covered.","2026-10-19T07:30:00+08:00"),st("hrd","e02","approved","Doctor's note received.","2026-10-19T10:10:00+08:00")]}),
    R({id:"q04",no:"LV/2026/10/0011",kind:"leave",type:"unpaid",empId:"e10",start:"2026-11-16",end:"2026-11-20",days:5,status:"pending",current:1,reason:"Accompanying my mother for surgery in Surabaya",createdAt:"2026-10-16T13:20:00+08:00",
       steps:[st("supervisor","e09","approved","Month-end closing is done before the 16th. Fine from my side.","2026-10-16T16:00:00+08:00"),st("hrd","e02","waiting"),st("gm","e01","waiting")]}),
    R({id:"q05",no:"LV/2026/10/0013",kind:"leave",type:"marriage",empId:"e03",start:"2026-12-14",end:"2026-12-16",days:3,status:"pending",current:0,doc:true,reason:"My wedding",createdAt:"2026-10-20T08:15:00+08:00",
       steps:[st("supervisor","e02","waiting")]}),
    R({id:"q06",no:"WFH/2026/10/0017",kind:"wfh",type:"wfh",empId:"e05",start:"2026-10-20",end:"2026-10-20",days:1,status:"approved",current:0,reason:"Deep work on Q4 growth model",location:"Home, Sanur",createdAt:"2026-10-17T15:00:00+08:00",
       steps:[st("supervisor","e04","approved","","2026-10-17T16:12:00+08:00")]}),
    R({id:"q07",no:"LV/2026/09/0008",kind:"leave",type:"annual",empId:"e06",start:"2026-09-07",end:"2026-09-08",days:2,status:"rejected",current:0,reason:"Family ceremony",createdAt:"2026-09-01T10:00:00+08:00",
       steps:[st("supervisor","e04","rejected","Annual leave starts after 12 months of service. Please apply as Unpaid Leave or swap days.","2026-09-01T11:30:00+08:00"),st("hrd","e02","skipped")]}),
    R({id:"q08",no:"LV/2026/10/0009",kind:"leave",type:"annual",empId:"e09",start:"2026-10-20",end:"2026-10-23",days:4,status:"approved",current:1,reason:"Family holiday in Yogyakarta",createdAt:"2026-10-05T09:00:00+08:00",
       steps:[st("supervisor","e01","approved","","2026-10-05T11:00:00+08:00"),st("hrd","e02","approved","","2026-10-05T14:20:00+08:00")]}),
    R({id:"q09",no:"LV/2026/10/0006",kind:"leave",type:"paternity",empId:"e04",start:"2026-10-05",end:"2026-10-06",days:2,status:"approved",current:1,reason:"Wife gave birth",createdAt:"2026-10-04T20:00:00+08:00",
       steps:[st("supervisor","e01","approved","Congratulations!","2026-10-04T20:40:00+08:00"),st("hrd","e02","approved","","2026-10-05T08:30:00+08:00")]})
  ];
  const cand = (id, name, position, dept, source, stage, appliedAt, extra={}) => Object.assign({id, name, email:name.toLowerCase().split(" ")[0]+"@example.com", phone:"", position, dept, source, stage, appliedAt, interviewAt:"", notes:"", example:true}, extra);
  const candidates = [
    cand("c1","Rani Oktaviani","Graphic Designer","Strategy & Growth","LinkedIn","interview","2026-10-02",{interviewAt:"2026-10-23",notes:"Strong portfolio in hospitality brands. User interview with Gede on 23 Oct."}),
    cand("c2","Yoga Mahendra","Finance Staff","Finance","Jobstreet","applied","2026-10-18"),
    cand("c3","Ayu Paramita","Operations Staff","Operations","Referral","offer","2026-09-20",{notes:"Offer sent 15 Oct, expected start 2 Nov."}),
    cand("c4","Dimas Prasetyo","Data Analyst","Strategy & Growth","Glints","screening","2026-10-12",{notes:"SQL test scheduled."}),
    cand("c5","Fajar Nugroho","Operations Staff","Operations","Walk-in","rejected","2026-09-15",{notes:"Not available for shift work."})
  ];
  const tasks = [
    {id:"t1",title:"Probation review — Komang Wira",kind:"Probation",period:"Probation 2026",supervisorId:"e04",memberIds:["e06"],done:[],due:"2026-11-09",message:"Please complete before the probation end date so we can decide on the PKWT contract.",createdBy:"e02",createdAt:"2026-10-19T09:00:00+08:00",status:"open",email:"sent",example:true},
    {id:"t2",title:"Q3 2026 performance review",kind:"Quarterly",period:"Q3 2026",supervisorId:"e07",memberIds:["e08"],done:["e08"],due:"2026-10-10",message:"",createdBy:"e02",createdAt:"2026-09-28T09:00:00+08:00",status:"done",email:"sent",example:true},
    {id:"t3",title:"Q3 2026 performance review",kind:"Quarterly",period:"Q3 2026",supervisorId:"e04",memberIds:["e05"],done:["e05"],due:"2026-10-10",message:"",createdBy:"e02",createdAt:"2026-09-28T09:00:00+08:00",status:"done",email:"sent",example:true}
  ];
  const reviews = [
    {id:"v1",taskId:"t2",empId:"e08",reviewerId:"e07",period:"Q3 2026",scores:{"Quality of work":4,"Productivity":4,"Teamwork":5,"Communication":4,"Initiative & ownership":3},overall:4,
     strengths:"Reliable on every shift, guests often mention her by name.",improvements:"Take more initiative proposing process fixes.",goals:"Lead the new check-in SOP rollout in Q4.",recommendation:"Meets expectations",submittedAt:"2026-10-08T15:00:00+08:00",example:true},
    {id:"v2",taskId:"t3",empId:"e05",reviewerId:"e04",period:"Q3 2026",scores:{"Quality of work":5,"Productivity":4,"Teamwork":4,"Communication":4,"Initiative & ownership":5},overall:4.4,
     strengths:"Excellent analysis; the pricing study changed our Q4 plan.",improvements:"Share drafts earlier with stakeholders.",goals:"Own the growth dashboard end to end.",recommendation:"Exceeds expectations",submittedAt:"2026-10-09T10:00:00+08:00",example:true}
  ];
  const reminders = [
    {id:"m1",title:"Contract renewal discussion with Dewi Lestari",date:"2026-11-02",type:"contract",empId:"e03",audience:["hrd","supervisor"],note:"Prepare PKWT extension or PKWTT proposal.",done:false,createdBy:"e02",example:true},
    {id:"m2",title:"Fire safety & evacuation training",date:"2026-10-28",type:"training",empId:null,audience:["all"],note:"Lobby, 14:00–16:00. Attendance is mandatory.",done:false,createdBy:"e02",example:true},
    {id:"m3",title:"Probation evaluation meeting — Komang Wira",date:"2026-11-10",type:"probation",empId:"e06",audience:["hrd","supervisor","employee"],note:"",done:false,createdBy:"e02",example:true}
  ];
  const notifs = [
    {id:"nt1",to:"e02",title:"Unpaid Leave needs your approval",body:"Siti Rahmawati · 16–20 Nov · step 2 of 3",view:"approvals",ref:"q04",at:"2026-10-16T16:00:00+08:00",read:false,example:true},
    {id:"nt2",to:"e02",title:"Marriage Leave needs your approval",body:"Dewi Lestari · 14–16 Dec",view:"approvals",ref:"q05",at:"2026-10-20T08:15:00+08:00",read:false,example:true},
    {id:"nt3",to:"e04",title:"New review task: Probation review — Komang Wira",body:"Assigned by Budi Santoso · due 9 Nov",view:"reviews",ref:"t1",at:"2026-10-19T09:00:00+08:00",read:false,example:true},
    {id:"nt4",to:"e04",title:"WFH request needs your approval",body:"Komang Wira · 22 Oct",view:"approvals",ref:"q02",at:"2026-10-20T07:40:00+08:00",read:false,example:true},
    {id:"nt5",to:"e04",title:"Annual Leave needs your approval",body:"Nadia Kurnia · 3–6 Nov",view:"approvals",ref:"q01",at:"2026-10-19T09:05:00+08:00",read:false,example:true}
  ];
  const announcements = [
    {id:"a1",title:"Leave quota now lives on your profile",category:"policy",pinned:true,authorId:"e02",publishAt:"2026-10-20",expires:"",createdAt:"2026-10-20T09:00:00+08:00",updatedAt:"2026-10-20T09:00:00+08:00",readBy:["e02"],example:true,
     body:"Starting today, your leave quota is shown under My Profile → Leave & Quota.\n\n• Quota is added automatically when your contract starts or is renewed.\n• Annual Leave is not granted during probation.\n• Only HRD can adjust quotas. If your numbers look wrong, contact Budi Santoso (HR)."},
    {id:"a2",title:"Fire safety & evacuation training — Wed, 28 Oct",category:"event",pinned:false,authorId:"e02",publishAt:"2026-10-16",expires:"2026-10-28",createdAt:"2026-10-16T10:00:00+08:00",updatedAt:"2026-10-16T10:00:00+08:00",readBy:["e02","e01","e04","e07"],example:true,
     body:"All staff must attend the fire safety and evacuation training on Wednesday, 28 October, 14:00–16:00 in the main lobby. Attendance will be recorded on your training history."},
    {id:"a3",title:"Welcome to our new team members",category:"general",pinned:false,authorId:"e02",publishAt:"2026-09-15",expires:"",createdAt:"2026-09-15T08:30:00+08:00",updatedAt:"2026-09-15T08:30:00+08:00",readBy:["e02","e01","e04","e05","e07","e08","e09","e10","e12","e14"],example:true,
     body:"Please welcome Komang Wira (Marketing Associate, Strategy & Growth) and Rizky Hidayat (Finance Staff). Say hello and help them settle in!"}
  ];
  const rnd = k => { let h = 2166136261; for(const c of k) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
  const attendance = [];
  for(const e of employees){
    const doc = {id:e.id+"_2026-09", empId:e.id, month:"2026-09", days:{}, example:true};
    for(let d = 1; d <= 30; d++){ const s = `2026-09-${pad(d)}`, w = new Date(2026, 8, d).getDay();
      if(w === 0 || w === 6 || s < e.joinDate || (e.exitDate && s > e.exitDate)) continue;
      const r = rnd(e.id+s), r2 = rnd(s+e.id), r3 = rnd(e.id+s+"o");
      if(r < (e.id === "e06" ? .05 : .025)) continue;
      const late = r2 < (e.id === "e06" ? .3 : e.id === "e10" ? .2 : .08);
      const inM = late ? 521 + Math.floor(r3 * 38) : 485 + Math.floor(r3 * 30);
      const outM = r2 > .96 ? null : r2 > .92 ? 1005 + Math.floor(r * 40) : 1050 + Math.floor(rnd(s+e.id+"x") * 55);
      doc.days[s] = {in:`${pad(Math.floor(inM/60))}:${pad(inM%60)}`, out:outM == null ? "" : `${pad(Math.floor(outM/60))}:${pad(outM%60)}`}; }
    if(Object.keys(doc.days).length) attendance.push(doc);
  }
  const attImports = [{id:"ai1", file:"Attendance_September_2026.xlsx", by:"e02", at:"2026-10-01T09:10:00+08:00", rows:attendance.reduce((s,a) => s + Object.keys(a.days).length, 0), records:attendance.reduce((s,a) => s + Object.keys(a.days).length, 0), employees:attendance.length, from:"2026-09-01", to:"2026-09-30", unmatched:0, example:true}];
  return {employees, requests, candidates, tasks, reviews, reminders, notifs, announcements, attendance, attImports, config:clone(DEFAULT_CONFIG)};
}

/* ================= navigation ================= */
function navItems(){
  const n = S.me ? pendingFor(S.me).length : 0, openTasks = S.D.tasks.filter(t => t.status === "open" && t.supervisorId === S.me).length;
  const g = [["Overview", [["dashboard","Dashboard","grid"],["announcements","Announcements","mega",annUnread().length]]]];
  if(isMgmt()) g.push(["People", [["directory","Employees","users"],["recruitment","Recruitment","brief"],["attendance","Attendance","fp"],["reviews","Performance","star",openTasks],["reminders","Contracts & Reminders","clock"]]]);
  else if(isLead()) g.push(["My Team", [["directory","Employees","users"],["reviews","Performance Reviews","star",openTasks]]]);
  else g.push(["Company", [["directory","Employees Directory","users"]]]);
  const time = []; if(isLead()) time.push(["approvals","Approvals","check",n]);
  time.push(["calendar","Team Calendar","cal"],["apply","Apply Request","plus"],["myrequests","My Requests","file"]);
  g.push(["Time Off & WFH", time]);
  g.push(["Me", [["profile","My Profile","user"]]]);
  const adm = []; if(isMgmt()) adm.push(["settings","Settings","cog"]); if(realAdmin()) adm.push(["system","System","shield"]); if(adm.length) g.push(["Administration", adm]);
  return g;
}
function renderNav(){
  renderBrand();
  document.getElementById("nav").innerHTML = navItems().map(([lab, items]) => `<span class="label">${lab}</span>` + items.map(([k,l,i,c]) =>
    `<button type="button" data-act="go" data-v="${k}" ${S.view===k && (k!=="profile" || !S.prm.id || S.prm.id===S.me)?'aria-current="page"':""}>${ic(i)}<span>${l}</span>${c!==undefined && (c>0 || k==="approvals")?`<span class="badge ${c?"":"zero"}">${c}</span>`:""}</button>`).join("")).join("");
  document.getElementById("sbfoot").innerHTML = S.mode === "db" ? (S.me ? `Signed in${S.who?.name ? " as " + esc(S.who.name) : ""} · HRM ${APP_VERSION}` : "Connect your account to continue.") : S.mode === "demo" ? "Demo mode: changes aren't saved in this view." : "Loading…";
}
function notifList(){
  const own = S.D.notifs.filter(n => n.to === S.me).sort((a,b) => b.at.localeCompare(a.at));
  const due = remindersFor(me()).filter(r => diffDays(today(), r.date) <= 7).map(r => ({id:"rem-"+r.id, rem:true, title:r.title, body:`${REM_TYPES[r.type]||"Reminder"} · ${diffDays(today(), r.date) < 0 ? "overdue since " : ""}${fmt(r.date)}`, view: isMgmt() ? "reminders" : (r.empId ? "profile" : "dashboard"), ref:r.empId, at:r.date, read:true}));
  return {own, due, unread: own.filter(n => !n.read).length + due.length};
}
function notifItem(n){
  const k = n.rem ? "reminder" : notifKind(n), d = NOTIFY[k];
  return `<button class="ni ${n.read?"":"unread"}" type="button" data-act="open-notif" data-id="${esc(n.id)}">
    <span class="tile c${d[3]} ni-ic">${ic(d[2])}</span>
    <span class="ni-t"><b>${esc(n.title)}</b><span class="ni-b">${esc(n.body)}</span><span class="ni-m">${esc(n.rem ? "Upcoming reminder" : d[5])} · ${n.rem ? esc(fmt(n.at)) : ago(n.at)}</span></span>
    ${n.read ? "" : `<span class="ni-dot" aria-label="Unread"></span>`}</button>`;
}
function notifPanel(nl){
  const all = nl.own.slice(0, 40); if(!all.length && !nl.due.length) return `<div class="empty ni-empty">${ic("bell")}<b>You're all caught up</b><span>New approvals, reviews and announcements show up here.</span></div>`;
  const fresh = all.filter(n => !n.read), old = all.filter(n => n.read);
  const sec = (label, list) => list.length ? `<div class="ni-sec">${label}</div>` + list.map(notifItem).join("") : "";
  return sec("Coming up", nl.due) + sec("New", fresh) + sec("Earlier", old);
}
function renderTop(){
  const m = me(), nl = notifList(), dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  const people = [...S.D.employees].sort((a,b) => (b.admin?1:0) - (a.admin?1:0) || Object.keys(ROLES).indexOf(b.role) - Object.keys(ROLES).indexOf(a.role) || a.name.localeCompare(b.name));
  document.getElementById("tb").innerHTML = `
    <button class="ib plain menu-btn" type="button" data-act="nav-open" aria-label="Open menu">${ic("menu")}</button>
    <div class="search anchor ${S.pop==="search"||S.ui.searchOpen?"show":""}" id="searchbox">${ic("search")}
      <input type="search" id="q" placeholder="Search employees, leave requests…" value="${esc(S.q)}" autocomplete="off" aria-label="Search">
      ${S.pop === "search" && S.q.trim() ? searchResults() : ""}</div>
    <div class="tb-sp"></div>
    <button class="ib plain search-toggle" type="button" data-act="search-toggle" aria-label="Search">${ic("search")}</button>
    <button class="ib plain" type="button" data-act="theme" aria-label="Switch to ${dark?"light":"dark"} mode">${ic(dark?"sun":"moon")}</button>
    <div class="anchor"><button class="ib plain" type="button" data-act="pop" data-v="bell" aria-label="Notifications" aria-expanded="${S.pop==="bell"}">${ic("bell")}${nl.unread?`<span class="dot">${nl.unread>9?"9+":nl.unread}</span>`:""}</button>
      ${S.pop === "bell" ? `<div class="pop pop-n" role="dialog" aria-label="Notifications"><div class="pop-h"><h3>Notifications</h3>${nl.own.some(n=>!n.read)?`<button class="btn link small" type="button" data-act="read-all">Mark all as read</button>`:""}</div>
        <div class="pop-b">${notifPanel(nl)}</div>${isHR() ? `<div class="pop-f"><button class="btn link small" type="button" data-act="notif-settings">${ic("cog")}Notification settings</button></div>` : ""}</div>` : ""}</div>
    <div class="anchor"><button class="me-btn" type="button" data-act="pop" data-v="user" aria-expanded="${S.pop==="user"}">${m?av(m.id):""}<span class="nm">${esc(m?.name||"—")}<small>${m?.admin ? "Admin" : esc(jobOf(m)) + (m?.role==="hrd"?" · HRD":"")}</small></span>${ic("down")}</button>
      ${S.pop === "user" ? userMenu(people) : ""}</div>`;
}
function userMenu(people){
  const demo = S.mode !== "db", canPrev = demo || realAdmin();
  return `<div class="pop" role="dialog" aria-label="Account"><div class="pop-h"><div><h3>${esc(realMe()?.name || me()?.name || "")}</h3><span class="small muted">${demo ? "Demo mode — pick who you are acting as" : "Signed in" + (S.who?.email ? " as " + esc(S.who.email) : "")}</span></div></div>
    <div class="pop-b">${S.preview ? `<button class="res" type="button" data-act="preview-exit">${ic("x")}<b style="font-weight:600">Exit preview</b></button>` : ""}
      <button class="res" type="button" data-act="go" data-v="profile">${ic("user")}<span>My profile</span></button>
      ${canPrev ? `<div class="label" style="padding:12px 14px 4px">${demo ? "Act as" : "Preview as (Admin)"}</div>${people.filter(e => demo || e.id !== S.realEmpId).map(e => `<button class="res" type="button" data-act="${demo ? "view-as" : "preview-as"}" data-id="${e.id}" ${e.id===S.me?'aria-current="true" style="background:var(--accent-soft)"':""}>${av(e.id,"sm")}<span style="min-width:0;flex:1"><b style="display:block;font-weight:600">${esc(e.name)}</b><span class="small muted">${esc(e.position)}${!demo ? (e.userId ? " · has account (read-only)" : " · no account") : ""}</span></span><span class="tag">${e.admin ? "Admin" : esc(jobOf(e)) + (e.role==="hrd"?" · HRD":"")}</span></button>`).join("")}` : ""}
      ${!demo && window.HRM ? `<button class="res" type="button" data-act="sign-out" style="border-top:1px solid var(--line)">${ic("x")}<span>Sign out</span></button>` : ""}</div></div>`;
}
function searchResults(){
  const q = S.q.trim().toLowerCase();
  const people = E().filter(e => (e.name+" "+e.position+" "+e.dept+" "+e.empNo).toLowerCase().includes(q)).slice(0,6);
  const reqs = visibleRequests().filter(r => (r.no+" "+nm(r.empId)+" "+typeName(r)).toLowerCase().includes(q)).slice(0,5);
  return `<div class="pop" style="left:0;right:auto;width:100%">${people.length || reqs.length ? `
    ${people.length?`<div class="label" style="padding:12px 14px 4px">Employees</div>${people.map(e => `<button class="res" type="button" data-act="open-emp" data-id="${e.id}">${av(e.id,"sm")}<span><b style="font-weight:600">${esc(e.name)}</b><br><span class="small muted">${esc(e.position)} · ${esc(e.dept)}</span></span></button>`).join("")}`:""}
    ${reqs.length?`<div class="label" style="padding:12px 14px 4px">Requests</div>${reqs.map(r => `<button class="res" type="button" data-act="open-req" data-id="${r.id}">${av(r.empId,"sm")}<span><b style="font-weight:600">${esc(nm(r.empId))} · ${esc(typeName(r))}</b><br><span class="small muted">${esc(r.no)} · ${range(r.start,r.end)}</span></span></button>`).join("")}`:""}`
    : `<div class="empty">No employees or requests match “${esc(S.q)}”.</div>`}</div>`;
}
function visibleRequests(){
  const m = me(); if(!m) return [];
  if(isMgmt()) return S.D.requests;
  const team = new Set(reports(m.id).map(e => e.id));
  return S.D.requests.filter(r => r.empId === m.id || team.has(r.empId) || r.steps.some(s => s.approverId === m.id));
}

/* ================= shared components ================= */
const statusPill = r => r.status === "pending" ? `<span class="pill p-pending">Pending · ${r.current+1}/${r.steps.length}</span>` :
  `<span class="pill p-${r.status}">${r.status[0].toUpperCase()+r.status.slice(1)}</span>`;
function chain(r, preview){
  const head = `<li class="ok"><span class="nd">${esc(ini(r.empId))}</span><div class="tx"><b>${esc(nm(r.empId))}</b><span>Requester</span>${r.createdAt?`<em>Submitted ${fmt(r.createdAt.slice(0,10))}</em>`:""}</div></li>`;
  return `<ol class="chain" aria-label="Approval flow">${head}${r.steps.map((s,i) => {
    let c = "wait", t = "Waiting";
    if(preview){ c = "plan"; t = `Step ${i+1}`; }
    else if(s.status === "approved"){ c = "ok"; t = "Approved · " + fmt(s.at?.slice(0,10)); }
    else if(s.status === "rejected"){ c = "no"; t = "Rejected · " + fmt(s.at?.slice(0,10)); }
    else if(s.status === "skipped" || r.status === "cancelled"){ c = "skip"; t = "Not needed"; }
    else if(r.status === "pending" && i === r.current){ c = "cur"; t = "In review"; }
    const v = preview || !r.id ? null : verifyStep(r, i);
    const sig = v === "ok" ? `<span class="sig ok" title="Matches the approver's own signed decision">${ic("shield")}signed</span>` : v === "missing" || v === "mismatch" ? `<span class="sig bad" title="No matching signed decision from this approver">${ic("alert")}unverified</span>` : "";
    return `<li class="${c}"><span class="nd">${esc(ini(s.approverId))}</span><div class="tx"><b>${esc(nm(s.approverId))}</b><span>${esc(s.label)}</span><em>${t}</em>${sig}${s.note && !preview?`<div class="nt">“${esc(s.note)}”</div>`:""}</div></li>`;
  }).join("")}</ol>`;
}
function reqTable(list, opts={}){
  if(!list.length) return `<div class="empty"><b>No requests yet</b>${opts.empty||"Requests will appear here."}</div>`;
  return `<div class="tw"><table class="t rt"><thead><tr>${opts.noEmp?"":"<th>Employee</th>"}<th>Type</th><th>Date</th><th>Days</th><th>Status</th><th class="r">Action</th></tr></thead><tbody>
    ${list.map(r => `<tr class="click" data-act="open-req" data-id="${r.id}">
      ${opts.noEmp?"":`<td class="wide">${who(r.empId)}</td>`}
      <td data-l="Type"><span style="display:inline-flex;gap:6px;align-items:center">${r.kind==="wfh"?ic("home","muted"):""}${esc(typeName(r))}</span></td>
      <td data-l="Date">${range(r.start, r.end)}</td><td data-l="Days" class="num">${r.days}</td>
      <td data-l="Status">${statusPill(r)}</td><td class="r"><button class="btn link" type="button" data-act="open-req" data-id="${r.id}">Details</button></td></tr>`).join("")}
  </tbody></table></div>`;
}
function balanceCard(eid, title="My Leave Balance", link=true){
  const e = emp(eid), types = typesFor(e);
  return `<section class="card"><div class="card-h"><span class="tile c1" style="width:40px;height:40px">${ic("chart")}</span><h2>${title}</h2>${link?`<button class="btn link" type="button" data-act="go" data-v="apply">Request ${ic("right")}</button>`:""}</div>
    <div class="bal">${types.map(([k,t]) => { const b = balance(eid, k);
      const pct = v => b.unlimited || !b.quota ? 0 : Math.min(100, Math.max(0, v / b.quota * 100));
      return `<div class="bal-row"><div class="top"><span>${esc(t.name)}</span><span class="num">${b.unlimited ? `${b.used} <small>days used</small>` : `${b.avail} <small>/ ${b.quota}</small>`}</span></div>
        <div class="track" role="img" aria-label="${esc(t.name)}: ${b.used} used, ${b.pend} pending${b.unlimited?"":`, ${b.avail} available of ${b.quota}`}">${b.unlimited?"":`<i class="u" style="width:${pct(b.used)}%"></i><i class="p" style="width:${pct(b.pend)}%"></i>`}</div></div>`; }).join("")}
      <div class="row small muted" style="gap:16px"><span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--accent);margin-right:6px"></i>Used</span><span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--warn);margin-right:6px"></i>Pending</span><span>Available / total granted. Quota is managed by HRD.</span></div>
    </div></section>`;
}
const stat = (c, icon, v, l, extra="") => `<div class="stat ${c}"><span class="tile ${c}">${ic(icon)}</span><div><div class="v">${v}</div><div class="l">${l}</div>${extra}</div></div>`;
const statBtn = (c, icon, v, l, view, link) => `<button type="button" class="stat ${c}" data-act="go" data-v="${view}"><span class="tile ${c}">${ic(icon)}</span><div><div class="v">${v}</div><div class="l">${l}</div>${link?`<span class="lk" style="color:var(--${c==="c3"?"t3f":"accent"})">${link} ${ic("right")}</span>`:""}</div></button>`;
function reminderList(list, limit){
  if(!list.length) return `<div class="empty"><b>Nothing scheduled</b>Contract ends, probation dates and HR sessions will show here.</div>`;
  return `<div class="list">${list.slice(0, limit||99).map(r => { const d = diffDays(today(), r.date);
    return `<div class="li"><span class="tile ${r.type==="training"?"c4":r.type==="contract"?"c2":r.type==="probation"?"c3":"c1"}" style="width:38px;height:38px">${ic(r.type==="training"?"clip":r.type==="contract"||r.type==="probation"?"doc":"clock")}</span>
      <div class="grow"><b style="font-weight:600;display:block">${esc(r.title)}</b><span class="small muted">${fmt(r.date)} · ${REM_TYPES[r.type]||"Reminder"}${r.auto?" · auto":""}</span></div>
      <span class="pill ${d<0?"p-rejected":d<=7?"p-pending":"p-neutral"}">${d<0?`${-d}d overdue`:d===0?"Today":`in ${d}d`}</span></div>`; }).join("")}</div>`;
}

/* ================= views ================= */
/* ---------- HR analytics ---------- */
const activeE = () => E().filter(e => e.status !== "Resigned");
const hcAt = d => E().filter(e => e.joinDate && e.joinDate <= d && (!e.exitDate || e.exitDate > d)).length;
function trend12(){
  const out = [], n = new Date();
  for(let i = 11; i >= 0; i--){ const end = new Date(n.getFullYear(), n.getMonth()-i+1, 0), s = i === 0 ? today() : iso(end), ym = s.slice(0,7);
    out.push({m:MON[end.getMonth()], y:end.getFullYear(), v:hcAt(s), hires:E().filter(e => e.joinDate?.slice(0,7) === ym).length, exits:E().filter(e => e.exitDate?.slice(0,7) === ym).length, now:i===0}); }
  return out;
}
function hrMetrics(){
  const t = today(), act = activeE().filter(e => e.joinDate <= t), tr = trend12();
  const avg = tr.reduce((s,x) => s + x.v, 0) / tr.length || 1;
  const exits12 = E().filter(e => e.exitDate && e.exitDate <= t && diffDays(e.exitDate, t) <= 365);
  const hires12 = E().filter(e => e.joinDate && e.joinDate <= t && diffDays(e.joinDate, t) <= 365);
  const hiresYTD = E().filter(e => e.joinDate && e.joinDate <= t && e.joinDate.slice(0,4) === t.slice(0,4));
  const tenureAvg = act.length ? act.reduce((s,e) => s + months(e.joinDate), 0) / act.length : 0;
  return {act, tr, exits12, hires12, hiresYTD, turnover:exits12.length / avg * 100, tenureAvg, upcoming:E().filter(e => e.joinDate > t && e.status !== "Resigned")};
}
const yrsMo = m => m < 12 ? `${Math.round(m)} mo` : `${(m/12).toFixed(1)} yrs`;
const nextOccur = md => { const t = today(), y = Number(t.slice(0,4)); const s = `${y}-${md}`; return s < t ? `${y+1}-${md}` : s; };
function peopleEvents(days, scope){
  const t = today(), list = [];
  for(const e of scope){
    if(e.birthDate){ const d = nextOccur(e.birthDate.slice(5)), n = diffDays(t, d); if(n <= days) list.push({id:e.id, kind:"birthday", date:d, n, label:"Birthday"}); }
    if(e.joinDate && e.joinDate < t){ const d = nextOccur(e.joinDate.slice(5)), yrs = Number(d.slice(0,4)) - Number(e.joinDate.slice(0,4)), n = diffDays(t, d);
      if(yrs >= 1 && n <= days) list.push({id:e.id, kind:"anniv", date:d, n, label:`${yrs}-year work anniversary`}); }
    if(e.joinDate && diffDays(e.joinDate, t) <= 30 && diffDays(t, e.joinDate) <= days) list.push({id:e.id, kind:"join", date:e.joinDate, n:diffDays(t, e.joinDate), label:e.joinDate > t ? "Starts work" : "New joiner"});
  }
  return list.sort((a,b) => a.n - b.n);
}
function attention(ids, supId){
  const t = today(), items = [], inS = id => !ids || ids.has(id);
  for(const e of activeE()){ if(!inS(e.id) || !e.contract?.end) continue; const c = e.contract, d = diffDays(t, c.end);
    if(d < 0) items.push({sev:3, text:`${e.name}'s ${c.type} contract expired on ${fmt(c.end)}`, act:"contract-new", id:e.id, btn:isHR()?"Renew":""});
    else if(d <= (cfg().contractReminderDays || 30)) items.push({sev:2, text:c.type === "Probation" ? `${e.name}'s probation ends in ${d} days — decide on the contract` : `${e.name}'s ${c.type} contract ends in ${d} days`, act:"open-emp", id:e.id, tab:"contract", btn:"Open"}); }
  for(const k of S.D.tasks.filter(x => x.status === "open" && (!supId || x.supervisorId === supId))){ const d = diffDays(t, k.due), left = k.memberIds.length - k.done.length;
    if(d < 0) items.push({sev:3, text:`Review “${k.title}” is ${-d} day(s) overdue (${left} pending with ${nm(k.supervisorId)})`, act:"go", v:"reviews", btn:"View"});
    else if(d <= 21) items.push({sev:1, text:`${left} review(s) due ${fmt(k.due)} — ${k.title}`, act:"go", v:"reviews", btn:"View"}); }
  const stale = S.D.requests.filter(r => r.status === "pending" && inS(r.empId) && diffDays(r.createdAt.slice(0,10), t) >= 3);
  if(stale.length) items.push({sev:2, text:`${stale.length} time-off request(s) waiting more than 3 days for approval`, act:"go", v:supId ? "approvals" : "myrequests", p:supId ? "" : "all", btn:"Check"});
  if(!ids){
    for(const c of S.D.candidates.filter(x => x.stage === "offer")) items.push({sev:1, text:`${c.name} has an open offer for ${c.position}`, act:"cand-open", id:c.id, btn:"Open"});
    for(const c of S.D.candidates.filter(x => x.stage === "interview" && x.interviewAt && diffDays(t, x.interviewAt) >= 0 && diffDays(t, x.interviewAt) <= 7)) items.push({sev:1, text:`Interview with ${c.name} (${c.position}) on ${fmt(c.interviewAt)}`, act:"cand-open", id:c.id, btn:"Open"});
    const lr = S.R.links.filter(l => !l.status || l.status === "pending").length;
    if(lr && S.canEdit) items.push({sev:2, text:`${lr} account connect request(s) waiting for approval`, act:"go", v:"directory", btn:"Review"});
    const nolink = activeE().filter(e => !e.userId).length;
    if(dbOn() && nolink) items.push({sev:1, text:`${nolink} employee(s) haven't connected their account yet`, act:"go", v:realAdmin() ? "system" : "directory", btn:"View"});
    const inc = activeE().filter(e => !e.email || !e.phone || !e.birthDate);
    if(inc.length) items.push({sev:1, text:`${inc.length} employee profile(s) missing phone, email or birth date`, act:"go", v:"directory", btn:"Review"});
  }
  return items.sort((a,b) => b.sev - a.sev);
}
function attentionList(items){
  if(!items.length) return `<div class="empty"><b>Nothing needs attention</b>Contracts, probations, reviews and approvals are on track.</div>`;
  return `<div class="list">${items.map(x => `<div class="li att s${x.sev}"><span class="sevdot" aria-hidden="true"></span><span class="grow">${esc(x.text)}</span>${x.btn ? `<button class="btn sm" type="button" data-act="${x.act}" ${x.id?`data-id="${x.id}"`:""} ${x.v?`data-v="${x.v}"`:""} ${x.p?`data-p="${x.p}"`:""} ${x.tab?`data-tab="${x.tab}"`:""}>${x.btn}</button>` : ""}</div>`).join("")}</div>`;
}
function eventsList(list){
  if(!list.length) return `<div class="empty">No birthdays, anniversaries or new joiners in the next 30 days.</div>`;
  return `<div class="list">${list.slice(0,7).map(x => `<button class="li res" type="button" data-act="open-emp" data-id="${x.id}" style="border-top:1px solid var(--line)">${av(x.id,"sm")}<span class="grow" style="min-width:0"><b style="font-weight:600;display:block">${esc(nm(x.id))}</b><span class="small muted">${x.label} · ${fmt(x.date)}</span></span>
    <span class="pill ${x.kind==="birthday"?"p-info":x.kind==="join"?"p-approved":"p-pending"}">${x.n===0?"Today":x.n<0?`${-x.n}d ago`:`in ${x.n}d`}</span></button>`).join("")}</div>`;
}
const card = (title, icon, c, body, extra="") => `<section class="card"><div class="card-h">${icon?`<span class="tile ${c}" style="width:38px;height:38px">${ic(icon)}</span>`:""}<h2>${title}</h2>${extra}</div>${body}</section>`;
const kpi = (label, v, sub, cls="") => `<div class="kpi ${cls}"><span class="kl">${label}</span><span class="kval">${v}</span><span class="ks">${sub}</span></div>`;
function hbars(rows, max, fmtV = v => v){
  return `<div class="hbars">${rows.map(([l, v, c]) => `<div><span class="hl">${esc(l)}</span><i><b style="width:${max ? v/max*100 : 0}%;${c?`background:${c}`:""}"></b></i><span class="hv num">${fmtV(v)}</span></div>`).join("")}</div>`;
}
function stackbar(parts){
  const tot = parts.reduce((s,p) => s + p[1], 0) || 1;
  return `<div class="stackbar" role="img" aria-label="${parts.map(p => `${p[0]} ${p[1]}`).join(", ")}">${parts.map(([l,v,c]) => v ? `<i style="width:${v/tot*100}%;background:${c}"></i>` : "").join("")}</div>
    <div class="legend">${parts.map(([l,v,c]) => `<span><i style="background:${c}"></i>${esc(l)} <b class="num">${v}</b> <span class="muted">${Math.round(v/tot*100)}%</span></span>`).join("")}</div>`;
}
function todayStrip(scope){
  const t = today(), ids = new Set(scope.map(e => e.id)), w = parse(t).getDay();
  const out = S.D.requests.filter(r => r.status === "approved" && r.start <= t && r.end >= t && ids.has(r.empId));
  const lv = out.filter(r => r.kind === "leave"), wf = out.filter(r => r.kind === "wfh");
  const avs = list => list.length ? `<div class="avs">${list.slice(0,5).map(r => `<button type="button" data-act="open-emp" data-id="${r.empId}" title="${esc(nm(r.empId))} · ${esc(typeName(r))}" style="border:0;background:none;padding:0">${av(r.empId,"sm")}</button>`).join("")}${list.length>5?`<span class="small muted">+${list.length-5}</span>`:""}</div>` : `<span class="small muted">None</span>`;
  const pend = isMgmt() ? S.D.requests.filter(r => r.status === "pending").length : pendingFor(S.me).length;
  return `<section class="card strip">
    <div><span class="kl">In office today</span><span class="kval num">${w===0||w===6 ? "—" : Math.max(0, scope.filter(e => e.joinDate <= t).length - out.length)}</span><span class="small muted">${w===0||w===6?"Weekend":`of ${scope.filter(e => e.joinDate <= t).length} people`}</span></div>
    <div><span class="kl">On leave</span><span class="kval num">${lv.length}</span>${avs(lv)}</div>
    <div><span class="kl">Working from home</span><span class="kval num">${wf.length}</span>${avs(wf)}</div>
    <div><span class="kl">${isMgmt()?"Open time-off requests":"Waiting for you"}</span><span class="kval num">${pend}</span><button class="btn link small" type="button" data-act="go" data-v="${isMgmt()?"myrequests":"approvals"}" ${isMgmt()?'data-p="all"':""}>Open ${ic("right")}</button></div>
  </section>`;
}
function dashHead(m, actions){
  const d = new Date(), hr = d.getHours(), greet = hr < 11 ? "Good morning" : hr < 15 ? "Good afternoon" : hr < 19 ? "Good evening" : "Good night";
  return `<div class="page-h"><div><span class="label">${DOWL[d.getDay()]}, ${d.getDate()} ${MONL[d.getMonth()]} ${d.getFullYear()}</span><h1 style="margin-top:4px">${greet}, ${esc(m.name.split(" ")[0])}</h1></div><div class="row">${actions}</div></div>`
   + (E().some(e => e.example) ? `<div class="note">${ic("info")}<div><b>Sample data.</b> All people and records are fictional. ${S.mode === "db" ? (realAdmin() ? `As Admin you can act on behalf of any sample person from the profile menu (top right) — e.g. <b>Budi Santoso</b> (HRD), <b>Gede Saputra</b> (Supervisor) or <b>Komang Wira</b> (Employee). Remove the sample data in System → Maintenance before going live.` : "The administrator will replace it with real data before go-live.") : `Switch roles from the profile menu at the top right.`}</div></div>` : "");
}

function vDashboard(){
  const m = me(); if(!isMgmt()) return isLead() ? vDashLead(m) : vDashEmp(m);
  const H = hrMetrics(), t = today();
  const actions = isHR() ? `<button class="btn" type="button" data-act="rem-new">${ic("clock")}Add reminder</button><button class="btn" type="button" data-act="ann-new">${ic("mega")}Announce</button><button class="btn" type="button" data-act="task-new">${ic("star")}Assign review</button><button class="btn" type="button" data-act="cand-new">${ic("brief")}Add candidate</button><button class="btn pri" type="button" data-act="emp-new">${ic("plus")}Add employee</button>`
    : `<button class="btn" type="button" data-act="go" data-v="directory">${ic("users")}Employees</button>`;
  const ending = activeE().filter(e => e.contract?.end && diffDays(t, e.contract.end) >= 0 && diffDays(t, e.contract.end) <= (cfg().contractReminderDays||30));
  const pipeline = S.D.candidates.filter(c => ["applied","screening","interview","offer"].includes(c.stage)), positions = [...new Set(pipeline.map(c => c.position))];
  const kpis = `<div class="grid kpis">
    ${kpi("Active employees", H.act.length, `<span class="up">+${H.hires12.length}</span> joined · <span class="down">−${H.exits12.length}</span> left (12 mo)`)}
    ${kpi("New hires "+t.slice(0,4), H.hiresYTD.length, H.upcoming.length ? `${H.upcoming.length} starting soon` : "Year to date")}
    ${kpi("Turnover rate", H.turnover.toFixed(1)+"%", `${H.exits12.length} exit(s), last 12 months`)}
    ${kpi("Average tenure", yrsMo(H.tenureAvg), `${H.act.filter(e => e.status === "Probation").length} on probation`)}
    ${kpi("Open positions", positions.length, `${pipeline.length} candidates in pipeline`)}
    ${kpi("Contracts ending", ending.length, `next ${cfg().contractReminderDays||30} days`, ending.length ? "warn" : "")}
  </div>`;
  const max = Math.max(...H.tr.map(x => x.v), 1);
  const trend = card("Headcount trend", "chart", "c1", `<div class="trend" role="img" aria-label="Headcount over the last 12 months: ${H.tr.map(x => `${x.m} ${x.v}`).join(", ")}">
      ${H.tr.map(x => `<div class="tcol ${x.now?"now":""}" title="${x.m} ${x.y}: ${x.v} employees, ${x.hires} joined, ${x.exits} left"><span class="tv num">${x.v}</span><span class="tb"><i style="height:${x.v/max*100}%"></i></span><span class="tm">${x.m}</span><span class="tx">${x.hires?`<em class="up">+${x.hires}</em>`:""}${x.exits?`<em class="down">−${x.exits}</em>`:""}</span></div>`).join("")}
    </div><div class="card-b small muted" style="padding-top:0">Employees at month end. Green and red marks show joiners and leavers in that month.</div>`,
    `<span class="tag">Last 12 months</span>`);
  const st = s => H.act.filter(e => (e.contract?.type || "") === s).length;
  const tb = [["< 1 year",0,12],["1–3 years",12,36],["3–5 years",36,60],["5+ years",60,1e9]].map(([l,a,b]) => [l, H.act.filter(e => { const mo = months(e.joinDate); return mo >= a && mo < b; }).length]);
  const comp = card("Workforce composition", "users", "c4", `<div class="card-b stack">
      <div><h3 class="sub">Employment status</h3>${stackbar([["Permanent (PKWTT)", st("PKWTT"), "var(--t1f)"], ["Contract (PKWT)", st("PKWT"), "var(--t2f)"], ["Probation", st("Probation"), "var(--t4f)"]])}</div>
      <div><h3 class="sub">Gender</h3>${stackbar([["Female", H.act.filter(e => e.gender === "F").length, "var(--t6f)"], ["Male", H.act.filter(e => e.gender === "M").length, "var(--t1f)"], ["Not set", H.act.filter(e => !e.gender).length, "var(--off)"]].filter(p => p[1] || p[0] !== "Not set"))}</div>
      <div><h3 class="sub">Length of service</h3>${hbars(tb, Math.max(...tb.map(x => x[1]), 1))}</div></div>`);
  const depts = Object.entries(H.act.reduce((o,e) => (o[e.dept] = (o[e.dept]||0) + 1, o), {})).sort((a,b) => b[1] - a[1]);
  const divs = Object.entries(H.act.reduce((o,e) => { const k = e.division || "Unassigned"; o[k] = (o[k]||0) + 1; return o; }, {})).sort((a,b) => b[1] - a[1]);
  const offs = (cfg().offices||[]).map(o => [o, H.act.filter(e => e.office === o).length]);
  const deptCard = card("Headcount by division", "grid", "c1", `<div class="card-b">${hbars(divs, Math.max(...divs.map(d => d[1]), 1))}</div>`, `<button class="btn link" type="button" data-act="go" data-v="directory">All ${ic("right")}</button>`);
  const offCard = card("Headcount by office", "pinmap", "c2", `<div class="card-b">${hbars(offs, Math.max(...offs.map(d => d[1]), 1))}</div>`);
  const ams = monthsWithData(), lastM = ams[ams.length-1], AS = lastM ? attSummary(activeE(), lastM) : null;
  const attCard = card("Attendance", "fp", "c5", AS && AS.rows.length ? `<div class="card-b stack"><div class="row" style="gap:18px;align-items:flex-end"><div><span class="big">${AS.rate == null ? "—" : AS.rate.toFixed(1)+"%"}</span><p class="small muted">attendance rate · ${monthLabel(lastM)}</p></div></div>
      <div class="kv"><div><span>Average check-in</span>${AS.avgIn}</div><div><span>Late arrivals</span>${AS.late}</div><div><span>Unexcused absences</span><span class="${AS.absent?"down":""}">${AS.absent}</span></div><div><span>Missing punches</span>${AS.missingOut}</div></div></div>`
    : `<div class="empty">No attendance uploaded yet.</div>`, `<button class="btn link" type="button" data-act="go" data-v="attendance">Report ${ic("right")}</button>`);
  const funnel = STAGES.map(([k,l]) => [l, S.D.candidates.filter(c => c.stage === k).length]);
  const rec = card("Recruitment", "brief", "c5", `<div class="card-b stack">${hbars(funnel, Math.max(...funnel.map(f => f[1]), 1))}
      ${positions.length ? `<div><h3 class="sub">Open positions</h3><div class="row" style="gap:6px">${positions.map(p => `<span class="tag">${esc(p)}</span>`).join("")}</div></div>` : ""}</div>`,
    `<button class="btn link" type="button" data-act="go" data-v="recruitment">Pipeline ${ic("right")}</button>`);
  const open = S.D.tasks.filter(k => k.status === "open"), tot = open.reduce((s,k) => s + k.memberIds.length, 0), dn = open.reduce((s,k) => s + k.done.length, 0);
  const byDept = Object.entries(S.D.reviews.reduce((o,r) => { const d = emp(r.empId)?.dept || "Other"; (o[d] = o[d] || []).push(Number(r.overall)); return o; }, {})).map(([d,a]) => [d, Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10]);
  const perf = card("Performance", "star", "c4", `<div class="card-b stack">
      <div><div class="row" style="justify-content:space-between"><h3 class="sub" style="margin:0">Open review tasks</h3><span class="num small">${dn}/${tot} done</span></div><div class="stackbar" style="margin-top:8px"><i style="width:${tot?dn/tot*100:0}%;background:var(--ok)"></i></div>
        <p class="small muted" style="margin-top:6px">${open.length} task(s) open${open.filter(k => k.due < t).length ? ` · <span class="down">${open.filter(k => k.due < t).length} overdue</span>` : ""}</p></div>
      <div><h3 class="sub">Average review score by department</h3>${byDept.length ? hbars(byDept, 5, v => v.toFixed(1)) : `<p class="small muted">No completed reviews yet.</p>`}</div></div>`,
    `<button class="btn link" type="button" data-act="go" data-v="reviews">Reviews ${ic("right")}</button>`);
  const att = card("Needs attention", "alert", "c3", attentionList(attention()), `<span class="tag">${attention().length}</span>`);
  const ev = card("Celebrations & new joiners", "users", "c6", eventsList(peopleEvents(30, E().filter(e => e.status !== "Resigned"))), `<span class="tag">Next 30 days</span>`);
  return dashHead(m, actions) + kpis + todayStrip(activeE()) +
    `<div class="grid split">${trend}${comp}</div><div class="grid split">${att}<div class="stack">${annWidget(3)}${ev}</div></div><div class="grid three">${deptCard}${offCard}${attCard}</div><div class="grid two">${rec}${perf}</div>`;
}
function vDashLead(m){
  const team = reports(m.id), ids = new Set(team.map(e => e.id)), t = today();
  const tasks = S.D.tasks.filter(k => k.supervisorId === m.id && k.status === "open");
  const pendRev = tasks.reduce((s,k) => s + k.memberIds.length - k.done.length, 0);
  const lastScore = id => { const r = S.D.reviews.filter(x => x.empId === id).sort((a,b) => b.submittedAt.localeCompare(a.submittedAt))[0]; return r ? Number(r.overall).toFixed(1) : "—"; };
  const actions = `${tasks.length ? `<button class="btn" type="button" data-act="go" data-v="reviews">${ic("star")}Write reviews</button>` : ""}<button class="btn pri" type="button" data-act="go" data-v="approvals">${ic("check")}Approvals${pendingFor(m.id).length?` · ${pendingFor(m.id).length}`:""}</button>`;
  const kpis = `<div class="grid kpis k4">${kpi("Team members", team.length, `${team.filter(e => e.status === "Probation").length} on probation`)}
    ${kpi("Average tenure", yrsMo(team.length ? team.reduce((s,e) => s + months(e.joinDate), 0)/team.length : 0), m.dept)}
    ${kpi("Reviews to write", pendRev, tasks.length ? `due ${fmt(tasks.map(k => k.due).sort()[0])}` : "No open tasks", pendRev ? "warn" : "")}
    ${kpi("Approvals waiting", pendingFor(m.id).length, "time off & WFH", pendingFor(m.id).length ? "warn" : "")}</div>`;
  const tbl = card("My team", "users", "c1", team.length ? `<div class="tw"><table class="t rt"><thead><tr><th>Member</th><th>Status</th><th>Contract</th><th>Tenure</th><th class="r">Last review</th></tr></thead><tbody>
      ${team.map(e => { const cs = contractState(e.contract); return `<tr class="click" data-act="open-emp" data-id="${e.id}"><td class="wide">${who(e.id, e.position)}</td><td data-l="Status"><span class="pill ${e.status==="Probation"?"p-info":"p-active"}">${esc(e.status)}</span></td>
        <td data-l="Contract"><span class="pill p-${cs.k}">${esc(e.contract?.type||"")} · ${esc(cs.t)}</span></td><td data-l="Tenure">${tenure(e.joinDate)}</td><td data-l="Last review" class="r num">${lastScore(e.id)}</td></tr>`; }).join("")}</tbody></table></div>`
    : `<div class="empty">No direct reports yet.</div>`);
  return dashHead(m, actions) + annWidget(2) + kpis + todayStrip(team) +
    `<div class="grid split">${tbl}${card("Needs attention", "alert", "c3", attentionList(attention(ids, m.id)))}</div>
     <div class="grid two">${card("Team celebrations", "users", "c6", eventsList(peopleEvents(30, team)), `<span class="tag">Next 30 days</span>`)}${card("Reminders", "clock", "c2", reminderList(remindersFor(m), 5))}</div>`;
}
function vDashEmp(m){
  const cs = contractState(m.contract), t = today(), a = balance(m.id, "annual"), sick = balance(m.id, "sick");
  const mine = S.D.requests.filter(r => r.empId === m.id).sort((x,y) => y.createdAt.localeCompare(x.createdAt));
  const rv = S.D.reviews.filter(r => r.empId === m.id).sort((x,y) => y.submittedAt.localeCompare(x.submittedAt))[0];
  const ym = t.slice(0,7), wfh = mine.filter(r => r.kind === "wfh" && r.start.slice(0,7) === ym && ["pending","approved"].includes(r.status)).reduce((s,r) => s + r.days, 0);
  const nextHol = (cfg().holidays||[]).filter(h => h.date >= t).sort((x,y) => x.date.localeCompare(y.date))[0];
  const emp1 = card("My employment", "user", "c1", `<div class="card-b kv">
      <div><span>Position</span>${esc(m.position)}</div><div><span>Department</span>${esc(m.dept)}</div><div><span>Supervisor</span>${m.supervisorId?esc(nm(m.supervisorId)):"—"}</div>
      <div><span>Employee ID</span>${esc(m.empNo)}</div><div><span>Joined</span>${fmt(m.joinDate)} · ${tenure(m.joinDate)}</div><div><span>Contract</span><span class="pill p-${cs.k}">${esc(m.contract?.type||"")} · ${esc(cs.t)}</span></div></div>`,
    `<button class="btn link" type="button" data-act="go" data-v="profile">Profile ${ic("right")}</button>`);
  const perf = card("Latest performance review", "star", "c4", rv ? `<div class="card-b row" style="gap:18px"><span class="big">${Number(rv.overall).toFixed(1)}</span><div style="flex:1;min-width:180px"><b style="font-weight:600">${esc(rv.period)}</b> · ${esc(rv.recommendation)}<p class="small muted">Reviewed by ${esc(nm(rv.reviewerId))} on ${fmt(rv.submittedAt.slice(0,10))}</p></div>
      <button class="btn sm" type="button" data-act="open-emp" data-id="${m.id}" data-tab="performance">Read review</button></div>` : `<div class="empty">No review yet. Your supervisor's reviews will appear here.</div>`);
  const time = card("Time off", "cal", "c5", `<div class="card-b kv"><div><span>Annual leave left</span><span class="num" style="font-size:1.3rem;font-weight:600">${a.avail}</span> / ${a.quota}</div><div><span>Sick leave used</span>${sick.used} day(s)</div><div><span>WFH this month</span>${wfh}${cfg().wfhMaxPerMonth?` / ${cfg().wfhMaxPerMonth}`:""} day(s)</div><div><span>Next holiday</span>${nextHol ? `${esc(nextHol.name)}, ${fmt(nextHol.date)}` : "—"}</div></div>
      ${mine.length ? `<div class="list">${mine.slice(0,3).map(r => `<button class="li res" type="button" data-act="open-req" data-id="${r.id}" style="border-top:1px solid var(--line)"><span class="grow">${esc(typeName(r))} · ${range(r.start,r.end)}</span>${statusPill(r)}</button>`).join("")}</div>` : ""}`,
    `<button class="btn link" type="button" data-act="go" data-v="apply">Request ${ic("right")}</button>`);
  return dashHead(m, `<button class="btn" type="button" data-act="go" data-v="directory">${ic("users")}Directory</button><button class="btn pri" type="button" data-act="go" data-v="apply">${ic("plus")}New request</button>`) + annWidget(3) +
    `<div class="grid split">${emp1}${card("Coming up for me", "clock", "c2", reminderList(remindersFor(m), 5))}</div>
     <div class="grid split">${perf}${time}</div>
     ${card("Company celebrations", "users", "c6", eventsList(peopleEvents(30, activeE())), `<span class="tag">Next 30 days</span>`)}`;
}
function taskMini(tasks){
  const open = tasks.filter(t => t.status === "open");
  if(!tasks.length) return `<div class="empty">No review tasks yet.</div>`;
  return `<div class="list">${(open.length?open:tasks).slice(0,4).map(t => `<div class="li"><div class="grow"><b style="font-weight:600;display:block">${esc(t.title)}</b><span class="small muted">${esc(nm(t.supervisorId))} · due ${fmt(t.due)}</span></div><span class="pill ${t.status==="done"?"p-approved":"p-pending"}">${t.done.length}/${t.memberIds.length}</span></div>`).join("")}</div>`;
}

/* ---------- apply ---------- */
function vApply(){
  const m = me(), kind = dv("apply","kind", S.prm.kind || "leave");
  const types = typesFor(m), type = dv("apply","type", types[0]?.[0]);
  const peers = E().filter(e => e.id !== m.id && e.status !== "Resigned");
  return `<div class="page-h"><div><h1>Apply Request</h1><p>Working days are counted automatically, excluding weekends and public holidays. The approval flow follows the rules set by HRD.</p></div></div>
  <div class="grid split">
    <form class="card" id="apply-form" data-draft="apply" data-submit="apply" novalidate>
      <div class="card-h"><div class="seg" role="group" aria-label="Request type">
        <button type="button" data-act="kind" data-v="leave" aria-pressed="${kind==="leave"}">${ic("cal")}Leave</button>
        <button type="button" data-act="kind" data-v="wfh" aria-pressed="${kind==="wfh"}">${ic("home")}Work From Home</button></div></div>
      <div class="card-b stack">
        ${kind === "leave" ? `<label class="f"><span>Leave type</span><select name="type">${types.map(([k,t]) => `<option value="${k}" ${type===k?"selected":""}>${esc(t.name)}</option>`).join("")}</select>
          <small>${leaveTypeHint(type)}</small></label>` : `<div class="note">${ic("home")}<div>WFH requests go to your direct supervisor only.${cfg().wfhMaxPerMonth?` Limit: ${cfg().wfhMaxPerMonth} WFH days per month.`:""}</div></div>`}
        <div class="fields">
          <label class="f"><span>Start date</span><input type="date" name="start" value="${esc(dv("apply","start",""))}"></label>
          <label class="f"><span>End date</span><input type="date" name="end" value="${esc(dv("apply","end",""))}"></label>
        </div>
        ${kind === "wfh" ? `<label class="f"><span>Work location</span><input type="text" name="location" placeholder="e.g. Home, Denpasar" value="${esc(dv("apply","location",""))}"></label>` : ""}
        ${kind === "leave" && LT()[type]?.doc ? `<label class="chk"><input type="checkbox" name="doc" ${dv("apply","doc",false)?"checked":""}><span>I have the supporting document (e.g. doctor's note, marriage or birth certificate) and will hand it to HRD.</span></label>` : ""}
                <label class="f"><span>Reason</span><textarea name="reason" placeholder="${kind==="wfh"?"e.g. Focus work on the Q4 report.":"e.g. Attending my sister's wedding in Surabaya."}">${esc(dv("apply","reason",""))}</textarea></label>
      </div>
      <div class="md-f"><button class="btn" type="button" data-act="apply-reset">Clear</button><button class="btn pri" type="submit">Submit ${kind==="wfh"?"WFH request":"leave request"}</button></div>
    </form>
    <aside class="card sticky" id="summary" aria-live="polite">${applySummary()}</aside>
  </div>`;
}
function leaveTypeHint(k){
  const t = LT()[k]; if(!t) return "";
  const b = balance(S.me, k), parts = [t.track ? `${b.avail} ${t.unit==="calendar"?"calendar":"working"} day(s) available on your profile` : "No quota limit", t.paid ? "paid" : "unpaid"];
  if(t.doc) parts.push("supporting document required");
  return parts.join(" · ");
}
function evalApply(){
  const m = me(), kind = dv("apply","kind", S.prm.kind || "leave"), types = typesFor(m);
  const type = kind === "wfh" ? "wfh" : dv("apply","type", types[0]?.[0]);
  const f = {kind, type, start:dv("apply","start",""), end:dv("apply","end",""), reason:dv("apply","reason",""), doc:dv("apply","doc",false), location:dv("apply","location","")};
  const t = kind === "leave" ? LT()[type] : null, unit = t?.unit || "work";
  const c = countDays(f.start, f.end, unit, m.office), steps = buildSteps(m, type), errs = [];
  const b = kind === "leave" ? balance(m.id, type, Number((f.start || today()).slice(0,4))) : null;
  if(!f.start || !f.end) errs.push("Choose a start and end date.");
  else {
    if(f.end < f.start) errs.push("End date must be on or after the start date.");
    if(f.start < today() && type !== "sick") errs.push("Start date is in the past. Only Sick Leave can be backdated.");
    if(f.end >= f.start && !c.days) errs.push("The selected dates contain no working days.");
    if(kind === "leave"){
      if(!b.unlimited && c.days > b.avail) errs.push(b.granted ? `Not enough ${t.name} quota: ${b.avail} day(s) available, ${c.days} requested.` : `You have no ${t.name} quota yet. HRD adds quota on your profile or at contract renewal.`);
      if(t?.doc && !f.doc && !(type === "sick" && c.days <= 1)) errs.push(`${t.name} requires a supporting document.`);
      if(f.start.slice(0,4) !== f.end.slice(0,4)) errs.push("Leave can't cross into a new year. Split it into two requests.");
    } else if(cfg().wfhMaxPerMonth){
      const ym = f.start.slice(0,7), used = S.D.requests.filter(r => r.empId === m.id && r.kind === "wfh" && ["pending","approved"].includes(r.status) && r.start.slice(0,7) === ym).reduce((s,r) => s + r.days, 0);
      if(used + c.days > cfg().wfhMaxPerMonth) errs.push(`WFH limit is ${cfg().wfhMaxPerMonth} days per month. You already have ${used} day(s) in ${MONL[Number(ym.slice(5))-1]}.`);
    }
    const clash = S.D.requests.find(r => r.empId === m.id && ["pending","approved"].includes(r.status) && overlap(r.start, r.end, f.start, f.end));
    if(clash) errs.push(`Overlaps with ${clash.no} (${typeName(clash)}, ${range(clash.start, clash.end)}).`);
  }
  if(!f.reason.trim()) errs.push("Add a short reason for your approver.");
  if(!steps.length) errs.push("No approver could be found. Ask HRD to set your supervisor.");
  return {f, t, c, steps, errs, b};
}
function applySummary(){
  const {f, t, c, steps, errs, b} = evalApply(), show = S.ui.applyTried;
  return `<div class="card-h"><h2>Summary</h2></div><div class="card-b stack">
    <div><span class="big">${c.days}</span> <span class="muted">${t?.unit==="calendar"?"calendar":"working"} day${c.days===1?"":"s"}</span>
      ${f.start && f.end && f.end >= f.start ? `<p class="muted small" style="margin-top:6px">${rangeL(f.start,f.end)}</p>` : ""}
      ${c.skipped.length ? `<p class="muted small">Not counted: ${c.skipped.map(esc).join(", ")}</p>` : ""}</div>
    ${b ? (b.unlimited ? `<div class="note">${ic("info")}<div>${esc(t.name)} has no quota limit${t.paid?"":" and is unpaid"}.</div></div>` :
      `<div class="note">${ic("info")}<div>${esc(t.name)} quota: <b class="num">${b.avail}</b> day(s) available → <b class="num">${b.avail - c.days}</b> after this request.</div></div>`) : ""}
    <div><h3 style="margin-bottom:12px">Approval flow · ${steps.length} step${steps.length===1?"":"s"}</h3>${chain({empId:S.me, steps, status:"pending", current:-1}, true)}</div>
    ${show && errs.length ? `<ul class="errs">${errs.map(e => `<li>${esc(e)}</li>`).join("")}</ul>` : ""}
  </div>`;
}
async function submitApply(){
  const {f, c, steps, errs} = evalApply();
  if(errs.length){ S.ui.applyTried = true; document.getElementById("summary").innerHTML = applySummary(); toast("Please fix the highlighted issues."); return; }
  if(S.preview && !S.preview.writable){ toast("Preview is read-only for people who have their own account."); return; }
  const pre = f.kind === "wfh" ? "WFH" : "LV", ym = f.start.slice(0,7).replace("-","/");
  const n = await nextNumber(pre, f.start.slice(0,4));
  const now = new Date().toISOString();
  const r = {id:uid("q"), no:`${pre}/${ym}/${n ? String(n).padStart(4,"0") : Date.now().toString(36).toUpperCase()}`, kind:f.kind, type:f.type, empId:S.me, start:f.start, end:f.end, days:c.days,
    reason:f.reason.trim(), doc:!!f.doc, location:f.location||"", status:"pending", current:0, steps, createdAt:now, updatedAt:now};
  const ok = await run(async () => {
    await store.put("requests", r);
    await notify(steps[0].approverId, `${typeName(r)} needs your approval`, `${nm(S.me)} · ${range(r.start,r.end)} · ${r.days} day(s)`, "approvals", r.id, "request_new",
      {subject:`${typeName(r)} request from ${nm(S.me)}`, heading:`${typeName(r)} request needs your approval`, intro:`${nm(S.me)} submitted a request and you're the ${steps.length > 1 ? "first of " + steps.length + " approvers" : "approver"}.`, rows:reqRows(r), quote:r.reason, cta:{label:"Review request", go:"approvals", ref:r.id}});
    audit("request_submitted", r.no, `${typeName(r)} ${r.start}..${r.end} for ${nm(r.empId)}`);
  }, `${r.no} sent to ${nm(steps[0].approverId)}.`);
  if(!ok) return;
  S.drafts.apply = {kind:f.kind}; S.ui.applyTried = false; go("myrequests");
}

/* ---------- my requests ---------- */
function vMyRequests(){
  const scope = S.prm.scope || "mine", st = S.ui.reqStatus || "all", m = me();
  const scopes = [["mine","My requests"]]; if(isLead()) scopes.push(["team","My team"]); if(isMgmt()) scopes.push(["all","Company"]);
  const ids = new Set(reports(m.id).map(e => e.id));
  let list = S.D.requests.filter(r => scope === "mine" ? r.empId === m.id : scope === "team" ? ids.has(r.empId) : true);
  const counts = {all:list.length}; ["pending","approved","rejected","cancelled"].forEach(k => counts[k] = list.filter(r => r.status === k).length);
  if(st !== "all") list = list.filter(r => r.status === st);
  list.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  return `<div class="page-h"><div><h1>${scope==="mine"?"My Requests":scope==="team"?"Team Requests":"All Requests"}</h1><p>Open a request to see every approval step and the notes left by approvers.</p></div>
    ${scopes.length > 1 ? `<div class="seg" role="group">${scopes.map(([k,l]) => `<button type="button" data-act="scope" data-v="${k}" aria-pressed="${scope===k}">${l}</button>`).join("")}</div>` : ""}</div>
  <section class="card"><div class="card-h"><div class="seg" role="group" aria-label="Status">${["all","pending","approved","rejected","cancelled"].map(k => `<button type="button" data-act="rstatus" data-v="${k}" aria-pressed="${st===k}">${k[0].toUpperCase()+k.slice(1)} <span class="muted">${counts[k]}</span></button>`).join("")}</div></div>
    ${reqTable(list, {noEmp: scope === "mine", empty:"Nothing matches this filter."})}</section>`;
}
function mReq(id){
  const r = S.D.requests.find(x => x.id === id); if(!r) return `<div class="md-b"><div class="empty">This request no longer exists.</div></div>`;
  const e = emp(r.empId), myTurn = r.status === "pending" && r.steps[r.current]?.approverId === S.me;
  const b = r.kind === "leave" ? balance(r.empId, r.type, Number(r.start.slice(0,4))) : null;
  return `<div class="md-h">${av(r.empId)}<h2>${esc(typeName(r))}<br><span class="small muted" style="font-family:var(--f-body);font-weight:500">${esc(r.no)} · ${esc(nm(r.empId))}</span></h2>${statusPill(r)}<button class="ib plain" type="button" data-act="close" aria-label="Close">${ic("x")}</button></div>
  <div class="md-b">
    <div class="kv">
      <div><span>Dates</span>${rangeL(r.start,r.end)}</div><div><span>Duration</span>${r.days} ${unitOf(r)==="calendar"?"calendar":"working"} day(s)</div>
      <div><span>Employee</span>${esc(e?.position||"")} · ${esc(e?.dept||"")}</div>
      ${r.kind==="wfh" ? `<div><span>Work location</span>${esc(r.location||"—")}</div>` : ""}
      ${b && !b.unlimited ? `<div><span>${esc(LT()[r.type]?.name)} balance</span>${b.avail} available · ${b.pend} pending</div>` : ""}
      ${r.kind==="leave" && LT()[r.type]?.doc ? `<div><span>Supporting document</span>${r.doc?"Provided":"Not provided"}</div>` : ""}
      <div style="grid-column:1/-1"><span>Reason</span>${esc(r.reason||"—")}</div>
    </div>
    <div><h3 style="margin-bottom:12px">Approval flow</h3>${chain(r)}</div>
    ${myTurn ? `<form class="stack" data-draft="dec-${r.id}" data-submit="noop"><label class="f"><span>Note to ${esc(first(r.empId))} <span class="muted" style="font-weight:400">(required when rejecting)</span></span><textarea name="note" id="note-${r.id}" placeholder="e.g. Approved — please finish the handover before you leave.">${esc(dv("dec-"+r.id,"note",""))}</textarea></label>
      ${S.ui["err-"+r.id] ? `<ul class="errs"><li>${esc(S.ui["err-"+r.id])}</li></ul>` : ""}</form>` : ""}
    ${isHR() && r.status === "pending" && (!emp(r.steps[r.current]?.approverId) || emp(r.steps[r.current]?.approverId)?.status === "Resigned") ? `<div class="note warn">${ic("alert")}<div>The current approver is no longer active. <button class="btn link" type="button" data-act="reassign" data-id="${r.id}">Reassign this step to me</button></div></div>` : ""}
    ${r.empId === S.me && r.status === "pending" && S.ui["cx-"+r.id] ? `<div class="note warn">${ic("alert")}<div>Cancel ${esc(r.no)}? Approvers won't be able to act on it anymore.</div></div>` : ""}
  </div>
  <div class="md-f">
    ${myTurn ? `<button class="btn bad" type="button" data-act="decide" data-id="${r.id}" data-v="0">Reject</button><button class="btn ok" type="button" data-act="decide" data-id="${r.id}" data-v="1">${r.current === r.steps.length-1 ? "Approve (final)" : `Approve & send to ${esc(first(r.steps[r.current+1].approverId))}`}</button>` :
      r.empId === S.me && r.status === "pending" ? (S.ui["cx-"+r.id] ? `<button class="btn" type="button" data-act="cx-no" data-id="${r.id}">Keep request</button><button class="btn bad" type="button" data-act="cx-yes" data-id="${r.id}">Yes, cancel it</button>` : `<button class="btn bad" type="button" data-act="cx" data-id="${r.id}">Cancel request</button>`) :
      `<button class="btn" type="button" data-act="close">Close</button>`}
  </div>`;
}
async function decide(id, approve){
  const r0 = S.D.requests.find(x => x.id === id); if(!r0) return;
  const r = clone(r0), s = r.steps[r.current];
  if(r.status !== "pending" || s?.approverId !== S.me){ toast("This request has already been handled."); return; }
  const note = (dv("dec-"+id,"note","") || "").trim();
  if(!approve && !note){ S.ui["err-"+id] = "Write the reason for rejecting so the employee knows what to change."; render(); document.getElementById("note-"+id)?.focus(); return; }
  const idx = r0.current, now = new Date().toISOString(); s.status = approve ? "approved" : "rejected"; s.note = note; s.at = now; r.updatedAt = now;
  let msg, n = [];
  const mine = {cta:{label:"View my request", go:"myrequests", ref:r.id}};
  if(!approve){ r.status = "rejected"; r.steps.forEach((x,i) => { if(i > r.current) x.status = "skipped"; }); msg = `${r.no} rejected.`;
    n.push([r.empId, `Your ${typeName(r)} was rejected`, `${nm(S.me)}: “${note}”`, "request_rejected",
      Object.assign({heading:`Your ${typeName(r)} request was not approved`, intro:`${nm(S.me)} rejected your request. Their note explains what to change — you can submit a new request any time.`, rows:reqRows(r), quote:note, tone:"bad"}, mine)]); }
  else if(r.current >= r.steps.length - 1){ r.status = "approved"; msg = `${r.no} fully approved.`;
    n.push([r.empId, `Your ${typeName(r)} is approved`, `${range(r.start,r.end)} · final approval by ${nm(S.me)}`, "request_approved",
      Object.assign({heading:`Your ${typeName(r)} is approved`, intro:`Good news — your request is fully approved${r.steps.length > 1 ? ` (all ${r.steps.length} steps)` : ""}. Final approval by ${nm(S.me)}.`, rows:reqRows(r), quote:note, tone:"ok"}, mine)]); }
  else { r.current++; const nx = r.steps[r.current].approverId; msg = `Approved. Sent to ${nm(nx)} (step ${r.current+1} of ${r.steps.length}).`;
    n.push([nx, `${typeName(r)} needs your approval`, `${nm(r.empId)} · ${range(r.start,r.end)} · step ${r.current+1} of ${r.steps.length}`, "request_next",
      {subject:`${typeName(r)} request from ${nm(r.empId)} — step ${r.current+1} of ${r.steps.length}`, heading:`${typeName(r)} request needs your approval`, intro:`${nm(S.me)} approved step ${r.current} and the request now waits for you (step ${r.current+1} of ${r.steps.length}).`, rows:reqRows(r), quote:r.reason, cta:{label:"Review request", go:"approvals", ref:r.id}}]);
    n.push([r.empId, `Step ${r.current} approved by ${nm(S.me)}`, `Your ${typeName(r)} moved to ${nm(nx)}`, "request_step",
      Object.assign({heading:`Step ${r.current} of ${r.steps.length} approved`, intro:`${nm(S.me)} approved your request. It now waits for ${nm(nx)}.`, rows:reqRows(r)}, mine)]); }
  delete S.drafts["dec-"+id]; delete S.ui["err-"+id];
  await run(async () => { await store.put("requests", r); await signDecision(r.id, idx, approve ? "a" : "r"); for(const [to,t,b,kd,ml] of n) await notify(to, t, b, to === r.empId ? "myrequests" : "approvals", r.id, kd, ml); audit(approve ? "request_approved" : "request_rejected", r.no, `step ${idx+1}${note ? " — " + note : ""}`); }, msg);
}
async function cancelReq(id){
  const r0 = S.D.requests.find(x => x.id === id); if(!r0 || r0.empId !== S.me || r0.status !== "pending") return;
  const r = clone(r0); r.status = "cancelled"; r.updatedAt = new Date().toISOString(); delete S.ui["cx-"+id];
  await run(async () => { await store.put("requests", r); await notify(r.steps[r.current].approverId, `${nm(S.me)} cancelled a request`, `${typeName(r)} · ${range(r.start,r.end)}`, "approvals", r.id, "request_cancelled",
    {heading:`${nm(S.me)} cancelled a ${typeName(r)} request`, intro:`The request that was waiting for your approval has been cancelled. No action is needed.`, rows:reqRows(r), tone:"warn", cta:{label:"Open approvals", go:"approvals", ref:""}}); audit("request_cancelled", r.no, ""); }, `${r.no} cancelled.`);
}

/* ---------- approvals ---------- */
function vApprovals(){
  const mine = pendingFor(S.me).sort((a,b) => a.start.localeCompare(b.start));
  const done = S.D.requests.filter(r => r.steps.some(s => s.approverId === S.me && ["approved","rejected"].includes(s.status))).sort((a,b) => (b.updatedAt||"").localeCompare(a.updatedAt||"")).slice(0,12);
  return `<div class="page-h"><div><h1>Pending Approvals</h1><p>Requests appear here when it's your turn in the approval flow. Approving sends the request to the next step automatically.</p></div></div>
  <div class="stack">${mine.length ? mine.map(r => { const e = emp(r.empId), b = r.kind === "leave" ? balance(r.empId, r.type, Number(r.start.slice(0,4))) : null;
    return `<section class="card"><div class="card-h">${who(r.empId, `${e?.position||""} · ${e?.dept||""}`)}<span style="flex:1"></span>${statusPill(r)}</div>
      <div class="card-b stack"><div class="kv"><div><span>Request</span>${r.kind==="wfh"?ic("home","muted")+" ":""}${esc(typeName(r))}</div><div><span>Dates</span>${rangeL(r.start,r.end)} · ${r.days} day(s)</div>
        ${b && !b.unlimited ? `<div><span>${esc(LT()[r.type]?.name)} left after this request</span>${b.avail} of ${b.quota} day(s)</div>` : `<div><span>Reference</span>${esc(r.no)}</div>`}
        <div style="grid-column:1/-1"><span>Reason</span>${esc(r.reason)}</div></div>
        ${chain(r)}
        <form class="stack" data-draft="dec-${r.id}" data-submit="noop"><label class="f"><span>Note <span class="muted" style="font-weight:400">(required when rejecting)</span></span><textarea name="note" id="note-${r.id}" placeholder="Optional when approving">${esc(dv("dec-"+r.id,"note",""))}</textarea></label>
        ${S.ui["err-"+r.id] ? `<ul class="errs"><li>${esc(S.ui["err-"+r.id])}</li></ul>` : ""}</form>
        <div class="row end"><button class="btn bad" type="button" data-act="decide" data-id="${r.id}" data-v="0">Reject</button><button class="btn ok" type="button" data-act="decide" data-id="${r.id}" data-v="1">${r.current === r.steps.length-1 ? "Approve (final)" : `Approve & send to ${esc(first(r.steps[r.current+1].approverId))}`}</button></div>
      </div></section>`; }).join("") : `<section class="card"><div class="empty"><b>You're all caught up</b>No requests are waiting for your decision.</div></section>`}
  <section class="card"><div class="card-h"><h2>Recently decided by you</h2></div>${reqTable(done, {empty:"Your past decisions will be listed here."})}</section></div>`;
}

/* ---------- calendar ---------- */
function vCalendar(){
  if(!S.ui.cal) S.ui.cal = today().slice(0,7);
  const [y,m] = S.ui.cal.split("-").map(Number), f = new Date(y, m-1, 1), start = new Date(f); start.setDate(1 - (f.getDay()+6)%7);
  const hol = holMap(), t = today(), dept = S.ui.calDept || "", kind = S.ui.calKind || "all", depts = [...new Set(E().map(e => e.dept))].sort();
  const reqs = S.D.requests.filter(r => ["approved","pending"].includes(r.status) && (!dept || emp(r.empId)?.dept === dept) && (kind === "all" || r.kind === kind));
  let cells = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => `<div class="dw">${d}</div>`).join(""); const d = new Date(start);
  for(let i = 0; i < 42; i++){ const s = iso(d), w = d.getDay(), inM = d.getMonth() === m-1;
    const on = reqs.filter(r => r.start <= s && r.end >= s && (unitOf(r) === "calendar" || (w !== 0 && w !== 6 && !holMap(emp(r.empId)?.office)[s])));
    cells += `<div class="d ${inM?"":"out"} ${w===0||w===6?"we":""} ${s===t?"today":""}"><span class="dn">${d.getDate()}</span>${hol[s]?`<span class="hol">${esc(hol[s])}</span>`:""}
      ${on.map(r => `<button type="button" class="chip ${r.status==="pending"?"pd":r.kind==="wfh"?"wf":"lv"}" data-act="open-req" data-id="${r.id}" title="${esc(nm(r.empId))} · ${esc(typeName(r))} · ${r.status}" style="border:0;text-align:left">${esc(first(r.empId))}</button>`).join("")}</div>`;
    d.setDate(d.getDate()+1); if(i >= 34 && d.getMonth() !== m-1 && (i+1) % 7 === 0) break; }
  const monthList = reqs.filter(r => overlap(r.start, r.end, `${S.ui.cal}-01`, `${S.ui.cal}-31`)).sort((a,b) => a.start.localeCompare(b.start));
  return `<div class="page-h"><div><h1>Team Calendar</h1><p>Blue is leave, green is work from home, dashed means still waiting for approval.</p></div>
    <div class="row"><select id="cal-dept" aria-label="Department"><option value="">All departments</option>${depts.map(x => `<option ${dept===x?"selected":""}>${esc(x)}</option>`).join("")}</select>
    <div class="seg"><button type="button" data-act="calk" data-v="all" aria-pressed="${kind==="all"}">All</button><button type="button" data-act="calk" data-v="leave" aria-pressed="${kind==="leave"}">Leave</button><button type="button" data-act="calk" data-v="wfh" aria-pressed="${kind==="wfh"}">WFH</button></div></div></div>
  <section class="card" style="overflow:hidden"><div class="card-h"><h2>${MONL[m-1]} ${y}</h2><div class="row" style="gap:6px"><button class="ib" type="button" data-act="calm" data-v="-1" aria-label="Previous month">${ic("left")}</button><button class="btn sm" type="button" data-act="calm" data-v="0">Today</button><button class="ib" type="button" data-act="calm" data-v="1" aria-label="Next month">${ic("right")}</button></div></div>
    <div class="cal">${cells}</div></section>
  <section class="card"><div class="card-h"><h2>This month</h2><span class="tag">${monthList.length}</span></div>${reqTable(monthList, {empty:"No leave or WFH in this month."})}</section>`;
}

/* ---------- directory ---------- */
function vDirectory(){
  const q = (S.ui.dq||"").toLowerCase(), dept = S.ui.ddept || "", off = S.ui.doff || "", m = me();
  let list = E().filter(e => (!dept || e.division === dept) && (!off || e.office === off) && (S.ui.dformer || e.status !== "Resigned") && (e.name+" "+e.position+" "+e.empNo).toLowerCase().includes(q));
  if(!isMgmt() && S.ui.dscope === "team") list = list.filter(e => e.supervisorId === m.id);
  list.sort((a,b) => (a.division||"").localeCompare(b.division||"") || a.name.localeCompare(b.name));
  const depts = cfg().divisions || [];
  return `<div class="page-h"><div><h1>Employees Directory</h1><p>${activeE().length} active employees across ${depts.length} divisions and ${(cfg().offices||[]).length} offices.${isHR()?" HRD can add employees here or hire them from Recruitment.":""}</p></div>
    ${isHR() ? `<div class="row"><button class="btn" type="button" data-act="emp-imp-open">${ic("upload")}Import from Excel</button><button class="btn pri" type="button" data-act="emp-new">${ic("plus")}Add employee</button></div>` : ""}</div>
  ${isHR() && S.ui.empImpOpen ? importPanel() : ""}
  ${isHR() && S.canEdit && linkRequests() ? `<section class="card"><div class="card-h"><span class="tile c1" style="width:38px;height:38px">${ic("user")}</span><h2>Account connect requests</h2></div><div class="card-b" style="padding-top:4px">${linkRequests()}<p class="small muted" style="margin-top:8px">Approve only when the email belongs to that employee. Once connected, every action in the app is tied to their own account.</p></div></section>` : ""}
  <section class="card"><div class="card-h"><div class="row" style="flex:1"><input type="search" id="dq" placeholder="Search name, position or ID" value="${esc(S.ui.dq||"")}" style="max-width:320px">
    <select id="doff" style="max-width:200px" aria-label="Office"><option value="">All offices</option>${(cfg().offices||[]).map(x => `<option ${off===x?"selected":""}>${esc(x)}</option>`).join("")}</select>
    <select id="ddept" style="max-width:240px" aria-label="Division"><option value="">All divisions</option>${depts.map(x => `<option ${dept===x?"selected":""}>${esc(x)}</option>`).join("")}</select>
    <label class="chk"><input type="checkbox" id="dformer" ${S.ui.dformer?"checked":""}><span>Show former employees</span></label></div></div>
    <div class="tw"><table class="t rt"><thead><tr><th>Employee</th><th>ID</th><th>Division</th><th>Office</th><th>Supervisor</th><th>Status</th>${isMgmt()?"<th>Contract</th>":""}<th class="r"></th></tr></thead><tbody>
    ${list.map(e => { const cs = contractState(e.contract); return `<tr class="click" data-act="open-emp" data-id="${e.id}"><td class="wide">${who(e.id, `${e.position} · ${e.dept}`)}</td><td data-l="ID">${esc(e.empNo)}</td><td data-l="Division">${esc(e.division||"—")}</td><td data-l="Office">${esc(e.office||"—")}</td>
      <td data-l="Supervisor">${e.supervisorId?esc(nm(e.supervisorId)):"—"}</td><td data-l="Status"><span class="pill ${e.status==="Resigned"?"p-cancelled":e.status==="Probation"?"p-info":"p-active"}">${esc(e.status)}</span></td>
      ${isMgmt()?`<td data-l="Contract"><span class="pill p-${cs.k}">${esc(e.contract?.type||"")} · ${esc(cs.t)}</span></td>`:""}<td class="r"><button class="btn link" type="button" data-act="open-emp" data-id="${e.id}">Profile</button></td></tr>`; }).join("") || `<tr><td colspan="7"><div class="empty">No employees match.</div></td></tr>`}
    </tbody></table></div></section>`;
}

/* ---------- profile ---------- */
function vProfile(){
  const id = S.prm.id || S.me, e = emp(id); if(!e) return `<div class="card empty">Employee not found.</div>`;
  const priv = canSeePrivate(id), tab = S.ui.ptab || "overview", self = id === S.me;
  const tabs = [["overview","Overview"],["contract","Contract"],["history","History & Notes"],["leave","Leave & Quota"],["attendance","Attendance"],["performance","Performance"]].filter(([k]) => k === "overview" || priv);
  if(!tabs.some(t => t[0] === tab)) S.ui.ptab = "overview";
  const cs = contractState(e.contract), sup = e.supervisorId;
  const body = {overview:pOverview, contract:pContract, history:pHistory, leave:pLeave, attendance:pAttendance, performance:pPerformance}[S.ui.ptab||"overview"](e);
  return `${!self ? `<div><button class="btn link" type="button" data-act="go" data-v="directory">${ic("left")}Employees Directory</button></div>` : ""}
  <section class="card"><div class="card-b row" style="gap:20px;align-items:center"><div class="avwrap">${av(e.id,"lg")}${canEditPhoto(e.id) ? `<label class="avbtn" title="Change photo"><input type="file" accept="image/*" data-photo="${e.id}" aria-label="Change profile photo">${ic("edit")}</label>` : ""}
      ${canEditPhoto(e.id) && e.photo ? `<button class="btn link small" type="button" data-act="photo-del" data-id="${e.id}" style="display:block;margin:6px auto 0">Remove</button>` : ""}</div>
    <div style="flex:1;min-width:220px"><h1>${esc(e.name)}</h1><p class="muted">${esc(e.position)} · ${esc(e.division || e.dept)}${e.office ? ` · ${ic("pinmap","inline")} ${esc(e.office)}` : ""}</p>
      <div class="row" style="gap:8px;margin-top:10px"><span class="tag">${esc(e.empNo)}</span><span class="pill ${e.status==="Probation"?"p-info":e.status==="Resigned"?"p-cancelled":"p-active"}">${esc(e.status)}</span><span class="tag">${esc(jobOf(e))}</span>${e.role==="hrd"?`<span class="tag">HRD admin</span>`:""}${priv?`<span class="pill p-${cs.k}">${esc(e.contract?.type||"")} · ${esc(cs.t)}</span>`:""}</div></div>
    <div class="row">${isHR() ? `<button class="btn" type="button" data-act="emp-edit" data-id="${e.id}">${ic("edit")}Edit</button>` : ""}
      ${isHR() && !self ? `<button class="btn pri" type="button" data-act="task-new" data-emp="${e.id}">${ic("star")}Request review</button>` : ""}</div></div>
    <div class="tabs" role="tablist" style="padding:0 14px">${tabs.map(([k,l]) => `<button type="button" role="tab" data-act="ptab" data-v="${k}" aria-selected="${(S.ui.ptab||"overview")===k}">${l}</button>`).join("")}</div></section>
  ${!priv ? `<div class="note">${ic("info")}<div>Contract, notes, leave and performance details are only visible to ${esc(first(id))}, their supervisor, HRD and the General Manager.</div></div>` : ""}
  ${body}`;
}
function pOverview(e){
  const priv = canSeePrivate(e.id);
  return `<div class="grid two"><section class="card"><div class="card-h"><h2>Employment</h2></div><div class="card-b kv">
    <div><span>Employee ID</span>${esc(e.empNo)}</div><div><span>Position</span>${esc(e.position)}</div><div><span>Department</span>${esc(e.dept)}</div>
    <div><span>Direct supervisor</span>${e.supervisorId?`<button class="btn link" type="button" data-act="open-emp" data-id="${e.supervisorId}">${esc(nm(e.supervisorId))}</button>`:"—"}</div>
    <div><span>Join date</span>${fmt(e.joinDate)}</div><div><span>Length of service</span>${tenure(e.joinDate)}</div>
    <div><span>Division</span>${esc(e.division||"—")}</div><div><span>Office</span>${esc(e.office||"—")}</div>
    <div><span>Job level</span>${esc(jobOf(e))}${e.role==="hrd"?" · HRD admin":""}</div><div><span>Team size</span>${reports(e.id).length} direct report(s)</div></div></section>
  <section class="card"><div class="card-h"><h2>Contact</h2></div><div class="card-b kv">
    <div><span>Email</span>${esc(e.email||"—")}</div><div><span>Phone</span>${esc(e.phone||"—")}</div>
    ${priv?`<div><span>Gender</span>${e.gender==="F"?"Female":e.gender==="M"?"Male":"—"}</div><div><span>Date of birth</span>${fmt(e.birthDate)}</div>`:""}
    ${e.status==="Resigned"?`<div><span>Last working day</span>${fmt(e.exitDate)}</div>${priv?`<div><span>Exit reason</span>${esc(e.exitReason||"—")}</div>`:""}`:""}</div></section></div>
  ${reports(e.id).length ? `<section class="card"><div class="card-h"><h2>Team</h2></div><div class="list">${reports(e.id).map(x => `<button class="li res" type="button" data-act="open-emp" data-id="${x.id}" style="border-top:1px solid var(--line)">${who(x.id, x.position)}</button>`).join("")}</div></section>` : ""}`;
}
function pContract(e){
  const cs = contractState(e.contract), c = e.contract || {};
  const hist = [...(e.contracts||[])].sort((a,b) => (b.start||"").localeCompare(a.start||""));
  const rems = S.D.reminders.filter(r => r.empId === e.id && !r.done).concat(autoReminders().filter(r => r.empId === e.id));
  return `<div class="grid split"><section class="card"><div class="card-h"><h2>Current contract</h2><span class="pill p-${cs.k}">${esc(cs.t)}</span>
      ${isHR() ? `<button class="btn sm" type="button" data-act="contract-new" data-id="${e.id}">${ic("plus")}New / renew</button>` : ""}</div>
    <div class="card-b kv"><div><span>Type</span>${esc(c.type||"—")}</div><div><span>Contract no.</span>${esc(c.no||"—")}</div><div><span>Start</span>${fmt(c.start)}</div><div><span>End</span>${c.end?fmt(c.end):"Permanent (PKWTT)"}</div>
      ${c.end ? `<div><span>Remaining</span>${cs.d >= 0 ? `${cs.d} days` : "Expired"}</div>` : ""}</div>
    <div class="card-h" style="border-top:1px solid var(--line)"><h2>Contract history</h2></div>
    <div class="tw"><table class="t rt"><thead><tr><th>Type</th><th>No.</th><th>Start</th><th>End</th></tr></thead><tbody>${hist.map(h => `<tr><td data-l="Type"><b style="font-weight:600">${esc(h.type)}</b></td><td data-l="No.">${esc(h.no||"—")}</td><td data-l="Start">${fmt(h.start)}</td><td data-l="End">${h.end?fmt(h.end):"—"}</td></tr>`).join("")}</tbody></table></div></section>
  <section class="card"><div class="card-h"><h2>Reminders</h2>${isHR()?`<button class="btn sm" type="button" data-act="rem-new" data-emp="${e.id}">${ic("plus")}Add</button>`:""}</div>${reminderList(rems)}</section></div>`;
}
function pHistory(e){
  const canAdd = isHR() || e.supervisorId === S.me;
  const notes = [...(e.notes||[])].sort((a,b) => b.date.localeCompare(a.date));
  const fk = "note-"+e.id;
  return `<div class="grid split"><section class="card"><div class="card-h"><h2>Timeline</h2><span class="tag">${notes.length} entries</span></div>
    ${notes.length ? `<ul class="tl">${notes.map(n => `<li class="k-${esc(n.kind)}"><div class="meta"><span class="tag">${esc(n.kind)}</span><span>${fmt(n.date)}</span><span>by ${esc(nm(n.by))}</span></div><p>${esc(n.text)}</p></li>`).join("")}</ul>`
      : `<div class="empty"><b>No history yet</b>Training notes, achievements and HR sessions will be recorded here.</div>`}</section>
  ${canAdd ? `<form class="card sticky" data-draft="${fk}" data-submit="note" data-id="${e.id}"><div class="card-h"><h2>Add entry</h2></div><div class="card-b stack">
    <div class="fields"><label class="f"><span>Category</span><select name="kind">${NOTE_KINDS.map(k => `<option ${dv(fk,"kind","Training")===k?"selected":""}>${k}</option>`).join("")}</select></label>
      <label class="f"><span>Date</span><input type="date" name="date" value="${esc(dv(fk,"date",today()))}"></label></div>
    <label class="f"><span>Note</span><textarea name="text" placeholder="e.g. Completed customer service training, score 90/100.">${esc(dv(fk,"text",""))}</textarea><small>Visible to ${esc(first(e.id))}, their supervisor, HRD and the General Manager.</small></label>
    <div class="row end"><button class="btn pri" type="submit">Save entry</button></div></div></form>` : ""}</div>`;
}
function pLeave(e){
  const list = S.D.requests.filter(r => r.empId === e.id).sort((a,b) => b.start.localeCompare(a.start));
  const types = typesFor(e), log = [...(e.quotaLog||[])].sort((a,b) => b.date.localeCompare(a.date) || 0), hr = isHR();
  return `<section class="card"><div class="card-h"><span class="tile c1" style="width:38px;height:38px">${ic("chart")}</span><h2>Leave quota</h2>
      ${hr ? `<button class="btn sm pri" type="button" data-act="quota-adj" data-id="${e.id}">${ic("edit")}Adjust quota</button>` : `<span class="tag">Managed by HRD · view only</span>`}</div>
    <div class="tw"><table class="t rt"><thead><tr><th>Leave type</th><th class="r">Granted</th><th class="r">Used</th><th class="r">Pending</th><th class="r">Available</th>${hr?"<th></th>":""}</tr></thead><tbody>
      ${types.map(([k,t]) => { const b = balance(e.id, k); return `<tr><td class="wide"><b style="font-weight:600">${esc(t.name)}</b>${t.track?"":` <span class="tag">No limit</span>`}</td>
        <td data-l="Granted" class="r num">${t.track?b.granted:"—"}</td><td data-l="Used" class="r num">${b.used}</td><td data-l="Pending" class="r num">${b.pend}</td>
        <td data-l="Available" class="r num"><b style="font-size:1.05rem;${t.track && b.avail<=0?"color:var(--bad)":""}">${t.track?b.avail:"∞"}</b></td>
        ${hr?`<td class="r">${t.track?`<button class="btn link" type="button" data-act="quota-adj" data-id="${e.id}" data-v="${k}">Adjust</button>`:""}</td>`:""}</tr>`; }).join("")}
    </tbody></table></div></section>
  <div class="grid split"><section class="card"><div class="card-h"><h2>Quota history</h2><span class="tag">${log.length}</span></div>
    ${log.length ? `<div class="tw"><table class="t rt"><thead><tr><th>Date</th><th>Leave type</th><th class="r">Change</th><th>Reason</th><th>By</th></tr></thead><tbody>${log.map(x => `<tr>
      <td data-l="Date">${fmt(x.date)}</td><td data-l="Type">${esc(LT()[x.type]?.name||x.type)}</td><td data-l="Change" class="r num"><b class="${x.delta<0?"down":"up"}">${x.delta>0?"+":""}${x.delta}</b></td>
      <td data-l="Reason" class="wide" style="white-space:normal">${esc(x.reason)}</td><td data-l="By">${esc(x.by ? nm(x.by) : "System")}</td></tr>`).join("")}</tbody></table></div>`
      : `<div class="empty"><b>No quota granted yet</b>${hr ? "Use “Adjust quota”, or quota is added automatically when a contract is created or renewed." : "HRD will add your leave quota."}</div>`}</section>
  <section class="card"><div class="card-h"><h2>Requests</h2></div>${reqTable(list, {noEmp:true, empty:"No leave or WFH requests yet."})}</section></div>`;
}
function mQuota(){
  const e = emp(S.modal.id), k = "qa-"+e.id, types = typesFor(e).filter(([x,t]) => t.track), type = dv(k,"type", S.modal.type || types[0]?.[0]);
  const b = balance(e.id, type), mode = dv(k,"mode","add"), amt = Number(dv(k,"amount","")) || 0;
  const delta = mode === "add" ? amt : mode === "deduct" ? -amt : amt - b.avail;
  return `<form data-draft="${k}" data-submit="quota" novalidate><div class="md-h">${av(e.id)}<h2>Adjust leave quota<br><span class="small muted" style="font-family:var(--f-body);font-weight:500">${esc(e.name)} · ${esc(e.empNo)}</span></h2><button class="ib plain" type="button" data-act="close" aria-label="Close">${ic("x")}</button></div>
  <div class="md-b"><div class="fields">
    <label class="f"><span>Leave type</span><select name="type">${types.map(([x,t]) => `<option value="${x}" ${type===x?"selected":""}>${esc(t.name)}</option>`).join("")}</select></label>
    <label class="f"><span>Action</span><select name="mode"><option value="add" ${mode==="add"?"selected":""}>Add days</option><option value="deduct" ${mode==="deduct"?"selected":""}>Deduct days</option><option value="set" ${mode==="set"?"selected":""}>Set available to</option></select></label>
    <label class="f"><span>Days</span><input type="number" name="amount" min="0" max="365" step="0.5" value="${esc(dv(k,"amount",""))}"></label>
    <label class="f full"><span>Reason</span><input type="text" name="reason" value="${esc(dv(k,"reason",""))}" placeholder="e.g. Carry-over from 2025, correction, compensation day"></label></div>
    <div class="note">${ic("info")}<div>Now: <b class="num">${b.avail}</b> available (${b.granted} granted, ${b.used} used, ${b.pend} pending). After saving: <b class="num">${b.avail + delta}</b> available${delta?` (${delta>0?"+":""}${delta})`:""}.</div></div>
    ${S.ui.qErr ? `<ul class="errs"><li>${esc(S.ui.qErr)}</li></ul>` : ""}</div>
  <div class="md-f"><button class="btn" type="button" data-act="close">Cancel</button><button class="btn pri" type="submit">Save adjustment</button></div></form>`;
}
async function saveQuota(){
  if(staleRev(S.modal.id)) return;
  const e0 = emp(S.modal.id), k = "qa-"+e0.id, types = typesFor(e0).filter(([x,t]) => t.track), type = dv(k,"type", S.modal.type || types[0]?.[0]);
  const b = balance(e0.id, type), mode = dv(k,"mode","add"), amt = Number(dv(k,"amount","")), reason = (dv(k,"reason","")||"").trim();
  if(!(amt >= 0) || dv(k,"amount","") === ""){ S.ui.qErr = "Enter the number of days."; renderModal(); return; }
  if(!reason){ S.ui.qErr = "Write a reason so the change is traceable."; renderModal(); return; }
  const delta = mode === "add" ? amt : mode === "deduct" ? -amt : amt - b.avail;
  if(!delta){ S.ui.qErr = "This doesn't change the balance."; renderModal(); return; }
  const e = clone(e0); e.quotaLog = (e.quotaLog||[]).concat([{id:uid("g"), date:today(), type, delta, reason, by:S.me}]);
  S.ui.qErr = ""; S.modal = null; delete S.drafts[k];
  await run(async () => { await store.put("employees", e); audit("quota_adjusted", `${e.empNo} ${e.name}`, `${LT()[type].name} ${delta>0?"+":""}${delta} — ${reason}`); await notify(e.id, `Your ${LT()[type].name} quota changed (${delta>0?"+":""}${delta})`, `${reason} · by ${nm(S.me)}`, "profile", e.id, "quota",
    {heading:`Your ${LT()[type].name} balance was updated`, intro:`HR adjusted your leave quota.`, rows:[["Leave type", LT()[type].name], ["Change", `${delta>0?"+":""}${delta} day(s)`], ["Available now", `${balance(e.id, type).avail} day(s)`], ["Reason", reason], ["By", nm(S.me)]], cta:{label:"See my leave balance", go:"profile", ref:e.id}}); }, `${LT()[type].name} quota updated for ${e.name}.`);
}
function pPerformance(e){
  const list = S.D.reviews.filter(r => r.empId === e.id).sort((a,b) => b.submittedAt.localeCompare(a.submittedAt));
  const open = S.D.tasks.filter(t => t.status === "open" && t.memberIds.includes(e.id) && !t.done.includes(e.id));
  return `<div class="note">${ic("info")}<div>Performance reviews are private: visible only to ${esc(first(e.id))}, their supervisor, HRD and the General Manager.</div></div>
  ${open.map(t => `<div class="note warn">${ic("clock")}<div><b>${esc(t.title)}</b> is in progress with ${esc(nm(t.supervisorId))}, due ${fmt(t.due)}.${t.supervisorId === S.me ? ` <button class="btn link" type="button" data-act="review-open" data-task="${t.id}" data-emp="${e.id}">Write it now</button>` : ""}</div></div>`).join("")}
  ${list.length ? list.map(rv => reviewCard(rv)).join("") : `<section class="card"><div class="empty"><b>No reviews yet</b>Completed reviews from the supervisor will appear here.</div></section>`}`;
}
function reviewCard(rv){
  const crit = Object.entries(rv.scores||{});
  return `<section class="card"><div class="card-h"><span class="tile c4" style="width:40px;height:40px">${ic("star")}</span><h2>${esc(rv.period)} review<br><span class="small muted" style="font-family:var(--f-body);font-weight:500">by ${esc(nm(rv.reviewerId))} · ${fmt(rv.submittedAt.slice(0,10))}</span></h2>
    <div style="text-align:right"><div class="big" style="font-size:2rem">${Number(rv.overall).toFixed(1)}</div><span class="small muted">out of 5</span></div></div>
    <div class="card-b grid two"><div class="bars">${crit.map(([k,v]) => `<div><span>${esc(k)}</span><i><b style="width:${v/5*100}%"></b></i><span class="num">${v}</span></div>`).join("")}</div>
      <div class="kv" style="grid-template-columns:1fr"><div><span>Recommendation</span><span class="pill p-info">${esc(rv.recommendation)}</span></div><div><span>Strengths</span>${esc(rv.strengths||"—")}</div><div><span>Areas to improve</span>${esc(rv.improvements||"—")}</div><div><span>Goals for next period</span>${esc(rv.goals||"—")}</div></div></div></section>`;
}

/* ---------- reviews ---------- */
function vReviews(){
  const m = me(), mine = S.D.tasks.filter(t => t.supervisorId === m.id).sort((a,b) => (a.status==="open"?0:1)-(b.status==="open"?0:1) || a.due.localeCompare(b.due));
  const all = [...S.D.tasks].sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const taskRow = (t, manage) => `<section class="card"><div class="card-h"><span class="tile c4" style="width:40px;height:40px">${ic("star")}</span><h2>${esc(t.title)}<br><span class="small muted" style="font-family:var(--f-body);font-weight:500">${esc(t.period)} · ${manage?`Supervisor ${esc(nm(t.supervisorId))} · `:`Assigned by ${esc(nm(t.createdBy))} · `}due ${fmt(t.due)}</span></h2>
      <span class="pill ${t.status==="done"?"p-approved":diffDays(today(),t.due)<0?"p-rejected":"p-pending"}">${t.status==="done"?"Completed":diffDays(today(),t.due)<0?"Overdue":"Open"} · ${t.done.length}/${t.memberIds.length}</span>
      ${manage ? `<span class="tag" title="Email notification">${ic("mail")} ${t.email==="sent"?"Email sent":t.email==="failed"?"Email failed":"In-app only"}</span>` : ""}</div>
    ${t.message ? `<div class="card-b" style="padding-bottom:0"><p class="muted">“${esc(t.message)}”</p></div>` : ""}
    <div class="list" style="margin-top:8px">${t.memberIds.map(id => { const done = t.done.includes(id), rv = S.D.reviews.find(r => r.taskId === t.id && r.empId === id);
      if(!done && pendingReview(t.id, id)) return `<div class="li">${who(id, emp(id)?.position)}<span class="grow"></span><span class="pill p-info">Submitted · HR processing</span></div>`;
      return `<div class="li">${who(id, emp(id)?.position)}<span class="grow"></span>${done ? `<span class="pill p-approved">Submitted${rv?` · ${Number(rv.overall).toFixed(1)}`:""}</span>${canSeePrivate(id)?`<button class="btn sm" type="button" data-act="open-emp" data-id="${id}" data-tab="performance">View</button>`:""}` :
        t.supervisorId === S.me ? `<button class="btn sm pri" type="button" data-act="review-open" data-task="${t.id}" data-emp="${id}">Write review</button>` : `<span class="pill p-pending">Waiting</span>`}</div>`; }).join("")}</div></section>`;
  return `<div class="page-h"><div><h1>Performance Reviews</h1><p>${isHR() ? "Assign review tasks to supervisors. They get an in-app notification and an email, and the finished review is saved to the employee's profile." : "Review tasks assigned to you by HRD. Finished reviews are saved privately to each team member's profile."}</p></div>
    ${isHR() ? `<button class="btn pri" type="button" data-act="task-new">${ic("plus")}Assign review task</button>` : ""}</div>
  ${mine.length ? `<h2>Assigned to me</h2>${mine.map(t => taskRow(t, false)).join("")}` : (!isMgmt() ? `<section class="card"><div class="empty"><b>No review tasks</b>HRD will assign performance reviews for your team here.</div></section>` : "")}
  ${isMgmt() ? `<h2>All review tasks</h2>${all.length ? all.map(t => taskRow(t, true)).join("") : `<section class="card"><div class="empty"><b>No review tasks yet</b>Assign the first one to a supervisor.</div></section>`}` : ""}`;
}
function mTask(){
  const k = "task", sups = E().filter(e => reports(e.id).length && e.status !== "Resigned");
  const pre = S.modal.emp ? emp(S.modal.emp) : null;
  const sid = dv(k,"supervisorId", pre?.supervisorId || sups[0]?.id || ""), team = reports(sid);
  const members = dv(k,"members", pre ? [pre.id] : team.map(e => e.id)).filter(id => team.some(x => x.id === id));
  const s = emp(sid);
  return `<form data-draft="${k}" data-submit="task" novalidate><div class="md-h"><span class="tile c4">${ic("star")}</span><h2>Assign review task</h2><button class="ib plain" type="button" data-act="close" aria-label="Close">${ic("x")}</button></div>
  <div class="md-b"><div class="fields">
    <label class="f full"><span>Title</span><input type="text" name="title" value="${esc(dv(k,"title", pre ? `Probation review — ${pre.name}` : `Q4 ${new Date().getFullYear()} performance review`))}"></label>
    <label class="f"><span>Review type</span><select name="kind">${["Quarterly","Probation","Annual","Contract renewal"].map(x => `<option ${dv(k,"kind",pre?.status==="Probation"?"Probation":"Quarterly")===x?"selected":""}>${x}</option>`).join("")}</select></label>
    <label class="f"><span>Period</span><input type="text" name="period" value="${esc(dv(k,"period", pre?.status==="Probation" ? `Probation ${new Date().getFullYear()}` : `Q4 ${new Date().getFullYear()}`))}"></label>
    <label class="f"><span>Supervisor (reviewer)</span><select name="supervisorId" data-rerender="1">${sups.map(e => `<option value="${e.id}" ${sid===e.id?"selected":""}>${esc(e.name)} — ${esc(e.dept)}</option>`).join("")}</select></label>
    <label class="f"><span>Due date</span><input type="date" name="due" value="${esc(dv(k,"due",addDays(today(),14)))}"></label></div>
    <fieldset class="f" style="border:0;padding:0;margin:0"><legend style="font-size:.8rem;font-weight:600;color:var(--ink2);margin-bottom:6px">Team members to review</legend>
      <div class="stack" style="gap:8px">${team.length ? team.map(e => `<label class="chk"><input type="checkbox" name="members" data-multi="1" value="${e.id}" ${members.includes(e.id)?"checked":""}><span>${esc(e.name)} <span class="muted">· ${esc(e.position)}${e.status==="Probation"?" · probation":""}</span></span></label>`).join("") : `<span class="muted">This supervisor has no direct reports.</span>`}</div></fieldset>
    <label class="f"><span>Message to supervisor</span><textarea name="message" placeholder="e.g. Please focus on goals for next quarter.">${esc(dv(k,"message",""))}</textarea></label>
    <label class="chk"><input type="checkbox" name="email" ${dv(k,"email", !!cfg().email?.onTask)?"checked":""}><span>Also email ${esc(s?.name||"the supervisor")} at <b>${esc(s?.email||"no email on file")}</b>. Sent from your connected Gmail.</span></label>
    ${S.ui.taskErr ? `<ul class="errs"><li>${esc(S.ui.taskErr)}</li></ul>` : ""}
  </div><div class="md-f"><button class="btn" type="button" data-act="close">Cancel</button><button class="btn pri" type="submit">${ic("star")}Assign task</button></div></form>`;
}
async function saveTask(){
  const k = "task", sups = E().filter(e => reports(e.id).length);
  const pre = S.modal.emp ? emp(S.modal.emp) : null, sid = dv(k,"supervisorId", pre?.supervisorId || sups[0]?.id), team = reports(sid);
  const members = dv(k,"members", pre ? [pre.id] : team.map(e => e.id)).filter(id => team.some(x => x.id === id));
  const t = {id:uid("t"), title:(dv(k,"title", pre ? `Probation review — ${pre.name}` : `Q4 ${new Date().getFullYear()} performance review`)||"").trim(),
    kind:dv(k,"kind", pre?.status==="Probation"?"Probation":"Quarterly"), period:(dv(k,"period", pre?.status==="Probation" ? `Probation ${new Date().getFullYear()}` : `Q4 ${new Date().getFullYear()}`)||"").trim(),
    supervisorId:sid, memberIds:members, done:[], due:dv(k,"due",addDays(today(),14)), message:(dv(k,"message","")||"").trim(), createdBy:S.me, createdAt:new Date().toISOString(), status:"open", email:"none"};
  if(!t.title || !t.period || !t.due){ S.ui.taskErr = "Fill in the title, period and due date."; render(); return; }
  if(!members.length){ S.ui.taskErr = "Select at least one team member to review."; render(); return; }
  const wantEmail = dv(k,"email", !!cfg().email?.onTask), s = emp(sid);
  S.ui.taskErr = ""; S.modal = null; delete S.drafts[k];
  const ok = await run(async () => { await store.put("tasks", t); audit("review_task_assigned", t.title, nm(sid)); await notify(sid, `New review task: ${t.title}`, `Assigned by ${nm(S.me)} · ${members.length} member(s) · due ${fmt(t.due)}`, "reviews", t.id, "review_task"); }, wantEmail ? "Task assigned. Sending email…" : `Task assigned to ${nm(sid)}.`);
  if(!ok || !wantEmail) return;
  const res = await sendRich(s, {subject:`Performance review task: ${t.title}`, heading:"You have a performance review to complete",
    intro:`${nm(S.me)} (HRD) assigned you a performance review. Please score each team member and add your feedback before the due date.`,
    rows:[["Task", t.title], ["Period", t.period], ["Team members", members.map(nm).join(", ")], ["Due date", fmt(t.due)]], quote:t.message || "", tone:"info",
    cta:{label:"Start the review", go:"reviews", ref:t.id}});
  const t2 = Object.assign(clone(t), {email: res.ok ? "sent" : "failed"});
  await run(() => store.put("tasks", t2), res.ok ? `Email sent to ${s.email}.` : `Task saved, but the email wasn't sent: ${res.reason}`);
}
function mReview(){
  const t = S.D.tasks.find(x => x.id === S.modal.task), e = emp(S.modal.emp); if(!t || !e) return `<div class="md-b">Task not found.</div>`;
  const k = `rv-${t.id}-${e.id}`, crit = cfg().criteria || [];
  const scores = crit.map(c => Number(dv(k, "s:"+c, 0))), filled = scores.filter(Boolean), avg = filled.length ? filled.reduce((a,b)=>a+b,0)/filled.length : 0;
  const recs = e.status === "Probation" || t.kind === "Probation" ? RECS : RECS.slice(0,3);
  return `<form data-draft="${k}" data-submit="review" novalidate><div class="md-h">${av(e.id)}<h2>${esc(e.name)}<br><span class="small muted" style="font-family:var(--f-body);font-weight:500">${esc(t.title)} · ${esc(t.period)}</span></h2><button class="ib plain" type="button" data-act="close" aria-label="Close">${ic("x")}</button></div>
  <div class="md-b">
    <div class="note">${ic("info")}<div>Rate 1 (poor) to 5 (outstanding). The review is saved to ${esc(first(e.id))}'s profile and is visible only to them, you, HRD and the General Manager.</div></div>
    ${(e.notes||[]).length ? `<details><summary style="cursor:pointer;font-weight:600">History & training notes (${e.notes.length})</summary><ul class="tl" style="padding:8px 0 0">${[...e.notes].sort((a,b)=>b.date.localeCompare(a.date)).map(n => `<li class="k-${esc(n.kind)}"><div class="meta"><span class="tag">${esc(n.kind)}</span><span>${fmt(n.date)}</span></div><p>${esc(n.text)}</p></li>`).join("")}</ul></details>` : ""}
    <div>${crit.map((c,i) => `<div class="crit"><span style="font-weight:600">${esc(c)}</span><div class="score" role="radiogroup" aria-label="${esc(c)}">${[1,2,3,4,5].map(n => `<label><input type="radio" name="s:${esc(c)}" value="${n}" ${scores[i]===n?"checked":""}><span>${n}</span></label>`).join("")}</div></div>`).join("")}
      <div class="crit"><b>Overall score</b><span class="big" id="rv-avg" style="font-size:1.8rem">${avg ? avg.toFixed(1) : "—"}</span></div></div>
    <label class="f"><span>Recommendation</span><select name="recommendation">${recs.map(r => `<option ${dv(k,"recommendation",recs[1])===r?"selected":""}>${r}</option>`).join("")}</select></label>
    <label class="f"><span>Strengths</span><textarea name="strengths">${esc(dv(k,"strengths",""))}</textarea></label>
    <label class="f"><span>Areas to improve</span><textarea name="improvements">${esc(dv(k,"improvements",""))}</textarea></label>
    <label class="f"><span>Goals for next period</span><textarea name="goals">${esc(dv(k,"goals",""))}</textarea></label>
    ${S.ui.rvErr ? `<ul class="errs"><li>${esc(S.ui.rvErr)}</li></ul>` : ""}
  </div><div class="md-f"><button class="btn" type="button" data-act="close">Save as draft</button><button class="btn pri" type="submit">Submit review</button></div></form>`;
}
async function saveReview(){
  const t0 = S.D.tasks.find(x => x.id === S.modal.task), e = emp(S.modal.emp); if(!t0 || !e) return;
  const k = `rv-${t0.id}-${e.id}`, crit = cfg().criteria || [], scores = {};
  for(const c of crit){ const v = Number(dv(k,"s:"+c,0)); if(!v){ S.ui.rvErr = `Give a score for “${c}”.`; render(); return; } scores[c] = v; }
  if(!(dv(k,"strengths","")||"").trim() || !(dv(k,"improvements","")||"").trim()){ S.ui.rvErr = "Write the strengths and areas to improve."; render(); return; }
  const recs = e.status === "Probation" || t0.kind === "Probation" ? RECS : RECS.slice(0,3);
  const vals = Object.values(scores), overall = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10;
  const rv = {id:uid("v"), taskId:t0.id, empId:e.id, reviewerId:S.me, period:t0.period, scores, overall, recommendation:dv(k,"recommendation",recs[1]),
    strengths:dv(k,"strengths","").trim(), improvements:dv(k,"improvements","").trim(), goals:(dv(k,"goals","")||"").trim(), submittedAt:new Date().toISOString()};
  const t = clone(t0); if(!t.done.includes(e.id)) t.done.push(e.id); if(t.done.length >= t.memberIds.length) t.status = "done";
  S.ui.rvErr = ""; S.modal = null; delete S.drafts[k];
  if(dbOn() && !S.canEdit){ await run(() => submitItem("review", {taskId:t0.id, empId:e.id, scores, overall, recommendation:rv.recommendation, strengths:rv.strengths, improvements:rv.improvements, goals:rv.goals}), `Review for ${e.name} submitted. It appears on the profile as soon as HR's app processes it.`); return; }
  await run(async () => {
    await store.put("reviews", rv); await store.put("tasks", t); audit("review_submitted", e.name, t.title);
    await notify(t.createdBy, `Review submitted: ${e.name}`, `${t.period} · by ${nm(S.me)}`, "reviews", t.id, "review_submitted",
      {intro:`${nm(S.me)} submitted the ${t.period} performance review for ${e.name}.`, rows:[["Task", t.title], ["Overall score", String(rv.overall)], ["Progress", `${t.done.length} of ${t.memberIds.length} reviewed`]]});
    await notify(e.id, `Your ${t.period} performance review is available`, `Reviewed by ${nm(S.me)}`, "profile", e.id, "review_ready",
      {intro:`Your ${t.period} performance review by ${nm(S.me)} is ready. You can read the scores and feedback on your profile under Performance.`, rows:[["Period", t.period], ["Reviewer", nm(S.me)]], cta:{label:"Read my review", go:"profile", ref:e.id}});
  }, `Review for ${e.name} submitted.`);
}

/* ---------- attendance ---------- */
const toMin = s => { if(!s) return null; const [h,m] = String(s).split(":").map(Number); return h*60 + (m||0); };
const hhmm = n => n == null || isNaN(n) ? "" : `${pad(Math.floor(n/60) % 24)}:${pad(Math.round(n % 60))}`;
const sched = () => Object.assign({start:"08:30", end:"17:30", grace:10, workdays:[1,2,3,4,5]}, cfg().schedule || {});
const isWorkday = (s, office) => { const w = parse(s).getDay(); return (sched().workdays || [1,2,3,4,5]).includes(w) && !holMap(office)[s]; };
const attDoc = (eid, ym) => S.D.attendance.find(a => a.empId === eid && a.month === ym);
const monthsWithData = () => [...new Set(S.D.attendance.map(a => a.month))].sort();
function coverage(ym){ let last = ""; for(const a of S.D.attendance) if(a.month === ym) for(const d of Object.keys(a.days||{})) if(d > last) last = d; return last; }
function computeAtt(e, ym){
  const sc = sched(), st = toMin(sc.start), en = toMin(sc.end), grace = Number(sc.grace)||0, doc = attDoc(e.id, ym);
  const r = {hasData:!!doc, expected:0, present:0, late:0, lateMin:0, early:0, missingOut:0, absent:0, leave:0, wfh:0, extra:0, mins:0, inSum:0, inN:0, days:[]};
  const cov = coverage(ym); if(!cov) return r;
  const [y,m] = ym.split("-").map(Number), from = `${ym}-01`, to = [cov, e.exitDate ? addDays(e.exitDate, 0) : "9999"].sort()[0];
  for(let s = from; s <= to; s = addDays(s, 1)){
    if(s.slice(0,7) !== ym) break; if(e.joinDate && s < e.joinDate) continue;
    const rec = doc?.days?.[s], wd = isWorkday(s, e.office);
    const lv = S.D.requests.find(q => q.empId === e.id && q.status === "approved" && q.start <= s && q.end >= s);
    let status = "";
    if(rec && (rec.in || rec.out)){
      const i = toMin(rec.in), o = toMin(rec.out);
      status = !wd ? "extra" : (i != null && i > st + grace) ? "late" : "present";
      if(wd){ r.present++; if(status === "late"){ r.late++; r.lateMin += i - st; } if(o != null && o < en) r.early++; } else r.extra++;
      if(!rec.out || !rec.in) r.missingOut++; else if(o > i) r.mins += o - i;
      if(i != null){ r.inSum += i; r.inN++; }
    } else if(!wd) continue;
    else if(lv && lv.kind === "leave"){ status = "leave"; r.leave++; }
    else if(lv && lv.kind === "wfh"){ status = "wfh"; r.wfh++; }
    else if(doc){ status = "absent"; r.absent++; }
    else continue;
    if(wd) r.expected++;
    r.days.push({date:s, in:rec?.in||"", out:rec?.out||"", status, type:lv ? typeName(lv) : ""});
  }
  const base = r.expected - r.leave;
  r.rate = base > 0 ? (r.present + r.wfh) / base * 100 : null;
  r.avgIn = r.inN ? hhmm(r.inSum / r.inN) : "—";
  return r;
}
const attPill = s => ({present:`<span class="pill p-approved">On time</span>`, late:`<span class="pill p-pending">Late</span>`, absent:`<span class="pill p-rejected">Absent</span>`,
  leave:`<span class="pill p-info">Leave</span>`, wfh:`<span class="pill p-neutral">WFH</span>`, extra:`<span class="pill p-neutral">Weekend</span>`})[s] || "";
const monthLabel = ym => { const [y,m] = ym.split("-").map(Number); return `${MONL[m-1]} ${y}`; };
const shiftMonth = (ym, n) => { const [y,m] = ym.split("-").map(Number); return iso(new Date(y, m-1+n, 1)).slice(0,7); };
function attMonth(){ if(!S.ui.attMonth){ const ms = monthsWithData(); S.ui.attMonth = ms[ms.length-1] || today().slice(0,7); } return S.ui.attMonth; }
function attScope(){
  const off = S.ui.attOffice || "", div = S.ui.attDiv || "", ym = attMonth();
  return E().filter(e => (!off || e.office === off) && (!div || e.division === div) && e.joinDate <= `${ym}-31` && (!e.exitDate || e.exitDate >= `${ym}-01`));
}
function attSummary(list, ym){
  const rows = list.map(e => [e, computeAtt(e, ym)]).filter(([e,r]) => r.hasData);
  const sum = k => rows.reduce((s,[e,r]) => s + r[k], 0);
  const base = sum("expected") - sum("leave"), inN = sum("inN");
  return {rows, rate: base > 0 ? (sum("present") + sum("wfh")) / base * 100 : null, late:sum("late"), lateMin:sum("lateMin"), absent:sum("absent"), missingOut:sum("missingOut"),
    leave:sum("leave"), wfh:sum("wfh"), avgIn: inN ? hhmm(sum("inSum") / inN) : "—", hours: sum("mins") / 60};
}
function monthNav(ym, act){
  return `<div class="row" style="gap:6px"><button class="ib" type="button" data-act="${act}" data-v="-1" aria-label="Previous month">${ic("left")}</button><span class="tag" style="font-size:.86rem;padding:8px 12px;min-width:132px;justify-content:center">${monthLabel(ym)}</span><button class="ib" type="button" data-act="${act}" data-v="1" aria-label="Next month">${ic("right")}</button></div>`;
}
function vAttendance(){
  const ym = attMonth(), list = attScope(), A = attSummary(list, ym), cov = coverage(ym), sc = sched();
  const offices = cfg().offices || [], divs = cfg().divisions || [];
  const head = `<div class="page-h"><div><h1>Attendance Report</h1><p>Built from attendance machine or spreadsheet exports (.xlsx, .xls, .csv). Working hours ${esc(sc.start)}–${esc(sc.end)}, late after ${Number(sc.grace)||0} minutes grace. Approved leave and WFH are matched automatically.</p></div>
    <div class="row"><button class="btn" type="button" data-act="att-template">${ic("doc")}Template</button><button class="btn" type="button" data-act="att-export" ${A.rows.length?"":"disabled"}>${ic("download")}Export CSV</button>${isHR() ? `<button class="btn pri" type="button" data-act="att-upload">${ic("upload")}Upload Excel</button>` : ""}</div></div>`;
  const filters = `<div class="row" style="justify-content:space-between">${monthNav(ym, "att-month")}<div class="row">
    <select id="att-office" aria-label="Office" style="width:auto"><option value="">All offices</option>${offices.map(o => `<option ${S.ui.attOffice===o?"selected":""}>${esc(o)}</option>`).join("")}</select>
    <select id="att-div" aria-label="Division" style="width:auto"><option value="">All divisions</option>${divs.map(o => `<option ${S.ui.attDiv===o?"selected":""}>${esc(o)}</option>`).join("")}</select></div></div>`;
  const upload = S.ui.attUp ? uploadPanel() : "";
  if(!A.rows.length) return head + upload + filters + `<section class="card"><div class="empty"><b>No attendance data for ${monthLabel(ym)}</b>${isHR() ? "Upload the attendance export for this month to generate the report." : "HRD hasn't uploaded attendance for this month yet."}${monthsWithData().length ? `<br><span class="small">Months with data: ${monthsWithData().map(monthLabel).join(", ")}</span>` : ""}</div></section>` + importLog();
  const kpis = `<div class="grid kpis">${kpi("Attendance rate", A.rate == null ? "—" : A.rate.toFixed(1)+"%", `data until ${fmt(cov)}`, A.rate != null && A.rate < 95 ? "warn" : "")}
    ${kpi("Average check-in", A.avgIn, `start ${esc(sc.start)}`)}${kpi("Late arrivals", A.late, `${Math.round(A.lateMin)} minutes in total`, A.late ? "warn" : "")}
    ${kpi("Unexcused absences", A.absent, "workdays with no punch, leave or WFH", A.absent ? "warn" : "")}${kpi("Missing punches", A.missingOut, "no check-in or check-out")}
    ${kpi("On leave · WFH", `${A.leave} · ${A.wfh}`, "approved days")}</div>`;
  // daily chart
  const daysInM = []; for(let s = `${ym}-01`; s <= cov && s.slice(0,7) === ym; s = addDays(s,1)) if(isWorkday(s, S.ui.attOffice || null)) daysInM.push(s);
  const day = s => { const c = {present:0, late:0, wfh:0, leave:0, absent:0}; for(const [e,r] of A.rows){ const d = r.days.find(x => x.date === s); if(d && c[d.status] !== undefined) c[d.status]++; } return c; };
  const dd = daysInM.map(s => [s, day(s)]), mx = Math.max(1, ...dd.map(([s,c]) => c.present + c.late + c.wfh + c.leave + c.absent));
  const colors = {present:"var(--accent)", late:"var(--warn)", wfh:"var(--t5f)", leave:"var(--t4f)", absent:"var(--bad)"};
  const chart = card("Daily attendance", "chart", "c1", `<div class="trend att-chart" role="img" aria-label="Daily attendance for ${monthLabel(ym)}">${dd.map(([s,c]) => `<div class="tcol" title="${fmt(s)}: ${c.present} on time, ${c.late} late, ${c.wfh} WFH, ${c.leave} on leave, ${c.absent} absent">
      <span class="tv num">${c.present + c.late + c.wfh}</span><span class="tb"><span class="stackcol" style="height:${(c.present+c.late+c.wfh+c.leave+c.absent)/mx*100}%">${["absent","leave","wfh","late","present"].map(k => c[k] ? `<i style="flex:${c[k]};background:${colors[k]}"></i>` : "").join("")}</span></span><span class="tm">${Number(s.slice(8))}</span></div>`).join("")}</div>
    <div class="card-b" style="padding-top:0"><div class="legend">${Object.entries({present:"On time", late:"Late", wfh:"WFH", leave:"Leave", absent:"Absent"}).map(([k,l]) => `<span><i style="background:${colors[k]}"></i>${l}</span>`).join("")}</div></div>`, `<span class="tag">Workdays · ${monthLabel(ym)}</span>`);
  const byOff = offices.map(o => { const s = attSummary(list.filter(e => e.office === o), ym); return [o, s.rate == null ? 0 : Math.round(s.rate*10)/10, s.rows.length]; }).filter(x => x[2]);
  const offCard = card("Attendance rate by office", "grid", "c5", `<div class="card-b">${byOff.length ? hbars(byOff.map(x => [x[0], x[1]]), 100, v => v.toFixed(0)+"%") : `<p class="muted small">No office data.</p>`}</div>`);
  const tbl = `<section class="card"><div class="card-h"><h2>Employees</h2><span class="tag">${A.rows.length} with data</span></div><div class="tw"><table class="t rt"><thead><tr><th>Employee</th><th>Office</th><th class="r">Present</th><th class="r">Late</th><th class="r">Absent</th><th class="r">Leave</th><th class="r">WFH</th><th class="r">Missing</th><th class="r">Avg in</th><th class="r">Rate</th></tr></thead><tbody>
    ${A.rows.sort((a,b) => (a[1].rate ?? 101) - (b[1].rate ?? 101)).map(([e,r]) => `<tr class="click" data-act="open-emp" data-id="${e.id}" data-tab="attendance"><td class="wide">${who(e.id, e.division||e.dept)}</td><td data-l="Office">${esc(e.office||"—")}</td>
      <td data-l="Present" class="r num">${r.present}/${r.expected - r.leave}</td><td data-l="Late" class="r num">${r.late}${r.late?` <span class="small muted">(${r.lateMin}m)</span>`:""}</td><td data-l="Absent" class="r num ${r.absent?"down":""}">${r.absent}</td>
      <td data-l="Leave" class="r num">${r.leave}</td><td data-l="WFH" class="r num">${r.wfh}</td><td data-l="Missing" class="r num">${r.missingOut}</td><td data-l="Avg in" class="r num">${r.avgIn}</td>
      <td data-l="Rate" class="r num"><b class="${r.rate != null && r.rate < 90 ? "down" : ""}">${r.rate == null ? "—" : r.rate.toFixed(0)+"%"}</b></td></tr>`).join("")}</tbody></table></div>
    ${list.filter(e => !attDoc(e.id, ym) && e.status !== "Resigned").length ? `<div class="card-b small muted" style="border-top:1px solid var(--line)">No data this month for: ${list.filter(e => !attDoc(e.id, ym) && e.status !== "Resigned").map(e => esc(e.name)).join(", ")}. Check that their Employee ID matches the attendance machine.</div>` : ""}</section>`;
  return head + upload + filters + kpis + `<div class="grid split">${chart}${offCard}</div>` + tbl + importLog();
}
function importLog(){
  const list = [...S.D.attImports].sort((a,b) => b.at.localeCompare(a.at)).slice(0,8);
  if(!list.length) return "";
  return `<section class="card"><div class="card-h"><h2>Upload history</h2></div><div class="list">${list.map(x => `<div class="li"><span class="tile c5" style="width:36px;height:36px">${ic("doc")}</span><div class="grow"><b style="font-weight:600;display:block">${esc(x.file)}</b>
    <span class="small muted">${fmt(x.from)} – ${fmt(x.to)} · ${x.records} day records for ${x.employees} employees${x.unmatched?` · ${x.unmatched} unmatched ID(s)`:""} · by ${esc(nm(x.by))}, ${ago(x.at)}</span></div></div>`).join("")}</div></section>`;
}

/* --- Excel parsing --- */
let xlsxP;
function loadXLSX(){
  if(window.XLSX) return Promise.resolve(window.XLSX);
  return xlsxP = xlsxP || new Promise((res, rej) => {
    const add = (src, next) => { const s = document.createElement("script"); s.src = src; s.onload = () => res(window.XLSX); s.onerror = next; document.head.appendChild(s); };
    add("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", () => add("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js", () => { xlsxP = null; rej(new Error("load")); }));
  });
}
const MAPS = {id:/^(id|emp.?id|employee.?(id|no|number|code)|nik|nip|badge|ac.?no\.?|no\.? ?(karyawan|pegawai)|user.?id|pin|enroll.*|staff.?(id|no))$/i,
  name:/^(name|nama|employee.?name|nama.?(karyawan|pegawai)|full.?name)$/i,
  date:/^(date|tanggal|tgl|day|work.?date|att.?date)$/i,
  in:/^(check.?in|clock.?in|in|masuk|jam.?masuk|time.?in|first.?(in|punch)|scan.?masuk)$/i,
  out:/^(check.?out|clock.?out|out|pulang|keluar|jam.?(pulang|keluar)|time.?out|last.?(out|punch)|scan.?pulang)$/i,
  dt:/^(date.?time|timestamp|waktu|datetime|punch.?time|time|jam|scan.?time)$/i};
function parseTimeVal(v){
  if(v == null || v === "") return null;
  if(typeof v === "number"){ const f = v % 1; return Math.floor(f * 1440 + 1e-6) % 1440; }
  const s = String(v).trim(), m = s.match(/(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?\s*(am|pm)?/i); if(!m) return null;
  let h = Number(m[1]); const mi = Number(m[2]), ap = (m[4]||"").toLowerCase(); if(ap === "pm" && h < 12) h += 12; if(ap === "am" && h === 12) h = 0;
  return h < 24 && mi < 60 ? h*60 + mi : null;
}
function parseDateVal(v, dmy){
  if(v == null || v === "") return null;
  if(typeof v === "number"){ if(v < 20000) return null; const d = new Date(Date.UTC(1899,11,30) + Math.floor(v) * 864e5); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`; }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/); if(m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if(m){ let a = Number(m[1]), b = Number(m[2]), y = Number(m[3]); if(y < 100) y += 2000; let d = dmy ? a : b, mo = dmy ? b : a; if(mo > 12 && d <= 12){ [d, mo] = [mo, d]; } if(mo < 1 || mo > 12 || d < 1 || d > 31) return null; return `${y}-${pad(mo)}-${pad(d)}`; }
  m = s.match(/^(\d{1,2})[\s-]([A-Za-z]{3,})[\s-,]*(\d{4})/); if(m){ const mo = MON.findIndex(x => m[2].toLowerCase().startsWith(x.toLowerCase().slice(0,3))) + 1 || ["jan","feb","mar","apr","mei","jun","jul","agu","sep","okt","nov","des"].indexOf(m[2].toLowerCase().slice(0,3)) + 1; if(mo) return `${m[3]}-${pad(mo)}-${pad(m[1])}`; }
  return null;
}
const digits = v => { const d = String(v ?? "").replace(/\D/g, ""); return d ? String(Number(d)) : ""; };
const normName = v => String(v ?? "").toLowerCase().replace(/[^a-z]/g, "");
function matchEmp(idv, namev){
  const id = String(idv ?? "").trim().toUpperCase();
  if(id){ let e = E().find(x => (x.empNo||"").toUpperCase() === id); if(e) return e; const d = digits(id); if(d){ e = E().find(x => digits(x.empNo) === d); if(e) return e; } }
  const n = normName(namev); if(n) return E().find(x => normName(x.name) === n) || null;
  return null;
}
async function readAttFile(file){
  S.ui.attParse = {loading:true, file:file.name}; render();
  try {
    const X = await loadXLSX(), buf = await file.arrayBuffer();
    const wb = X.read(buf, {type:"array", raw:false, cellDates:false});
    const sheets = wb.SheetNames.map(n => [n, X.utils.sheet_to_json(wb.Sheets[n], {header:1, raw:true, defval:""})]).filter(([n,r]) => r.length);
    if(!sheets.length) throw new Error("empty");
    S.ui.attParse = {file:file.name, sheets, sheet:0, dmy:true}; autoMap(); render();
  } catch(err){ S.ui.attParse = {error: err && err.message === "load" ? "The spreadsheet reader couldn't load. Check your connection and try again." : "This file couldn't be read. Upload an .xlsx, .xls or .csv export."}; render(); }
}
function autoMap(){
  const P = S.ui.attParse, rows = P.sheets[P.sheet][1];
  let hi = 0; for(let i = 0; i < Math.min(15, rows.length); i++){ const r = rows[i].filter(c => String(c).trim() !== ""); if(r.length >= 3 && r.filter(c => typeof c === "string" && isNaN(Number(c))).length >= 2){ hi = i; break; } }
  P.hi = hi; P.headers = rows[hi].map((h,i) => String(h).trim() || `Column ${i+1}`); P.map = {};
  P.headers.forEach((h,i) => { for(const [k,re] of Object.entries(MAPS)) if(P.map[k] == null && re.test(h.replace(/\s+/g," ").trim())) P.map[k] = i; });
}
function buildAtt(){
  const P = S.ui.attParse, rows = P.sheets[P.sheet][1].slice(P.hi + 1), M = P.map, mode = M.in != null ? "inout" : "punch";
  const recs = new Map(), unmatched = new Map(); let bad = 0, total = 0;
  for(const r of rows){
    if(!r.some(c => String(c).trim() !== "")) continue; total++;
    const idv = M.id != null ? r[M.id] : "", namev = M.name != null ? r[M.name] : "";
    const dateSrc = M.date != null ? r[M.date] : r[M.dt];
    const date = parseDateVal(dateSrc, P.dmy);
    if(!date){ bad++; continue; }
    const e = matchEmp(idv, namev);
    if(!e){ const key = `${idv || ""}${namev ? " · " + namev : ""}`.trim() || "(blank)"; unmatched.set(key, (unmatched.get(key)||0) + 1); continue; }
    const k = e.id + "|" + date, cur = recs.get(k) || {empId:e.id, date, ins:[], outs:[]};
    if(mode === "inout"){ const i = parseTimeVal(r[M.in]), o = M.out != null ? parseTimeVal(r[M.out]) : null; if(i != null) cur.ins.push(i); if(o != null) cur.outs.push(o); }
    else { const t = parseTimeVal(M.dt != null ? r[M.dt] : null) ?? (typeof dateSrc === "number" && dateSrc % 1 ? parseTimeVal(dateSrc) : parseTimeVal(String(dateSrc).split(/\s+/)[1])); if(t != null) cur.ins.push(t); }
    recs.set(k, cur);
  }
  const out = [...recs.values()].map(x => { if(mode === "punch"){ const all = x.ins.sort((a,b) => a-b); return {empId:x.empId, date:x.date, in:hhmm(all[0]), out:all.length > 1 ? hhmm(all[all.length-1]) : ""}; }
    return {empId:x.empId, date:x.date, in:x.ins.length ? hhmm(Math.min(...x.ins)) : "", out:x.outs.length ? hhmm(Math.max(...x.outs)) : ""}; });
  const dates = out.map(x => x.date).sort();
  return {mode, recs:out, unmatched:[...unmatched.entries()], bad, total, from:dates[0], to:dates[dates.length-1], employees:new Set(out.map(x => x.empId)).size};
}
function uploadPanel(){
  const P = S.ui.attParse;
  const close = `<button class="ib plain" type="button" data-act="att-upclose" aria-label="Close upload">${ic("x")}</button>`;
  if(!P || P.error) return `<section class="card"><div class="card-h"><span class="tile c5">${ic("upload")}</span><h2>Upload attendance file</h2>${close}</div><div class="card-b stack">
    <label class="drop" id="att-drop"><input type="file" id="att-file" accept=".xlsx,.xls,.csv"><span class="tile c1">${ic("upload")}</span><b>Drop the Excel file here or click to choose</b><span class="small muted">Attendance machine exports work as-is: one row per day with Check In / Check Out, or one row per fingerprint scan (first scan = in, last scan = out).</span></label>
    ${P?.error ? `<ul class="errs"><li>${esc(P.error)}</li></ul>` : ""}
    <p class="small muted">Rows are matched to employees by <b>Employee ID</b> (e.g. ONE-0031 or just 31), or by full name when there's no ID column. Uploading the same dates again replaces those days.</p></div></section>`;
  if(P.loading) return `<section class="card"><div class="empty"><b>Reading ${esc(P.file)}…</b>Preparing the preview.</div></section>`;
  const res = buildAtt(), rows = P.sheets[P.sheet][1], H = P.headers, M = P.map;
  const sel = (k, l, req) => `<label class="f"><span>${l}${req?"":` <span class="muted" style="font-weight:400">(optional)</span>`}</span><select data-attmap="${k}"><option value="">—</option>${H.map((h,i) => `<option value="${i}" ${M[k]===i?"selected":""}>${esc(h)}</option>`).join("")}</select></label>`;
  const ok = res.recs.length > 0;
  return `<section class="card"><div class="card-h"><span class="tile c5">${ic("doc")}</span><h2>${esc(P.file)}<br><span class="small muted" style="font-family:var(--f-body);font-weight:500">${res.total} data rows · ${res.mode === "inout" ? "check-in / check-out per row" : "one row per scan"}</span></h2>${close}</div>
    <div class="card-b stack">
      ${P.sheets.length > 1 ? `<label class="f" style="max-width:260px"><span>Sheet</span><select id="att-sheet">${P.sheets.map(([n],i) => `<option value="${i}" ${P.sheet===i?"selected":""}>${esc(n)}</option>`).join("")}</select></label>` : ""}
      <div><h3 class="sub">Match the columns</h3><div class="fields">${sel("id","Employee ID")}${sel("name","Name")}${sel("date","Date", M.dt == null)}${sel("in","Check in", false)}${sel("out","Check out")}${sel("dt","Date & time of scan")}
        <label class="f"><span>Date format in file</span><select id="att-dmy"><option value="1" ${P.dmy?"selected":""}>Day/Month/Year</option><option value="0" ${!P.dmy?"selected":""}>Month/Day/Year</option></select></label></div></div>
      <div class="tw" style="border:1px solid var(--line);border-radius:10px"><table class="t"><thead><tr>${H.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.slice(P.hi+1, P.hi+5).map(r => `<tr>${H.map((h,i) => `<td>${esc(r[i])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <div class="grid kpis k4">${kpi("Day records", res.recs.length, res.from ? `${fmt(res.from)} – ${fmt(res.to)}` : "—")}${kpi("Employees matched", res.employees, `of ${activeE().length} active`)}${kpi("Unmatched rows", res.unmatched.reduce((s,x) => s + x[1], 0), `${res.unmatched.length} ID(s)`, res.unmatched.length ? "warn" : "")}${kpi("Skipped rows", res.bad, "no readable date", res.bad ? "warn" : "")}</div>
      ${res.unmatched.length ? `<div class="note warn">${ic("alert")}<div><b>Not matched to any employee:</b> ${res.unmatched.slice(0,12).map(([k,n]) => `${esc(k)} (${n})`).join(", ")}${res.unmatched.length > 12 ? "…" : ""}. These rows will be skipped. Fix the Employee ID on the profile or in the file, then upload again.</div></div>` : ""}
      ${!ok ? `<ul class="errs"><li>No rows could be read. Check that the Date and Check in (or scan time) columns are selected.</li></ul>` : ""}
      <div class="row end"><button class="btn" type="button" data-act="att-upclose">Cancel</button><button class="btn pri" type="button" data-act="att-import" ${ok?"":"disabled"}>${ic("check")}Import ${res.recs.length} records</button></div>
    </div></section>`;
}
async function importAtt(){
  const P = S.ui.attParse, res = buildAtt(); if(!res.recs.length) return;
  const groups = new Map(); for(const r of res.recs){ const k = r.empId + "_" + r.date.slice(0,7); (groups.get(k) || groups.set(k, []).get(k)).push(r); }
  const now = new Date().toISOString(), log = {id:uid("ai"), file:P.file, by:S.me, at:now, rows:res.total, records:res.recs.length, employees:res.employees, from:res.from, to:res.to, unmatched:res.unmatched.length};
  const ok = await run(async () => {
    for(const [k, list] of groups){ const [empId, month] = k.split("_"); const cur = attDoc(empId, month); const doc = cur ? clone(cur) : {id:k, empId, month, days:{}};
      for(const r of list) doc.days[r.date] = {in:r.in, out:r.out}; doc.updatedAt = now; doc.importId = log.id; await store.put("attendance", doc); }
    await store.put("attImports", log); audit("attendance_imported", P.file, `${res.recs.length} records, ${res.from}..${res.to}`);
  }, `Imported ${res.recs.length} records for ${res.employees} employees.`);
  if(ok){ S.ui.attUp = false; S.ui.attParse = null; S.ui.attMonth = res.to.slice(0,7); render(); }
}
async function download(filename, data){
  let dl = null; try { dl = window.claude?.use ? await window.claude.use("downloads") : null; } catch(e){}
  if(!dl){ toast("Downloads aren't available in this view."); return; }
  try { await dl.save({filename, data}); } catch(err){ if(err?.code !== "declined") toast("The file couldn't be saved."); }
}
const csvCell = v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : String(v);
function attCSV(){
  const ym = attMonth(), A = attSummary(attScope(), ym);
  const head = ["Employee ID","Name","Office","Division","Department","Workdays","Present","Late","Late minutes","Absent","Leave","WFH","Missing punches","Average check-in","Attendance rate %"];
  const lines = [head].concat(A.rows.map(([e,r]) => [e.empNo, e.name, e.office||"", e.division||"", e.dept, r.expected, r.present, r.late, r.lateMin, r.absent, r.leave, r.wfh, r.missingOut, r.avgIn, r.rate == null ? "" : r.rate.toFixed(1)]));
  return lines.map(l => l.map(csvCell).join(",")).join("\n");
}
function pAttendance(e){
  const ym = attMonth(), r = computeAtt(e, ym), sc = sched();
  return `<div class="row" style="justify-content:space-between">${monthNav(ym, "att-month")}<span class="small muted">Working hours ${esc(sc.start)}–${esc(sc.end)} · ${Number(sc.grace)||0} min grace</span></div>
  ${!r.hasData ? `<section class="card"><div class="empty"><b>No attendance data for ${monthLabel(ym)}</b>HRD uploads attendance from the attendance machine export.</div></section>` : `
  <div class="grid kpis">${kpi("Attendance rate", r.rate == null ? "—" : r.rate.toFixed(0)+"%", `${r.present + r.wfh} of ${r.expected - r.leave} workdays`)}${kpi("Average check-in", r.avgIn, `start ${esc(sc.start)}`)}
    ${kpi("Late", r.late, `${r.lateMin} min total`, r.late ? "warn" : "")}${kpi("Absent", r.absent, "unexcused", r.absent ? "warn" : "")}${kpi("Leave · WFH", `${r.leave} · ${r.wfh}`, "approved")}${kpi("Hours worked", (r.mins/60).toFixed(0), "from complete punches")}</div>
  <section class="card"><div class="card-h"><h2>Daily log</h2></div><div class="tw"><table class="t rt"><thead><tr><th>Date</th><th>Check in</th><th>Check out</th><th class="r">Hours</th><th>Status</th></tr></thead><tbody>
    ${r.days.map(d => { const h = d.in && d.out ? (toMin(d.out) - toMin(d.in)) / 60 : null; return `<tr><td class="wide"><b style="font-weight:600">${DOWL[parse(d.date).getDay()].slice(0,3)}, ${fmt(d.date)}</b></td><td data-l="In" class="num">${esc(d.in||"—")}</td><td data-l="Out" class="num">${d.out ? esc(d.out) : d.in ? `<span class="down">missing</span>` : "—"}</td>
      <td data-l="Hours" class="r num">${h != null && h > 0 ? h.toFixed(1) : "—"}</td><td data-l="Status">${attPill(d.status)}${d.type && d.status === "leave" ? ` <span class="small muted">${esc(d.type)}</span>` : ""}</td></tr>`; }).join("")}</tbody></table></div></section>`}`;
}

/* ---------- organization settings ---------- */
const ORG = {offices:["Offices","office"], divisions:["Divisions","division"], departments:["Departments","dept"]};
function orgSection(kind, ro){
  const [label, field] = ORG[kind], list = cfg()[kind] || [];
  return `<section class="org"><div class="card-h"><h2>${label}</h2><span class="tag">${list.length}</span></div>
    <div class="list">${list.map((v,i) => { const n = E().filter(e => e[field] === v).length; return `<div class="li"><input type="text" value="${esc(v)}" data-org="${kind}" data-old="${esc(v)}" ${ro?"disabled":""} aria-label="${label} name" style="max-width:340px">
      <span class="grow small muted">${n} employee${n===1?"":"s"}</span>${ro ? "" : `<button class="ib plain" type="button" data-act="org-del" data-k="${kind}" data-v="${esc(v)}" aria-label="Remove ${esc(v)}" ${n?`title="Move the ${n} employee(s) first"`:""}>${ic("trash")}</button>`}</div>`; }).join("")}</div>
    ${ro ? "" : `<form class="card-b row" data-draft="org-${kind}" data-submit="org" data-k="${kind}" style="align-items:flex-end;border-top:1px solid var(--line)"><label class="f" style="flex:1 1 240px"><span>Add ${label.toLowerCase().slice(0,-1).replace(/ie$/,"y")}</span><input type="text" name="name" value="${esc(dv("org-"+kind,"name",""))}"></label><button class="btn pri" type="submit">Add</button></form>`}</section>`;
}
function jobSection(ro){
  const list = JOBS();
  return `<section class="org"><div class="card-h"><h2>Job levels</h2><span class="tag">${list.length}</span></div>
    <div class="card-b" style="padding-bottom:0"><p class="small muted">The access type decides what people at that level can do. Any Manager or Supervisor level can also be added as a step in Approval Flows. HRD admin access is given per person on the employee form.</p></div>
    <div class="list">${list.map(j => { const n = E().filter(e => e.jobLevel === j.name).length; return `<div class="li" style="flex-wrap:wrap"><input type="text" value="${esc(j.name)}" data-job="${esc(j.name)}" ${ro?"disabled":""} aria-label="Job level name" style="max-width:260px;flex:1 1 180px">
      <select data-jobacc="${esc(j.name)}" ${ro?"disabled":""} aria-label="Access for ${esc(j.name)}" style="max-width:300px;flex:1 1 200px">${Object.entries(ACCESS).map(([a,l]) => `<option value="${a}" ${j.access===a?"selected":""}>${l}</option>`).join("")}</select>
      <span class="grow small muted">${n} employee${n===1?"":"s"}</span>${ro ? "" : `<button class="ib plain" type="button" data-act="job-del" data-v="${esc(j.name)}" aria-label="Remove ${esc(j.name)}">${ic("trash")}</button>`}</div>`; }).join("")}</div>
    ${ro ? "" : `<form class="card-b row" data-draft="job-new" data-submit="job" style="align-items:flex-end;border-top:1px solid var(--line)"><label class="f" style="flex:1 1 200px"><span>New job level</span><input type="text" name="name" value="${esc(dv("job-new","name",""))}" placeholder="e.g. HR Manager, Team Leader"></label>
      <label class="f" style="flex:1 1 220px"><span>Access</span><select name="access">${Object.entries(ACCESS).map(([a,l]) => `<option value="${a}" ${dv("job-new","access","staff")===a?"selected":""}>${l}</option>`).join("")}</select></label><button class="btn pri" type="submit">Add</button></form>`}</section>`;
}
async function updateJobs(list, empFn, msg){
  const c = clone(cfg()); c.jobLevels = list; S.config = c;
  const changed = E().map(e => [e, empFn(e)]).filter(([e, n]) => n);
  await run(async () => { await store.config(c); for(const [e, n] of changed) await store.put("employees", n); }, msg + (changed.length ? ` ${changed.length} employee(s) updated.` : ""));
}
async function renameOrg(kind, old, nv){
  nv = nv.trim(); const [label, field] = ORG[kind], list = cfg()[kind] || [];
  if(!nv || nv === old){ render(); return; }
  if(list.includes(nv)){ toast(`“${nv}” already exists.`); render(); return; }
  const c = clone(cfg()); c[kind] = list.map(x => x === old ? nv : x);
  const affected = E().filter(e => e[field] === old);
  await run(async () => { await store.config(c); for(const e of affected) await store.put("employees", Object.assign(clone(e), {[field]:nv})); }, `Renamed to “${nv}”${affected.length ? ` and updated ${affected.length} employee(s)` : ""}.`);
}

/* ---------- images: company logo & profile photos (resized in the browser, stored as small data URLs) ---------- */
function imageToDataURL(file, opt){
  return new Promise((res, rej) => {
    if(!/^image\//.test(file.type)) return rej(new Error("type"));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      try {
        let w = img.naturalWidth, h = img.naturalHeight, sx = 0, sy = 0, sw = w, sh = h;
        if(opt.square){ const m = Math.min(w, h); sx = (w - m) / 2; sy = (h - m) / 2; sw = sh = m; w = h = Math.min(opt.size, m); }
        else { const k = Math.min(1, opt.maxW / w, opt.maxH / h); w = Math.round(w * k); h = Math.round(h * k); }
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        let out = c.toDataURL(opt.type || "image/jpeg", .85);
        if(out.length > 180000) out = c.toDataURL("image/jpeg", .7);
        URL.revokeObjectURL(url); res(out);
      } catch(e){ URL.revokeObjectURL(url); rej(e); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("read")); };
    img.src = url;
  });
}
const canEditPhoto = id => S.mode !== "db" ? (id === S.me || isHR()) : ((id === S.realEmpId && !S.preview) || (isHR() && S.canEdit));
async function setPhotoRef(id, ref){
  const now = new Date().toISOString();
  if(dbOn() && !S.canEdit){
    if(id !== S.realEmpId || S.preview){ toast("You can only change your own photo."); return; }
    await run(async () => { await S.db.doc("ph/" + S.uid).set({asset:ref, at:now}); audit("photo_changed", nm(id), "self"); }, ref ? "Profile photo updated." : "Photo removed.");
    return;
  }
  const e = Object.assign(clone(emp(id)), {photo:ref, photoAt:now});
  await run(async () => { await store.put("employees", e); audit("photo_changed", e.name, ""); }, ref ? (id === S.me ? "Profile photo updated." : `Photo updated for ${e.name}.`) : "Photo removed.");
}
async function setPhoto(id, file){
  try { S.ui.busy = "Uploading photo…"; await setPhotoRef(id, await uploadImage(file, {})); }
  catch(err){ toast(err?.message === "type" ? "Choose an image file (JPG, PNG or WebP)." : "This image couldn't be read. Try another file."); }
  S.ui.busy = "";
}
async function setLogo(file){
  try { await setCfg("company.logo", await uploadImage(file, {logo:true})); }
  catch(err){ toast(err?.message === "type" ? "Choose an image file (PNG, JPG, WebP or SVG)." : "This image couldn't be read. Try another file."); }
}
const company = () => Object.assign({name:"ONEderland", tagline:"HRM · Enterprise", logo:""}, cfg().company || {});
function renderBrand(){
  const c = company(), el = document.getElementById("brand"); if(!el) return;
  const logo = c.logo || (window.HRM_CONFIG && window.HRM_CONFIG.logo) || "";
  el.innerHTML = logo ? `<div class="brand-mark"><img class="logo-wide" src="${esc(assetSrc(logo))}" alt="${esc(c.name)}"><small>HR Management</small></div>`
    : `<span class="logo" aria-hidden="true">${esc(c.name.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase() || "HR")}</span><div style="min-width:0"><b>${esc(c.name)}</b><small>${esc(c.tagline)}</small></div>`;
}

/* ---------- employee import ---------- */
const TPL = [
  ["empNo","Employee ID",1,"Unique ID, e.g. ONE-0040. Existing IDs update that employee."],["name","Full Name",1,""],["email","Work Email",0,""],["phone","Phone",0,""],
  ["gender","Gender",0,"F or M"],["birthDate","Date of Birth",0,"DD/MM/YYYY"],["position","Position",1,"Job title, e.g. Front Office Staff"],
  ["dept","Department",1,"From the Departments list"],["division","Division",1,"From the Divisions list"],["office","Office",1,"From the Offices list"],["jobLevel","Job Level",1,"From the Job Levels list"],
  ["supervisorNo","Supervisor Employee ID",0,"Employee ID of the direct supervisor"],["hrAdmin","HRD Admin",0,"Yes or No"],["joinDate","Join Date",1,"DD/MM/YYYY"],
  ["status","Status",0,"Probation, Active or Resigned"],["ctype","Contract Type",0,"Probation, PKWT or PKWTT"],["cno","Contract No.",0,""],
  ["cstart","Contract Start",0,"DD/MM/YYYY (default: join date)"],["cend","Contract End",0,"DD/MM/YYYY (empty for PKWTT)"],
  ["q:annual","Annual Leave Balance",0,"Days available now (optional)"],["q:sick","Sick Leave Balance",0,"Days available now (optional)"]
];
const hkey = s => String(s ?? "").toLowerCase().replace(/\*/g,"").replace(/[^a-z0-9]/g,"");
const canon = (list, v) => list.find(x => x.toLowerCase() === String(v).trim().toLowerCase());
const dmyStr = s => s ? `${s.slice(8,10)}/${s.slice(5,7)}/${s.slice(0,4)}` : "";
function tplRow(e){
  return [e.empNo, e.name, e.email||"", e.phone||"", e.gender||"", dmyStr(e.birthDate), e.position, e.dept, e.division||"", e.office||"", jobOf(e),
    e.supervisorId ? emp(e.supervisorId)?.empNo || "" : "", e.role === "hrd" ? "Yes" : "No", dmyStr(e.joinDate), e.status, e.contract?.type || "", e.contract?.no || "",
    dmyStr(e.contract?.start), dmyStr(e.contract?.end), LT().annual?.track ? balance(e.id,"annual").avail : "", LT().sick?.track ? balance(e.id,"sick").avail : ""];
}
async function downloadEmpTemplate(withData){
  let X; try { X = await loadXLSX(); } catch(e){ toast("The spreadsheet tool couldn't load. Check your connection."); return; }
  const head = TPL.map(c => c[1] + (c[2] ? " *" : ""));
  const sup = activeE().find(e => ["gm","supervisor"].includes(e.role));
  const rows = withData ? E().map(tplRow) : [
    ["ONE-0101","Example Person One","person.one@company.com","+62 812-0000-0001","F","14/02/1997","Front Office Staff",(cfg().departments||[])[0]||"",(cfg().divisions||[])[0]||"",(cfg().offices||[])[0]||"","Staff",sup?.empNo||"","No","03/11/2026","Probation","Probation","PRB/ONE/2026/101","03/11/2026","01/02/2027","",""],
    ["ONE-0102","Example Person Two","person.two@company.com","+62 812-0000-0002","M","09/09/1990","Finance Supervisor",(cfg().departments||[])[1]||"",(cfg().divisions||[])[1]||"",(cfg().offices||[])[1]||"","Supervisor",sup?.empNo||"","No","01/06/2024","Active","PKWT","PKWT/ONE/2026/102","01/06/2026","31/05/2027","10","12"]];
  const ws = X.utils.aoa_to_sheet([head].concat(rows));
  ws["!cols"] = TPL.map(c => ({wch: Math.max(14, c[1].length + 4)}));
  ws["!freeze"] = {xSplit:2, ySplit:1};
  const lists = [["Departments", cfg().departments||[]],["Divisions", cfg().divisions||[]],["Offices", cfg().offices||[]],["Job Levels", JOBS().map(j => j.name)],["Gender",["F","M"]],["Status",["Probation","Active","Resigned"]],["Contract Type",["Probation","PKWT","PKWTT"]],["HRD Admin",["Yes","No"]]];
  const n = Math.max(...lists.map(l => l[1].length));
  const ws2 = X.utils.aoa_to_sheet([lists.map(l => l[0])].concat(Array.from({length:n}, (_,i) => lists.map(l => l[1][i] || ""))));
  ws2["!cols"] = lists.map(() => ({wch:24}));
  const ws3 = X.utils.aoa_to_sheet([["Column","Required","How to fill"]].concat(TPL.map(c => [c[1], c[2] ? "Yes" : "No", c[3]])).concat([[],["Notes"],
    ["• Keep the header row as it is. One employee per row; delete the example rows."],["• Dates: DD/MM/YYYY or real Excel dates."],
    ["• Department, Division, Office and Job Level must match the 'Allowed values' sheet (HRD can add new values in Settings → Organization, or tick 'Add new values' when importing)."],
    ["• An Employee ID that already exists updates that employee; only filled cells are changed."],
    ["• New employees get leave quota from Settings → Leave Types. Fill the balance columns to set a specific number of days instead."]]));
  ws3["!cols"] = [{wch:26},{wch:10},{wch:70}];
  const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, "Employees"); X.utils.book_append_sheet(wb, ws2, "Allowed values"); X.utils.book_append_sheet(wb, ws3, "Guide");
  const buf = X.write(wb, {type:"array", bookType:"xlsx"});
  await download(withData ? `${company().name}_Employees_${today()}.xlsx` : `${company().name}_Employee_Import_Template.xlsx`, new Uint8Array(buf));
}
async function readEmpFile(file){
  S.ui.empImp = {loading:true, file:file.name}; render();
  try {
    const X = await loadXLSX(), wb = X.read(await file.arrayBuffer(), {type:"array", raw:false, cellDates:false});
    const name = wb.SheetNames.find(n => /employ|karyawan/i.test(n)) || wb.SheetNames[0];
    const rows = X.utils.sheet_to_json(wb.Sheets[name], {header:1, raw:true, defval:""});
    let hi = rows.findIndex(r => r.some(c => hkey(c) === "employeeid") && r.some(c => hkey(c) === "fullname"));
    if(hi < 0) throw new Error("header");
    const cols = {}; rows[hi].forEach((h,i) => { const t = TPL.find(c => hkey(c[1]) === hkey(h)); if(t) cols[t[0]] = i; });
    S.ui.empImp = {file:file.name, rows:rows.slice(hi+1).map((r,i) => ({line:hi+i+2, r})).filter(x => x.r.some(c => String(c).trim() !== "")), cols, addNew:false};
  } catch(err){ S.ui.empImp = {error: err?.message === "header" ? "Couldn't find the template header row (Employee ID, Full Name, …). Use the template from “Download template”." : err?.message === "load" ? "The spreadsheet tool couldn't load. Check your connection and try again." : "This file couldn't be read. Upload the .xlsx template."}; }
  render();
}
function validateImport(){
  const I = S.ui.empImp, C = I.cols, out = [], seen = new Map();
  const lists = {dept:cfg().departments||[], division:cfg().divisions||[], office:cfg().offices||[], jobLevel:JOBS().map(j => j.name)};
  const adds = {dept:new Set(), division:new Set(), office:new Set(), jobLevel:new Set()};
  const g = (r, k) => C[k] == null ? "" : r[C[k]];
  const fileNos = new Set(I.rows.map(x => String(g(x.r,"empNo")).trim().toUpperCase()).filter(Boolean));
  for(const {line, r} of I.rows){
    const o = {line, errors:[], warnings:[]}, str = k => String(g(r,k) ?? "").trim();
    o.empNo = str("empNo"); o.name = str("name"); o.email = str("email"); o.phone = str("phone"); o.position = str("position"); o.cno = str("cno"); o.supervisorNo = str("supervisorNo");
    const key = o.empNo.toUpperCase();
    o.existing = key ? E().find(e => (e.empNo||"").toUpperCase() === key) : null;
    for(const [k,l,req] of TPL) if(req && !str(k) && (!o.existing || k === "empNo")) o.errors.push(`${l} is empty`);
    if(key){ if(seen.has(key)) o.errors.push(`Employee ID repeats row ${seen.get(key)}`); else seen.set(key, line); }
    const gv = str("gender").toLowerCase(); o.gender = /^(f|female|p|perempuan|wanita|w)$/.test(gv) ? "F" : /^(m|male|l|laki.?laki|pria)$/.test(gv) ? "M" : ""; if(gv && !o.gender) o.warnings.push(`Gender “${str("gender")}” not recognised`);
    for(const k of ["birthDate","joinDate","cstart","cend"]){ const v = g(r,k); o[k] = v === "" ? "" : parseDateVal(v, true); if(v !== "" && !o[k]) (k === "joinDate" ? o.errors : o.warnings).push(`${TPL.find(c => c[0]===k)[1]} “${v}” isn't a valid date`); }
    for(const k of ["dept","division","office","jobLevel"]){ const v = str(k); if(!v) continue; const c = canon(lists[k], v); if(c) o[k] = c; else if(I.addNew){ o[k] = v; adds[k].add(v); o.warnings.push(`New ${TPL.find(t => t[0]===k)[1].toLowerCase()} “${v}” will be added`); } else o.errors.push(`${TPL.find(t => t[0]===k)[1]} “${v}” isn't in Settings`); }
    const sv = str("status").toLowerCase(); o.status = {probation:"Probation", active:"Active", aktif:"Active", resigned:"Resigned", keluar:"Resigned"}[sv] || ""; if(sv && !o.status) o.warnings.push(`Status “${str("status")}” not recognised`);
    const cv = str("ctype").toLowerCase(); o.ctype = {probation:"Probation", percobaan:"Probation", pkwt:"PKWT", contract:"PKWT", kontrak:"PKWT", pkwtt:"PKWTT", permanent:"PKWTT", tetap:"PKWTT"}[cv] || ""; if(cv && !o.ctype) o.warnings.push(`Contract type “${str("ctype")}” not recognised`);
    const hv = str("hrAdmin").toLowerCase(); o.hrAdmin = hv === "" ? null : /^(y|yes|ya|true|1)$/.test(hv);
    if(o.hrAdmin != null && !realAdmin()){ if(o.hrAdmin) o.warnings.push("HRD access can only be granted by Admin — ignored"); o.hrAdmin = null; }
    if(o.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(o.email)) o.warnings.push("Email looks invalid");
    if(o.supervisorNo && !fileNos.has(o.supervisorNo.toUpperCase()) && !E().some(e => (e.empNo||"").toUpperCase() === o.supervisorNo.toUpperCase())) o.warnings.push(`Supervisor ${o.supervisorNo} not found — left empty`);
    if(o.supervisorNo && o.supervisorNo.toUpperCase() === key) o.errors.push("Employee can't be their own supervisor");
    o.q = {}; for(const t of ["annual","sick"]){ const v = String(g(r,"q:"+t) ?? "").trim(); if(v === "") continue; const n = Number(v.replace(",", ".")); if(isNaN(n) || n < 0) o.warnings.push(`${LT()[t]?.name} balance “${v}” ignored`); else o.q[t] = n; }
    if(!o.existing){
      o.ctype = o.ctype || "Probation"; o.cstart = o.cstart || o.joinDate;
      if(o.ctype !== "PKWTT" && !o.cend && o.cstart){ o.cend = addDays(o.cstart, o.ctype === "Probation" ? 90 : 365); o.warnings.push(`Contract end set to ${fmt(o.cend)}`); }
      o.status = o.status || (o.ctype === "Probation" ? "Probation" : "Active");
    }
    if(o.cend && o.cstart && o.cend < o.cstart) o.errors.push("Contract end is before contract start");
    o.action = o.existing ? "update" : "new";
    out.push(o);
  }
  return {rows:out, adds};
}
function importPanel(){
  const I = S.ui.empImp, close = `<button class="ib plain" type="button" data-act="emp-imp-close" aria-label="Close import">${ic("x")}</button>`;
  const tools = `<div class="row"><button class="btn" type="button" data-act="emp-tpl">${ic("download")}Download template</button><button class="btn" type="button" data-act="emp-export">${ic("download")}Export current employees</button></div>`;
  if(!I || I.error || I.start) return `<section class="card"><div class="card-h"><span class="tile c1">${ic("upload")}</span><h2>Import employees</h2>${close}</div><div class="card-b stack">
    <ol class="steps"><li><b>Download the template.</b> It contains the exact columns, an “Allowed values” sheet with your offices, divisions, departments and job levels, and a guide.</li>
      <li><b>Fill one employee per row</b> and save as .xlsx. To bulk-update, export current employees, edit and re-upload.</li><li><b>Upload it here</b> and review the check before importing.</li></ol>
    ${tools}
    <label class="drop" id="emp-drop"><input type="file" id="emp-file" accept=".xlsx,.xls,.csv"><span class="tile c1">${ic("upload")}</span><b>Drop the filled template here or click to choose</b><span class="small muted">.xlsx, .xls or .csv</span></label>
    ${I?.error ? `<ul class="errs"><li>${esc(I.error)}</li></ul>` : ""}</div></section>`;
  if(I.loading) return `<section class="card"><div class="empty"><b>Reading ${esc(I.file)}…</b>Checking every row.</div></section>`;
  const V = validateImport(), ok = V.rows.filter(r => !r.errors.length), nNew = ok.filter(r => r.action === "new").length, nUpd = ok.length - nNew, bad = V.rows.length - ok.length;
  const missing = TPL.filter(c => c[2] && I.cols[c[0]] == null).map(c => c[1]);
  return `<section class="card"><div class="card-h"><span class="tile c1">${ic("doc")}</span><h2>${esc(I.file)}<br><span class="small muted" style="font-family:var(--f-body);font-weight:500">${V.rows.length} rows checked</span></h2>${close}</div>
    <div class="card-b stack">
      ${missing.length ? `<ul class="errs"><li>Required columns missing from the file: ${missing.map(esc).join(", ")}. Use the latest template.</li></ul>` : ""}
      <div class="grid kpis k4">${kpi("New employees", nNew, "will be created")}${kpi("Updates", nUpd, "existing Employee IDs")}${kpi("Rows with errors", bad, "will be skipped", bad ? "warn" : "")}${kpi("Warnings", V.rows.reduce((s,r) => s + r.warnings.length, 0), "imported with defaults")}</div>
      <label class="chk"><input type="checkbox" id="emp-addnew" ${I.addNew?"checked":""} ${isAdmin()?"":"disabled"}><span>Add new offices, divisions, departments and job levels found in the file to Settings${isAdmin() ? "" : " (Admin only — ask Admin to add them in Settings → Organization)"}</span></label>
      <div class="tw" style="border:1px solid var(--line);border-radius:10px;max-height:420px;overflow:auto"><table class="t"><thead><tr><th>Row</th><th>Employee</th><th>Action</th><th>Division · Office</th><th>Job level</th><th>Check</th></tr></thead><tbody>
        ${V.rows.map(r => `<tr><td class="num">${r.line}</td><td><b style="font-weight:600">${esc(r.name||"—")}</b><br><span class="small muted">${esc(r.empNo||"no ID")} · ${esc(r.position||"")}</span></td>
          <td>${r.errors.length ? `<span class="pill p-rejected">Skip</span>` : r.action === "new" ? `<span class="pill p-approved">New</span>` : `<span class="pill p-info">Update</span>`}</td>
          <td>${esc(r.division||"—")} · ${esc(r.office||"—")}</td><td>${esc(r.jobLevel||"—")}</td>
          <td style="white-space:normal;min-width:240px">${r.errors.map(x => `<div class="down small">• ${esc(x)}</div>`).join("")}${r.warnings.map(x => `<div class="small" style="color:var(--warn)">• ${esc(x)}</div>`).join("")}${!r.errors.length && !r.warnings.length ? `<span class="small up">Ready</span>` : ""}</td></tr>`).join("")}
      </tbody></table></div>
      <div class="row end"><button class="btn" type="button" data-act="emp-imp-reset">Choose another file</button><button class="btn pri" type="button" data-act="emp-imp-run" ${ok.length && !missing.length ? "" : "disabled"}>${ic("check")}Import ${ok.length} employee${ok.length===1?"":"s"}</button></div>
    </div></section>`;
}
async function runImport(){
  const I = S.ui.empImp, V = validateImport(), rows = V.rows.filter(r => !r.errors.length); if(!rows.length) return;
  const now = today(), ids = new Map(E().map(e => [(e.empNo||"").toUpperCase(), e.id]));
  for(const r of rows) if(r.action === "new") ids.set(r.empNo.toUpperCase(), uid("e"));
  const c = clone(cfg()); let cfgChanged = false;
  for(const [k, set] of Object.entries(V.adds)) for(const v of set){ cfgChanged = true; if(k === "jobLevel") c.jobLevels = (c.jobLevels||[]).concat([{name:v, access:"staff"}]); else { const key = {dept:"departments", division:"divisions", office:"offices"}[k]; c[key] = (c[key]||[]).concat([v]); } }
  if(cfgChanged) S.config = c;
  const docs = [];
  for(const r of rows){
    const supId = r.supervisorNo ? ids.get(r.supervisorNo.toUpperCase()) || null : undefined;
    if(r.action === "new"){
      const e = {id:ids.get(r.empNo.toUpperCase()), empNo:r.empNo, name:r.name, email:r.email, phone:r.phone, gender:r.gender, birthDate:r.birthDate||"", position:r.position, dept:r.dept, division:r.division, office:r.office,
        jobLevel:r.jobLevel, supervisorId:supId || null, joinDate:r.joinDate, status:r.status, exitDate:"", exitReason:"", notes:[], contracts:[], quotaLog:[]};
      e.role = roleFor(e.jobLevel, !!r.hrAdmin);
      const ct = {type:r.ctype, no:r.cno, start:r.cstart, end:r.ctype === "PKWTT" ? null : (r.cend || null)}; e.contract = ct; e.contracts = [ct];
      const grants = grantDefaults(e, r.ctype); for(const t of Object.keys(r.q)) grants[t] = r.q[t];
      e.quotaLog = grantEntries(grants, `Opening balance — imported from ${I.file}`, now);
      e.notes = [{id:uid("n"), date:now, kind:"Note", by:S.me, text:`Employee record imported from ${I.file}.`}];
      docs.push(e);
    } else {
      const e = clone(r.existing);
      for(const k of ["name","email","phone","gender","birthDate","position","dept","division","office","jobLevel","joinDate","status"]) if(r[k]) e[k] = r[k];
      if(supId !== undefined) e.supervisorId = supId;
      e.role = roleFor(e.jobLevel, r.hrAdmin == null ? e.role === "hrd" : r.hrAdmin);
      if(r.ctype && r.cstart && (r.ctype !== e.contract?.type || r.cstart !== e.contract?.start)){
        const ct = {type:r.ctype, no:r.cno, start:r.cstart, end:r.ctype === "PKWTT" ? null : (r.cend || null)}; e.contract = ct; e.contracts = (e.contracts||[]).concat([ct]);
      } else if(e.contract && (r.cend || r.cno)){ e.contract = Object.assign({}, e.contract, r.cend ? {end:r.cend} : {}, r.cno ? {no:r.cno} : {}); e.contracts = (e.contracts||[]).map(x => x.start === e.contract.start && x.type === e.contract.type ? e.contract : x); }
      for(const [t, v] of Object.entries(r.q)){ const d = v - balance(e.id, t).avail; if(d) e.quotaLog = (e.quotaLog||[]).concat([{id:uid("g"), date:now, type:t, delta:d, reason:`Balance set to ${v} — imported from ${I.file}`, by:S.me}]); }
      docs.push(e);
    }
  }
  const ok = await run(async () => { if(cfgChanged) await store.config(c); for(const d of docs) await store.put("employees", d); audit("employees_imported", I.file, `${rows.filter(r => r.action === "new").length} new, ${rows.filter(r => r.action === "update").length} updated`); },
    `Imported ${rows.filter(r => r.action === "new").length} new and updated ${rows.filter(r => r.action === "update").length} employee(s).`);
  if(ok){ S.ui.empImp = null; S.ui.empImpOpen = false; render(); }
}

/* ---------- announcements ---------- */
const ANN_CATS = {general:["General","c1"], policy:["Policy","c4"], event:["Event","c5"], holiday:["Holiday","c2"], urgent:["Urgent","c6"]};
const annVisible = () => S.D.announcements.filter(a => isHR() || ((!a.publishAt || a.publishAt <= today()) && (!a.expires || a.expires >= today())))
  .sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0) || (b.publishAt||b.createdAt).localeCompare(a.publishAt||a.createdAt));
const annIsRead = a => !!a && ((a.readBy||[]).includes(S.me) || (dbOn() && !S.preview && !!S.R.rd.find(d => d.id === S.uid)?.ann?.[a.id]));
const annReaders = a => { const s = new Set((a.readBy||[]).filter(id => emp(id) && emp(id).status !== "Resigned")); for(const d of S.R.rd) if(d.ann?.[a.id]){ const e = S.R.employees.find(x => x.userId === d.id); if(e && e.status !== "Resigned") s.add(e.id); } return s.size; };
const annUnread = () => annVisible().filter(a => !annIsRead(a) && (!a.publishAt || a.publishAt <= today()) && (!a.expires || a.expires >= today()));
const annCat = a => ANN_CATS[a.category] || ANN_CATS.general;
function annWidget(limit = 3){
  const list = annVisible().filter(a => (!a.expires || a.expires >= today()) && (!a.publishAt || a.publishAt <= today())).slice(0, limit), un = annUnread().length;
  return card("Announcements", "mega", "c3", list.length ? `<div class="list">${list.map(a => { const [cl, cc] = annCat(a), unread = !annIsRead(a);
      return `<button class="li res ann-row ${unread?"unread":""}" type="button" data-act="ann-open" data-id="${a.id}" style="border-top:1px solid var(--line);align-items:flex-start">
        <span class="tile ${cc}" style="width:36px;height:36px;border-radius:10px">${ic(a.pinned?"pin":"mega")}</span>
        <span class="grow" style="min-width:0"><span class="row" style="gap:6px"><b style="font-weight:600">${esc(a.title)}</b>${unread?`<span class="pill p-info">New</span>`:""}</span>
        <span class="small muted" style="display:block">${cl} · ${fmt((a.publishAt||a.createdAt||"").slice(0,10))} · ${esc(nm(a.authorId))}</span>
        <span class="small clamp">${esc(a.body)}</span></span></button>`; }).join("")}</div>`
    : `<div class="empty">No announcements right now.</div>`,
    `${un ? `<span class="badge">${un} new</span>` : ""}<button class="btn link" type="button" data-act="go" data-v="announcements">All ${ic("right")}</button>`);
}
function vAnnouncements(){
  const cat = S.ui.annCat || "all", all = annVisible(), list = all.filter(a => cat === "all" || a.category === cat), t = today(), staff = activeE().length;
  return `<div class="page-h"><div><h1>Announcements</h1><p>${isHR() ? "Share news, policies and events with every employee. Each announcement also sends an in-app notification." : "News, policies and events from HR for everyone at ONEderland."}</p></div>
    <div class="row">${annUnread().length ? `<button class="btn" type="button" data-act="ann-readall">${ic("check")}Mark all as read</button>` : ""}${isHR() ? `<button class="btn pri" type="button" data-act="ann-new">${ic("plus")}New announcement</button>` : ""}</div></div>
  <div class="seg" role="group" aria-label="Category"><button type="button" data-act="ann-cat" data-v="all" aria-pressed="${cat==="all"}">All <span class="muted">${all.length}</span></button>${Object.entries(ANN_CATS).map(([k,[l]]) => `<button type="button" data-act="ann-cat" data-v="${k}" aria-pressed="${cat===k}">${l}</button>`).join("")}</div>
  ${list.length ? list.map(a => { const [cl, cc] = annCat(a), unread = !annIsRead(a), open = S.ui["ann-"+a.id] || unread;
    const sched = a.publishAt && a.publishAt > t, exp = a.expires && a.expires < t, reads = annReaders(a);
    return `<article class="card ann ${a.pinned?"pinned":""}" id="ann-${a.id}"><div class="card-h" style="align-items:flex-start">
      <span class="tile ${cc}">${ic(a.category==="event"?"cal":a.category==="policy"?"doc":a.category==="urgent"?"alert":"mega")}</span>
      <div style="flex:1;min-width:0"><div class="row" style="gap:6px;margin-bottom:4px"><span class="tag">${cl}</span>${a.pinned?`<span class="tag">${ic("pin")}Pinned</span>`:""}${unread?`<span class="pill p-info">New</span>`:""}${sched?`<span class="pill p-pending">Scheduled ${fmt(a.publishAt)}</span>`:""}${exp?`<span class="pill p-cancelled">Expired</span>`:""}</div>
        <h2>${esc(a.title)}</h2><span class="small muted">${esc(nm(a.authorId))} · ${fmt((a.publishAt||a.createdAt||"").slice(0,10))}${a.expires?` · visible until ${fmt(a.expires)}`:""}${a.updatedAt && a.updatedAt !== a.createdAt ? " · edited" : ""}</span></div>
      ${isHR() ? `<div class="row" style="gap:4px"><button class="ib plain" type="button" data-act="ann-pin" data-id="${a.id}" aria-label="${a.pinned?"Unpin":"Pin"}" title="${a.pinned?"Unpin":"Pin to top"}">${ic("pin")}</button><button class="ib plain" type="button" data-act="ann-edit" data-id="${a.id}" aria-label="Edit">${ic("edit")}</button><button class="ib plain" type="button" data-act="ann-del" data-id="${a.id}" aria-label="Delete">${ic("trash")}</button></div>` : ""}</div>
      <div class="card-b"><p class="ann-body ${open?"":"clamp"}">${esc(a.body)}</p>
        <div class="row" style="justify-content:space-between;margin-top:12px">${!open || unread ? `<button class="btn link" type="button" data-act="ann-open" data-id="${a.id}">${unread ? "Mark as read" : "Read more"}</button>` : `<span></span>`}
        ${isMgmt() ? `<span class="small muted">Read by ${reads} of ${staff} employees</span>` : ""}</div></div></article>`; }).join("")
    : `<section class="card"><div class="empty"><b>No announcements</b>${isHR() ? "Post the first one to share news with everyone." : "HR announcements will appear here."}</div></section>`}`;
}
function mAnn(){
  const a = S.modal.id ? S.D.announcements.find(x => x.id === S.modal.id) : null, k = "ann-" + (a?.id || "new");
  return `<form data-draft="${k}" data-submit="ann" novalidate><div class="md-h"><span class="tile c3">${ic("mega")}</span><h2>${a ? "Edit announcement" : "New announcement"}</h2><button class="ib plain" type="button" data-act="close" aria-label="Close">${ic("x")}</button></div>
  <div class="md-b"><div class="fields">
    <label class="f full"><span>Title</span><input type="text" name="title" maxlength="140" value="${esc(dv(k,"title",a?.title||""))}" placeholder="e.g. Office closed for Nyepi Day"></label>
    <label class="f"><span>Category</span><select name="category">${Object.entries(ANN_CATS).map(([v,[l]]) => `<option value="${v}" ${dv(k,"category",a?.category||"general")===v?"selected":""}>${l}</option>`).join("")}</select></label>
    <label class="f"><span>Publish on</span><input type="date" name="publishAt" value="${esc(dv(k,"publishAt",a?.publishAt||today()))}"></label>
    <label class="f"><span>Visible until <span class="muted" style="font-weight:400">(optional)</span></span><input type="date" name="expires" value="${esc(dv(k,"expires",a?.expires||""))}"></label>
    <label class="f full"><span>Message</span><textarea name="body" rows="8" placeholder="Write the details staff need to know.">${esc(dv(k,"body",a?.body||""))}</textarea></label></div>
    <label class="chk"><input type="checkbox" name="pinned" ${dv(k,"pinned",!!a?.pinned)?"checked":""}><span>Pin to the top of Announcements and dashboards</span></label>
    <label class="chk"><input type="checkbox" name="notify" ${dv(k,"notify",!a)?"checked":""}><span>Send an in-app notification to all ${activeE().length} employees${a ? " about this update" : ""}</span></label>
    ${S.ui.annErr ? `<ul class="errs"><li>${esc(S.ui.annErr)}</li></ul>` : ""}</div>
  <div class="md-f"><button class="btn" type="button" data-act="close">Cancel</button><button class="btn pri" type="submit">${ic("mega")}${a ? "Save changes" : "Publish"}</button></div></form>`;
}
async function saveAnn(){
  if(!isHR()) return;
  const a0 = S.modal.id ? S.D.announcements.find(x => x.id === S.modal.id) : null, k = "ann-" + (a0?.id || "new"), now = new Date().toISOString();
  const a = a0 ? clone(a0) : {id:uid("a"), authorId:S.me, createdAt:now, readBy:[S.me]};
  a.title = (dv(k,"title",a0?.title||"")||"").trim(); a.body = (dv(k,"body",a0?.body||"")||"").trim(); a.category = dv(k,"category",a0?.category||"general");
  a.publishAt = dv(k,"publishAt",a0?.publishAt||today()) || today(); a.expires = dv(k,"expires",a0?.expires||"") || ""; a.pinned = !!dv(k,"pinned",!!a0?.pinned); a.updatedAt = now;
  if(!a.title || !a.body){ S.ui.annErr = "Add a title and a message."; renderModal(); return; }
  if(a.expires && a.expires < a.publishAt){ S.ui.annErr = "“Visible until” must be on or after the publish date."; renderModal(); return; }
  const send = dv(k,"notify",!a0);
  S.ui.annErr = ""; S.modal = null; delete S.drafts[k];
  await run(async () => {
    await store.put("announcements", a); audit(a0 ? "announcement_updated" : "announcement_published", a.title, "");
    if(send) for(const e of activeE()) if(e.id !== S.me) await notify(e.id, `${a0 ? "Updated" : "New"} announcement: ${a.title}`, `${annCat(a)[0]} · from ${nm(S.me)}`, "announcements", a.id, "announcement",
      {subject:`${a0 ? "Updated announcement" : "Announcement"}: ${a.title}`, heading:a.title, intro:`${a0 ? "An announcement was updated" : "New announcement"} from ${nm(S.me)} · ${annCat(a)[0]}${a.expires ? ` · visible until ${fmt(a.expires)}` : ""}.`, quote:String(a.body || "").slice(0, 1800), cta:{label:"Read in HRM", go:"announcements", ref:a.id}});
  }, a0 ? "Announcement updated." : send ? `Announcement published to ${activeE().length} employees.` : "Announcement published.");
  go("announcements");
}
async function markAnnRead(ids){
  const list = S.D.announcements.filter(a => ids.includes(a.id) && !annIsRead(a));
  if(!list.length || S.preview) return;
  if(!dbOn()){ for(const a of list) a.readBy = (a.readBy||[]).concat([S.me]); render(); return; }
  const cur = S.R.rd.find(d => d.id === S.uid), ann = Object.assign({}, cur?.ann || {});
  for(const a of list) ann[a.id] = new Date().toISOString();
  try { await withRetry(() => S.db.doc("rd/" + S.uid).set({ann, at:new Date().toISOString()})); } catch(e){ console.warn(e); }
}

/* ---------- recruitment ---------- */
function vRecruitment(){
  const on = S.ui.stage || "applied", rej = S.D.candidates.filter(c => c.stage === "rejected");
  return `<div class="page-h"><div><h1>Recruitment</h1><p>Track candidates from application to offer. Hiring a candidate creates their employee record, contract and onboarding history.</p></div>
    ${isHR() ? `<button class="btn pri" type="button" data-act="cand-new">${ic("plus")}Add candidate</button>` : ""}</div>
  <div class="seg kseg" role="group" aria-label="Stage">${STAGES.map(([k,l]) => `<button type="button" data-act="stage" data-v="${k}" aria-pressed="${on===k}">${l} <span class="muted">${S.D.candidates.filter(c => c.stage===k).length}</span></button>`).join("")}</div>
  <div class="kan">${STAGES.map(([k,l]) => { const list = S.D.candidates.filter(c => c.stage === k).sort((a,b) => b.appliedAt.localeCompare(a.appliedAt));
    return `<div class="kcol ${on===k?"on":""}"><h3>${l}<span class="badge zero">${list.length}</span></h3>${list.map(c => `<button class="kc" type="button" data-act="cand-open" data-id="${c.id}">
      <div class="who">${av(c.id,"sm")}<div><b>${esc(c.name)}</b><span>${esc(c.position)}</span></div></div>
      <div class="row" style="gap:6px"><span class="tag">${esc(c.dept)}</span><span class="tag">${esc(c.source)}</span></div>
      <span class="small muted">${k==="interview"&&c.interviewAt?`Interview ${fmt(c.interviewAt)}`:k==="hired"&&c.employeeId?`Joined as ${esc(emp(c.employeeId)?.empNo||"employee")}`:`Applied ${fmt(c.appliedAt)}`}</span></button>`).join("") || `<p class="small muted" style="padding:4px">No candidates.</p>`}</div>`; }).join("")}</div>
  ${rej.length ? `<section class="card"><div class="card-h"><h2>Not continued</h2><span class="tag">${rej.length}</span></div><div class="list">${rej.map(c => `<button class="li res" type="button" data-act="cand-open" data-id="${c.id}" style="border-top:1px solid var(--line)"><div class="who">${av(c.id,"sm")}<div><b>${esc(c.name)}</b><span>${esc(c.position)} · ${esc(c.notes||"")}</span></div></div></button>`).join("")}</div></section>` : ""}`;
}
function mCand(){
  const c = S.D.candidates.find(x => x.id === S.modal.id) || {id:uid("c"), name:"", email:"", phone:"", position:"", dept:"", source:"LinkedIn", stage:"applied", appliedAt:today(), interviewAt:"", notes:""};
  const k = "cand-"+c.id, isNew = !S.D.candidates.some(x => x.id === c.id), ro = !isHR(), depts = [...new Set(E().map(e => e.dept))];
  const f = (n, l, type="text", extra="") => `<label class="f ${extra}"><span>${l}</span><input type="${type}" name="${n}" value="${esc(dv(k,n,c[n]||""))}" ${ro?"disabled":""}></label>`;
  return `<form data-draft="${k}" data-submit="cand" data-id="${c.id}" novalidate><div class="md-h"><span class="tile c5">${ic("brief")}</span><h2>${isNew?"New candidate":esc(c.name)}</h2>${!isNew?`<span class="pill ${c.stage==="hired"?"p-hired":c.stage==="rejected"?"p-rejected":"p-info"}">${esc((STAGES.find(s=>s[0]===c.stage)||["","Not continued"])[1])}</span>`:""}<button class="ib plain" type="button" data-act="close" aria-label="Close">${ic("x")}</button></div>
  <div class="md-b"><div class="fields">${f("name","Full name","text","full")}${f("email","Email","email")}${f("phone","Phone","tel")}${f("position","Position applied")}
    <label class="f"><span>Department</span><input type="text" name="dept" list="dl-dept" value="${esc(dv(k,"dept",c.dept))}" ${ro?"disabled":""}><datalist id="dl-dept">${depts.map(d => `<option value="${esc(d)}">`).join("")}</datalist></label>
    <label class="f"><span>Source</span><select name="source" ${ro?"disabled":""}>${["LinkedIn","Jobstreet","Glints","Referral","Walk-in","Website","Other"].map(s => `<option ${dv(k,"source",c.source)===s?"selected":""}>${s}</option>`).join("")}</select></label>
    <label class="f"><span>Stage</span><select name="stage" ${ro||c.stage==="hired"?"disabled":""}>${STAGES.filter(s => s[0]!=="hired" || c.stage==="hired").concat([["rejected","Not continued"]]).map(([s,l]) => `<option value="${s}" ${dv(k,"stage",c.stage)===s?"selected":""}>${l}</option>`).join("")}</select></label>
    ${f("appliedAt","Applied on","date")}${f("interviewAt","Interview date","date")}
    <label class="f full"><span>Notes</span><textarea name="notes" ${ro?"disabled":""}>${esc(dv(k,"notes",c.notes))}</textarea></label></div>
    ${S.ui.candErr ? `<ul class="errs"><li>${esc(S.ui.candErr)}</li></ul>` : ""}
  </div><div class="md-f">${ro ? `<button class="btn" type="button" data-act="close">Close</button>` :
    `${!isNew && c.stage === "offer" ? `<button class="btn ok" type="button" data-act="hire" data-id="${c.id}">${ic("check")}Hire & create employee</button>` : ""}<span style="flex:1"></span><button class="btn" type="button" data-act="close">Cancel</button>${c.stage!=="hired"?`<button class="btn pri" type="submit">Save</button>`:""}`}</div></form>`;
}
async function saveCand(id){
  const k = "cand-"+id, c0 = S.D.candidates.find(x => x.id === id) || {id, stage:"applied", appliedAt:today()};
  const c = Object.assign(clone(c0), {});
  for(const n of ["name","email","phone","position","dept","source","stage","appliedAt","interviewAt","notes"]) c[n] = (dv(k,n,c0[n]||"")||"").toString().trim();
  if(!c.name || !c.position || !c.dept){ S.ui.candErr = "Name, position and department are required."; render(); return; }
  S.ui.candErr = ""; S.modal = null; delete S.drafts[k];
  await run(async () => { await store.put("candidates", c); audit("candidate_saved", c.name, c.stage); }, `${c.name} saved.`);
}
function nextEmpNo(){ const n = Math.max(0, ...E().map(e => Number((e.empNo||"").replace(/\D/g,"")) || 0)) + 1; return "ONE-" + String(n).padStart(4,"0"); }
function mEmp(){
  const fromCand = S.modal.cand ? S.D.candidates.find(c => c.id === S.modal.cand) : null;
  const e0 = S.modal.id ? emp(S.modal.id) : null, isNew = !e0, k = "emp-" + (S.modal.id || S.modal.cand || "new");
  const base = e0 || {name:fromCand?.name||"", email:fromCand?.email||"", phone:fromCand?.phone||"", position:fromCand?.position||"", dept:fromCand?.dept||"", gender:"", role:"employee", jobLevel:"Staff", supervisorId:"", joinDate:addDays(today(),7), status:"Probation", empNo:nextEmpNo()};
  const depts = [...new Set(E().map(e => e.dept))];
  const f = (n, l, type="text", cls="") => `<label class="f ${cls}"><span>${l}</span><input type="${type}" name="${n}" value="${esc(dv(k,n,base[n]||""))}"></label>`;
  const ctype = dv(k,"ctype","Probation"), cstart = dv(k,"cstart", dv(k,"joinDate",base.joinDate));
  return `<form data-draft="${k}" data-submit="emp" novalidate><div class="md-h"><span class="tile c1">${ic("user")}</span><h2>${fromCand ? `Hire ${esc(fromCand.name)}` : isNew ? "Add employee" : `Edit ${esc(e0.name)}`}</h2><button class="ib plain" type="button" data-act="close" aria-label="Close">${ic("x")}</button></div>
  <div class="md-b"><div class="fields">${f("name","Full name","text","full")}${f("empNo","Employee ID")}${f("email","Work email","email")}${f("phone","Phone","tel")}
    <label class="f"><span>Gender</span><select name="gender"><option value="">—</option><option value="F" ${dv(k,"gender",base.gender)==="F"?"selected":""}>Female</option><option value="M" ${dv(k,"gender",base.gender)==="M"?"selected":""}>Male</option></select></label>
    ${f("position","Position")}${orgSelect(k,"dept","Department","departments",base.dept)}${orgSelect(k,"division","Division","divisions",base.division)}${orgSelect(k,"office","Office","offices",base.office)}
    <label class="f"><span>Direct supervisor</span><select name="supervisorId"><option value="">None</option>${E().filter(x => x.id !== e0?.id).map(x => `<option value="${x.id}" ${dv(k,"supervisorId",base.supervisorId||"")===x.id?"selected":""}>${esc(x.name)} — ${esc(x.position)}</option>`).join("")}</select></label>
    <label class="f"><span>Job level</span><select name="jobLevel"><option value="">Select job level</option>${[...new Set(JOBS().map(j => j.name).concat(base.jobLevel ? [base.jobLevel] : []))].map(j => `<option ${dv(k,"jobLevel",base.jobLevel||"")===j?"selected":""}>${esc(j)}</option>`).join("")}</select><small>Job levels and their access are managed in Settings → Organization.</small></label>
    ${isAdmin() ? `<label class="chk" style="align-self:end;padding-bottom:10px"><input type="checkbox" name="hrAdmin" ${dv(k,"hrAdmin",base.role==="hrd")?"checked":""}><span><b>HRD access</b><br><span class="small muted">Manages employees, quotas, recruitment, attendance and HR settings.</span></span></label>`
      : `<div class="f"><span>System access</span><span class="small muted" style="padding-top:8px">${base.role==="hrd" ? "HRD access" : "Standard"} · only Admin can change this</span></div>`}
    ${f("joinDate","Join date","date")}${f("birthDate","Date of birth","date")}
    <label class="f"><span>Status</span><select name="status">${["Probation","Active","Resigned"].map(s => `<option ${dv(k,"status",base.status)===s?"selected":""}>${s}</option>`).join("")}</select></label>
    ${dv(k,"status",base.status) === "Resigned" ? `${f("exitDate","Last working day","date")}<label class="f"><span>Exit reason</span><input type="text" name="exitReason" value="${esc(dv(k,"exitReason",base.exitReason||""))}" placeholder="e.g. Resigned, contract ended"></label>` : ""}</div>
    ${isNew ? `<div><h3 style="margin-bottom:10px">First contract</h3><div class="fields">
      <label class="f"><span>Contract type</span><select name="ctype">${["Probation","PKWT","PKWTT"].map(t => `<option ${ctype===t?"selected":""}>${t}</option>`).join("")}</select></label>
      <label class="f"><span>Contract no.</span><input type="text" name="cno" value="${esc(dv(k,"cno",""))}" placeholder="e.g. PRB/ONE/2026/032"></label>
      <label class="f"><span>Start</span><input type="date" name="cstart" value="${esc(cstart)}"></label>
      ${ctype !== "PKWTT" ? `<label class="f"><span>End</span><input type="date" name="cend" value="${esc(dv(k,"cend", cstart ? addDays(cstart, ctype==="Probation"?90:365) : ""))}"></label>` : ""}</div></div>
      ${grantFields({gender:dv(k,"gender",base.gender)}, k, ctype)}` : ""}
    ${S.ui.empErr ? `<ul class="errs"><li>${esc(S.ui.empErr)}</li></ul>` : ""}
  </div><div class="md-f"><button class="btn" type="button" data-act="close">Cancel</button><button class="btn pri" type="submit">${fromCand?"Hire & create employee":"Save"}</button></div></form>`;
}
function orgSelect(k, name, label, list, cur){
  const opts = [...new Set((cfg()[list]||[]).concat(cur ? [cur] : []))], v = dv(k, name, cur || "");
  return `<label class="f"><span>${label}</span><select name="${name}"><option value="">Select ${label.toLowerCase()}</option>${opts.map(o => `<option ${v===o?"selected":""}>${esc(o)}</option>`).join("")}</select></label>`;
}
function staleRev(id){
  const cur = S.R.employees.find(x => x.id === id);
  if(S.modal?.rev != null && cur && Number(cur.rev || 0) !== Number(S.modal.rev || 0)){ toast(`${cur.name}'s record was changed by someone else while you were editing. Close it and open it again to see the latest version.`); return true; }
  return false;
}
async function saveEmp(){
  const fromCand = S.modal.cand ? S.D.candidates.find(c => c.id === S.modal.cand) : null, e0 = S.modal.id ? emp(S.modal.id) : null;
  if(e0 && staleRev(e0.id)) return;
  const k = "emp-" + (S.modal.id || S.modal.cand || "new");
  const base = e0 || {name:fromCand?.name||"", email:fromCand?.email||"", phone:fromCand?.phone||"", position:fromCand?.position||"", dept:fromCand?.dept||"", gender:"", role:"employee", jobLevel:"Staff", supervisorId:"", joinDate:addDays(today(),7), status:"Probation", empNo:nextEmpNo()};
  const e = e0 ? clone(e0) : {id:uid("e"), contracts:[], notes:[]};
  for(const n of ["name","empNo","email","phone","gender","position","dept","supervisorId","role","joinDate","birthDate","status","exitDate","exitReason","office","division","jobLevel"]) e[n] = (dv(k,n,base[n]||"")||"").toString().trim();
  e.role = roleFor(e.jobLevel, isAdmin() ? !!dv(k,"hrAdmin",base.role==="hrd") : base.role === "hrd");
  if(!e.jobLevel){ S.ui.empErr = "Choose a job level."; render(); return; }
  if(e.status !== "Resigned"){ e.exitDate = ""; e.exitReason = ""; } else if(!e.exitDate){ S.ui.empErr = "Add the last working day for a resigned employee."; render(); return; }
  e.supervisorId = e.supervisorId || null;
  if(!e.name || !e.position || !e.dept || !e.joinDate || !e.office || !e.division){ S.ui.empErr = "Name, position, department, division, office and join date are required."; render(); return; }
  if(E().some(x => x.empNo === e.empNo && x.id !== e.id)){ S.ui.empErr = `Employee ID ${e.empNo} is already used.`; render(); return; }
  let p = e.supervisorId, hop = 0; while(p && hop++ < 50){ if(p === e.id){ S.ui.empErr = "That supervisor would create a reporting loop."; render(); return; } p = emp(p)?.supervisorId; }
  if(!e0){
    const ctype = dv(k,"ctype","Probation"), cstart = dv(k,"cstart", e.joinDate), cend = ctype === "PKWTT" ? null : dv(k,"cend", addDays(cstart, ctype==="Probation"?90:365));
    const c = {type:ctype, no:(dv(k,"cno","")||"").trim(), start:cstart, end:cend}; e.contract = c; e.contracts = [c];
    e.quotaLog = grantEntries(readGrants(e, k, ctype), `${ctype} contract${c.no?" "+c.no:""} — initial quota`, cstart);
    e.notes = [{id:uid("n"), date:today(), kind:"Contract", by:S.me, text:`${fromCand ? `Hired through recruitment (${fromCand.source}).` : "Employee record created."} ${ctype} contract ${c.start ? "from "+fmt(c.start) : ""}${c.end ? " to "+fmt(c.end) : ""}.`}];
  }
  S.ui.empErr = ""; S.modal = null; delete S.drafts[k];
  const changed = e0 ? Object.keys(e).filter(x => JSON.stringify(e[x]) !== JSON.stringify(e0[x]) && !["rev","updatedAt","updatedBy"].includes(x)) : [];
  await run(async () => {
    await store.put("employees", e);
    audit(e0 ? "employee_updated" : fromCand ? "employee_hired" : "employee_created", `${e.empNo} ${e.name}`, e0 ? "changed: " + changed.join(", ") : "");
    if(fromCand){ const c = clone(fromCand); c.stage = "hired"; c.employeeId = e.id; await store.put("candidates", c); }
    if(!e0 && e.supervisorId) await notify(e.supervisorId, `New team member: ${e.name}`, `${e.position} · starts ${fmt(e.joinDate)}`, "profile", e.id, "team_member",
      {heading:`${e.name} is joining your team`, intro:`${e.name} was added to the HRM with you as their direct supervisor.`, rows:[["Position", e.position || "—"], ["Department", e.dept || "—"], ["Office", e.office || "—"], ["Start date", fmt(e.joinDate)]], tone:"ok", cta:{label:"View profile", go:"profile", ref:e.id}});
  }, fromCand ? `${e.name} hired as ${e.empNo}.` : `${e.name} saved.`);
  if(!e0) go("profile", {id:e.id});
}
function mContract(){
  const e = emp(S.modal.id), k = "ct-"+e.id, type = dv(k,"type","PKWT"), start = dv(k,"start", e.contract?.end ? addDays(e.contract.end,1) : today());
  return `<form data-draft="${k}" data-submit="contract" novalidate><div class="md-h"><span class="tile c2">${ic("doc")}</span><h2>New contract · ${esc(e.name)}</h2><button class="ib plain" type="button" data-act="close" aria-label="Close">${ic("x")}</button></div>
  <div class="md-b"><div class="fields"><label class="f"><span>Contract type</span><select name="type">${["Probation","PKWT","PKWTT"].map(t => `<option ${type===t?"selected":""}>${t}</option>`).join("")}</select></label>
    <label class="f"><span>Contract no.</span><input type="text" name="no" value="${esc(dv(k,"no",""))}"></label>
    <label class="f"><span>Start</span><input type="date" name="start" value="${esc(start)}"></label>
    ${type !== "PKWTT" ? `<label class="f"><span>End</span><input type="date" name="end" value="${esc(dv(k,"end", addDays(start, type==="Probation"?90:365)))}"></label>` : ""}</div>
    <label class="chk"><input type="checkbox" name="status" ${dv(k,"status",true)?"checked":""}><span>Set employee status to ${type === "Probation" ? "Probation" : "Active"}</span></label>
    ${grantFields(e, k, type)}</div>
  <div class="md-f"><button class="btn" type="button" data-act="close">Cancel</button><button class="btn pri" type="submit">Save contract</button></div></form>`;
}
function grantFields(e, k, ctype){
  const def = grantDefaults(e, ctype), on = dv(k,"grant",true);
  if(!Object.keys(def).length) return "";
  return `<div class="stack" style="gap:10px"><label class="chk"><input type="checkbox" name="grant" ${on?"checked":""}><span><b>Add leave quota for this ${ctype === "Probation" ? "probation" : "contract"}</b><br><span class="small muted">Defaults come from Settings → Leave Types. Adjust if needed.</span></span></label>
    ${on ? `<div class="fields">${Object.entries(def).map(([t,v]) => `<label class="f"><span>${esc(LT()[t].name)}</span><input type="number" min="0" max="365" step="0.5" name="g:${t}" value="${esc(dv(k,"g:"+t,v))}"></label>`).join("")}</div>` : ""}</div>`;
}
const readGrants = (e, k, ctype) => dv(k,"grant",true) ? Object.fromEntries(Object.entries(grantDefaults(e, ctype)).map(([t,v]) => [t, Number(dv(k,"g:"+t,v)) || 0])) : {};
async function saveContract(){
  if(staleRev(S.modal.id)) return;
  const e = clone(emp(S.modal.id)), k = "ct-"+e.id, type = dv(k,"type","PKWT"), start = dv(k,"start", e.contract?.end ? addDays(e.contract.end,1) : today());
  const c = {type, no:(dv(k,"no","")||"").trim(), start, end: type === "PKWTT" ? null : dv(k,"end", addDays(start, type==="Probation"?90:365))};
  if(c.end && c.end < c.start){ toast("End date must be after the start date."); return; }
  e.contract = c; e.contracts = (e.contracts||[]).concat([c]); if(dv(k,"status",true)) e.status = type === "Probation" ? "Probation" : "Active";
  const g = grantEntries(readGrants(e, k, type), `${type} contract${c.no?" "+c.no:""} — added on ${e.contracts.length > 1 ? "renewal" : "new contract"}`, c.start <= today() ? today() : c.start);
  e.quotaLog = (e.quotaLog||[]).concat(g);
  e.notes = (e.notes||[]).concat([{id:uid("n"), date:today(), kind:"Contract", by:S.me, text:`New ${type} contract${c.no?" "+c.no:""}: ${fmt(c.start)}${c.end?" – "+fmt(c.end):" (permanent)"}.${g.length ? " Leave quota added: " + g.map(x => `${LT()[x.type].name} +${x.delta}`).join(", ") + "." : ""}`}]);
  S.modal = null; delete S.drafts[k];
  await run(async () => { await store.put("employees", e); audit("contract_added", `${e.empNo} ${e.name}`, `${type} ${c.start}..${c.end || "permanent"}${g.length ? " · quota +" + g.map(x => x.type + " " + x.delta).join(", ") : ""}`); await notify(e.id, "Your contract was updated", `${type}${c.end ? " until "+fmt(c.end) : " (permanent)"}${g.length ? " · leave quota added" : ""}`, "profile", e.id, "contract",
    {heading:"Your contract was updated", intro:`HR recorded a ${e.contracts.length > 1 ? "contract renewal" : "new contract"} on your profile.`, rows:[["Type", type], ["Contract no.", c.no || "—"], ["Start", fmt(c.start)], ["End", c.end ? fmt(c.end) : "Permanent"]].concat(g.length ? [["Leave quota added", g.map(x => `${LT()[x.type].name} +${x.delta}`).join(", ")]] : []), cta:{label:"View my contract", go:"profile", ref:e.id}}); }, g.length ? "Contract saved and leave quota added." : "Contract saved.");
}

/* ---------- reminders ---------- */
function vReminders(){
  const all = S.D.reminders.concat(autoReminders()), t = today();
  const open = all.filter(r => !r.done).sort((a,b) => a.date.localeCompare(b.date)), done = all.filter(r => r.done);
  const groups = [["Overdue", open.filter(r => r.date < t)], ["Next 30 days", open.filter(r => r.date >= t && diffDays(t, r.date) <= 30)], ["Later", open.filter(r => diffDays(t, r.date) > 30)]];
  const row = r => `<div class="li"><span class="tile ${r.type==="training"?"c4":r.type==="contract"?"c2":r.type==="probation"?"c3":"c1"}" style="width:38px;height:38px">${ic(r.type==="training"?"clip":r.type==="contract"||r.type==="probation"?"doc":"clock")}</span>
    <div class="grow"><b style="font-weight:600;display:block">${esc(r.title)}</b><span class="small muted">${fmt(r.date)} · ${REM_TYPES[r.type]}${r.empId?` · ${esc(nm(r.empId))}`:""} · for ${(r.audience||[]).map(a => a==="all"?"everyone":a==="hrd"?"HRD":a).join(", ")}${r.auto?" · created automatically from the contract":""}</span>${r.note?`<br><span class="small">${esc(r.note)}</span>`:""}</div>
    ${r.auto ? (isHR()?`<button class="btn sm" type="button" data-act="contract-new" data-id="${r.empId}">Renew</button>`:"") : isHR() ? (r.done ? `<button class="btn sm" type="button" data-act="rem-undo" data-id="${r.id}">Reopen</button>` : `<button class="btn sm" type="button" data-act="rem-done" data-id="${r.id}">${ic("check")}Done</button>`) : ""}
    ${!r.auto && isHR() ? `<button class="ib plain" type="button" data-act="rem-del" data-id="${r.id}" aria-label="Delete reminder">${ic("trash")}</button>` : ""}</div>`;
  return `<div class="page-h"><div><h1>Contracts & Reminders</h1><p>Contract and probation end dates are added automatically ${cfg().contractReminderDays||30} days ahead. HRD can add sessions such as trainings or evaluations and choose who sees them.</p></div>
    ${isHR() ? `<button class="btn pri" type="button" data-act="rem-new">${ic("plus")}Add reminder</button>` : ""}</div>
  ${groups.map(([l, list]) => `<section class="card"><div class="card-h"><h2>${l}</h2><span class="tag">${list.length}</span></div>${list.length ? `<div class="list">${list.map(row).join("")}</div>` : `<div class="empty">Nothing here.</div>`}</section>`).join("")}
  ${done.length ? `<section class="card"><div class="card-h"><h2>Completed</h2></div><div class="list">${done.map(row).join("")}</div></section>` : ""}`;
}
function mRem(){
  const k = "rem", pre = S.modal.emp || "";
  const aud = dv(k,"audience", pre ? ["hrd","supervisor"] : ["hrd"]);
  return `<form data-draft="${k}" data-submit="rem" novalidate><div class="md-h"><span class="tile c2">${ic("clock")}</span><h2>Add reminder</h2><button class="ib plain" type="button" data-act="close" aria-label="Close">${ic("x")}</button></div>
  <div class="md-b"><div class="fields"><label class="f full"><span>Title</span><input type="text" name="title" value="${esc(dv(k,"title",""))}" placeholder="e.g. Customer service training"></label>
    <label class="f"><span>Date</span><input type="date" name="date" value="${esc(dv(k,"date",addDays(today(),7)))}"></label>
    <label class="f"><span>Type</span><select name="type">${Object.entries(REM_TYPES).map(([v,l]) => `<option value="${v}" ${dv(k,"type","training")===v?"selected":""}>${l}</option>`).join("")}</select></label>
    <label class="f full"><span>Employee <span class="muted" style="font-weight:400">(optional)</span></span><select name="empId"><option value="">Not about a specific employee</option>${E().map(e => `<option value="${e.id}" ${dv(k,"empId",pre)===e.id?"selected":""}>${esc(e.name)}</option>`).join("")}</select></label></div>
    <fieldset style="border:0;padding:0;margin:0"><legend style="font-size:.8rem;font-weight:600;color:var(--ink2);margin-bottom:8px">Show to</legend><div class="row">
      ${[["hrd","HRD"],["supervisor","Employee's supervisor"],["employee","The employee"],["all","Everyone"]].map(([v,l]) => `<label class="chk"><input type="checkbox" name="audience" data-multi="1" value="${v}" ${aud.includes(v)?"checked":""}><span>${l}</span></label>`).join("")}</div></fieldset>
    <label class="f"><span>Note</span><textarea name="note">${esc(dv(k,"note",""))}</textarea></label>
    ${S.ui.remErr ? `<ul class="errs"><li>${esc(S.ui.remErr)}</li></ul>` : ""}</div>
  <div class="md-f"><button class="btn" type="button" data-act="close">Cancel</button><button class="btn pri" type="submit">Save reminder</button></div></form>`;
}
async function saveRem(){
  const k = "rem", pre = S.modal.emp || "";
  const r = {id:uid("m"), title:(dv(k,"title","")||"").trim(), date:dv(k,"date",addDays(today(),7)), type:dv(k,"type","training"), empId:dv(k,"empId",pre)||null,
    audience:dv(k,"audience", pre ? ["hrd","supervisor"] : ["hrd"]), note:(dv(k,"note","")||"").trim(), done:false, createdBy:S.me};
  if(!r.title || !r.date){ S.ui.remErr = "Add a title and date."; render(); return; }
  if(!r.audience.length){ S.ui.remErr = "Choose who should see this reminder."; render(); return; }
  S.ui.remErr = ""; S.modal = null; delete S.drafts[k];
  await run(async () => {
    await store.put("reminders", r); audit("reminder_added", r.title, r.date);
    const targets = new Set(); if(r.empId && r.audience.includes("employee")) targets.add(r.empId);
    if(r.empId && r.audience.includes("supervisor") && emp(r.empId)?.supervisorId) targets.add(emp(r.empId).supervisorId);
    if(r.audience.includes("all")) activeE().forEach(e => targets.add(e.id));
    if(r.audience.includes("hrd")) activeE().filter(e => e.role === "hrd").forEach(e => targets.add(e.id));
    for(const to of targets) if(to !== S.me) await notify(to, `Reminder: ${r.title}`, `${REM_TYPES[r.type] || "Reminder"} · ${fmt(r.date)}`, "dashboard", null, "reminder",
      {heading:r.title, intro:`${nm(S.me)} added a ${String(REM_TYPES[r.type] || "reminder").toLowerCase()} for ${fmt(r.date)}${r.empId && r.empId !== to ? ` about ${nm(r.empId)}` : ""}.`, rows:[["Date", fmt(r.date)], ["Type", REM_TYPES[r.type] || "Reminder"]], quote:r.note || "", tone:"warn", cta:{label:"Open HRM", go:"dashboard", ref:""}});
  }, "Reminder saved.");
}

/* ---------- settings ---------- */
function vSettings(){
  const tabs = [["types","Leave Types","hr"],["rules","Leave & Contract Rules","hr"],["holidays","Holidays","hr"],["attendance","Attendance","hr"],["criteria","Review Criteria","hr"],
    ["flows","Approval Flows","admin"],["org","Organization","admin"],["company","Company","admin"],["notif","Notifications","hr"]];
  if(!tabs.some(t => t[0] === S.ui.stab)) S.ui.stab = "types";
  const tab = S.ui.stab, owner = tabs.find(t => t[0] === tab)[2], ro = owner === "admin" ? !isAdmin() : !isHR(), roS = !isAdmin(), roQ = !isHR();
  let body = "";
  if(tab === "flows"){
    const rows = [["wfh","Work From Home"]].concat(Object.entries(LT()).map(([k,t]) => [k, t.name]));
    body = `<div class="card-b"><p class="muted">Each request goes through the steps in order. A step is skipped if it would be the requester themselves or the same person as an earlier step. Changes apply to new requests; requests already in progress keep their flow.</p></div>
    <div class="tw"><table class="t rt"><thead><tr><th>Request type</th><th>Approval steps</th></tr></thead><tbody>${rows.map(([k,l]) => { const f = cfg().flows[k] || [];
      const avail = Object.keys(APPROVERS).concat(JOBS().filter(j => j.access !== "gm" && j.access !== "staff").map(j => "job:" + j.name)).filter(a => !f.includes(a));
      return `<tr><td class="wide"><b style="font-weight:600">${esc(l)}</b><br><span class="small muted">${f.length} layer${f.length===1?"":"s"}</span></td><td class="wide"><div class="flow-row">${f.map((a,i) => `${i?`<span class="arrow">${ic("right")}</span>`:""}<span class="flow-step">${i+1}. ${esc(apLabel(a))}${ro?"":`
        ${i>0?`<button type="button" data-act="flow-mv" data-k="${k}" data-i="${i}" data-v="-1" aria-label="Move earlier">${ic("left")}</button>`:""}${i<f.length-1?`<button type="button" data-act="flow-mv" data-k="${k}" data-i="${i}" data-v="1" aria-label="Move later">${ic("right")}</button>`:""}
        ${f.length>1?`<button type="button" data-act="flow-rm" data-k="${k}" data-i="${i}" aria-label="Remove step">${ic("x")}</button>`:""}`}</span>`).join("")}
        ${!ro && avail.length ? `<select class="flow-add" data-k="${k}" aria-label="Add approval step" style="width:auto;min-height:32px;padding:4px 8px"><option value="">+ Add step</option>${avail.map(a => `<option value="${esc(a)}">${esc(apLabel(a))}${a.startsWith("job:")?" (job level)":""}</option>`).join("")}</select>` : ""}</div></td></tr>`; }).join("")}</tbody></table></div>`;
  } else if(tab === "types"){
    body = `<div class="card-b"><p class="muted">Leave quota lives on each employee's profile. HRD sets how many days are added automatically when a contract is created or renewed (separately for probation contracts). Types without “Limit by quota” have no balance, e.g. Unpaid Leave. Changes save when you leave a field.</p>
      <p class="small muted" style="margin-top:6px">HRD sets the quota columns. Admin sets the leave type structure (name, quota limit, counting, paid, document, eligibility, active).</p></div>
    <div class="tw"><table class="t"><thead><tr><th>Name</th><th>Limit by quota</th><th>Added on renewal</th><th>Added on probation</th><th>Counted in</th><th>Paid</th><th>Document</th><th>For</th><th>Active</th></tr></thead><tbody>${Object.entries(LT()).map(([k,t]) => `<tr>
      <td><input type="text" data-cfg="leaveTypes.${k}.name" value="${esc(t.name)}" ${roS?"disabled":""} style="min-width:170px"></td>
      <td><input type="checkbox" data-cfg="leaveTypes.${k}.track" ${t.track?"checked":""} ${roS?"disabled":""} aria-label="Limit by quota"></td>
      <td><input type="number" min="0" max="365" data-cfg="leaveTypes.${k}.renewal" value="${Number(t.renewal)||0}" ${roQ||!t.track?"disabled":""} style="width:84px" aria-label="Days added on renewal"></td>
      <td><input type="number" min="0" max="365" data-cfg="leaveTypes.${k}.probation" value="${Number(t.probation)||0}" ${roQ||!t.track?"disabled":""} style="width:84px" aria-label="Days added on probation"></td>
      <td><select data-cfg="leaveTypes.${k}.unit" ${roS?"disabled":""}><option value="work" ${t.unit==="work"?"selected":""}>Working days</option><option value="calendar" ${t.unit==="calendar"?"selected":""}>Calendar days</option></select></td>
      <td><input type="checkbox" data-cfg="leaveTypes.${k}.paid" ${t.paid?"checked":""} ${roS?"disabled":""} aria-label="Paid"></td>
      <td><input type="checkbox" data-cfg="leaveTypes.${k}.doc" ${t.doc?"checked":""} ${roS?"disabled":""} aria-label="Requires document"></td>
      <td><select data-cfg="leaveTypes.${k}.gender" ${roS?"disabled":""}><option value="all" ${t.gender==="all"?"selected":""}>Everyone</option><option value="F" ${t.gender==="F"?"selected":""}>Female</option><option value="M" ${t.gender==="M"?"selected":""}>Male</option></select></td>
      <td><input type="checkbox" data-cfg="leaveTypes.${k}.active" ${t.active?"checked":""} ${roS?"disabled":""} aria-label="Active"></td></tr>`).join("")}</tbody></table></div>`;
  } else if(tab === "rules"){
    const n = (p, l, h) => `<label class="f"><span>${l}</span><input type="number" min="0" max="365" data-cfg="${p}" value="${p.split(".").reduce((o,x)=>o?.[x], cfg())}" ${ro?"disabled":""}><small>${h}</small></label>`;
    body = `<div class="card-b fields">${n("wfhMaxPerMonth","WFH days per month","0 means no limit.")}${n("contractReminderDays","Contract reminder (days before end)","Contracts ending within this window show as reminders and on the dashboard.")}</div>`;
  } else if(tab === "holidays"){
    const hs = [...(cfg().holidays||[])].sort((a,b) => a.date.localeCompare(b.date));
    body = `<div class="card-b"><p class="muted">Public holidays and collective leave days (cuti bersama) aren't counted as leave days. Add them from the government's annual decree.</p></div>
    <div class="list">${hs.map(h => `<div class="li"><span class="tag">${fmt(h.date)}</span><span class="grow">${esc(h.name)} <span class="small muted">· ${h.offices?.length ? h.offices.map(esc).join(", ") : "all offices"}</span></span>${ro?"":`<button class="ib plain" type="button" data-act="hol-del" data-i="${(cfg().holidays||[]).indexOf(h)}" aria-label="Remove ${esc(h.name)}">${ic("trash")}</button>`}</div>`).join("") || `<div class="empty">No holidays added yet.</div>`}</div>
    ${ro ? "" : `<form class="card-b row" data-draft="hol" data-submit="hol" style="border-top:1px solid var(--line);align-items:flex-end"><label class="f" style="flex:0 1 180px"><span>Date</span><input type="date" name="date" value="${esc(dv("hol","date",""))}"></label>
      <label class="f" style="flex:1 1 220px"><span>Name</span><input type="text" name="name" value="${esc(dv("hol","name",""))}" placeholder="e.g. Nyepi Day"></label><button class="btn pri" type="submit">Add holiday</button>
      <fieldset style="border:0;padding:0;margin:0;flex:1 1 100%"><legend class="small muted" style="margin-bottom:6px">Applies to (leave empty for all offices)</legend><div class="row">${(cfg().offices||[]).map(o => `<label class="chk"><input type="checkbox" name="offices" data-multi="1" value="${esc(o)}" ${(dv("hol","offices",[])||[]).includes(o)?"checked":""}><span>${esc(o)}</span></label>`).join("")}</div></fieldset></form>`}`;
  } else if(tab === "access"){
    const accts = [...S.D.employees].filter(e => e.status !== "Resigned").sort((a,b) => (b.admin?1:0) - (a.admin?1:0) || (b.role==="hrd"?1:0) - (a.role==="hrd"?1:0) || a.name.localeCompare(b.name));
    const ex = COLS.reduce((n,c) => n + S.D[c].filter(x => x.example).length, 0);
    const Y = `<span class="up">✓</span>`, N = `<span class="muted">—</span>`;
    const matrix = [["View own profile, apply leave & WFH", Y,Y,Y,Y,Y],["Approve team requests, write team reviews", N,Y,Y,Y,Y],["Company-wide view of all employees", N,N,Y,Y,Y],
      ["Employees, contracts, leave quotas, import", N,N,N,Y,Y],["Recruitment, attendance upload, reminders, announcements, review tasks", N,N,N,Y,Y],
      ["Leave quotas & rules, holidays, attendance hours, review criteria", N,N,N,Y,Y],["Approval flows, organization, job levels & access types", N,N,N,N,Y],
      ["Company branding", N,N,N,N,Y],["Which events send email (Settings → Notifications)", N,N,N,Y,Y],["Grant HRD / Admin access, remove sample data", N,N,N,N,Y]];
    body = `<div class="card-b stack"><h3 class="sub" style="margin:0">Who can do what</h3>
      <div class="tw" style="border:1px solid var(--line);border-radius:10px"><table class="t"><thead><tr><th>Permission</th><th>Staff</th><th>Supervisor / Manager</th><th>General Manager</th><th>HRD</th><th>Admin</th></tr></thead><tbody>
        ${matrix.map(r => `<tr><td style="white-space:normal">${r[0]}</td>${r.slice(1).map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <p class="small muted">Supervisor, Manager and General Manager come from each person's job level (Organization → Job levels). HRD and Admin access are given per person below.</p></div>
    <div class="card-h" style="border-top:1px solid var(--line)"><h2>System access</h2></div>
    <div class="tw"><table class="t rt"><thead><tr><th>Person</th><th>Job level</th><th>HRD access</th><th>Admin</th></tr></thead><tbody>
      ${accts.map(e => `<tr><td class="wide">${who(e.id, e.system ? "System account" : e.position)}</td><td data-l="Job level">${esc(e.system ? "—" : jobOf(e))}</td>
        <td data-l="HRD access"><input type="checkbox" data-access="hrd" data-id="${e.id}" ${e.role==="hrd"?"checked":""} ${e.system?"disabled":""} aria-label="HRD access for ${esc(e.name)}"></td>
        <td data-l="Admin"><input type="checkbox" data-access="admin" data-id="${e.id}" ${e.admin?"checked":""} aria-label="Admin access for ${esc(e.name)}"></td></tr>`).join("")}</tbody></table></div>
    <div class="card-h" style="border-top:1px solid var(--line)"><h2>Data</h2></div>
    <div class="card-b stack"><p class="muted">Remove the fictional sample company before going live. This deletes ${ex} sample record(s) — employees, requests, candidates, reviews, attendance, announcements and notifications marked as samples — plus anything that belongs to the removed sample employees. Settings, offices, divisions and job levels are kept. This can't be undone.</p>
      <div>${ex ? `<button class="btn bad" type="button" data-act="wipe-sample">${ic("trash")}${S.ui.wipe ? "Click again to delete permanently" : "Remove sample data"}</button>` : `<span class="pill p-approved">No sample data left</span>`}</div></div>`;
  } else if(tab === "company"){
    const c = company();
    body = `<div class="card-b stack"><p class="muted">Shown in the sidebar for everyone. The logo is resized automatically; a wide PNG with a transparent background looks best.</p>
      <div class="row" style="gap:20px;align-items:center"><div class="logo-prev">${c.logo ? `<img src="${esc(assetSrc(c.logo))}" alt="Current logo">` : `<span class="logo" style="width:56px;height:56px;font-size:1.2rem">${esc(c.name.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase())}</span>`}</div>
        ${ro ? "" : `<div class="row"><label class="btn">${ic("upload")}${c.logo ? "Change logo" : "Upload logo"}<input type="file" accept="image/*" id="logo-file" style="display:none"></label>${c.logo ? `<button class="btn bad" type="button" data-act="logo-del">Remove logo</button>` : ""}</div>`}</div>
      <div class="fields"><label class="f"><span>Company name</span><input type="text" data-cfg="company.name" value="${esc(c.name)}" ${ro?"disabled":""}></label>
        <label class="f"><span>Tagline under the name</span><input type="text" data-cfg="company.tagline" value="${esc(c.tagline)}" ${ro?"disabled":""}></label></div></div>`;
  } else if(tab === "org"){
    body = `<div class="card-b"><p class="muted">Offices, divisions and departments used on employee profiles, filters and reports. Renaming updates every employee who uses that name. An entry can only be removed when no employee uses it.</p></div>
      ${jobSection(ro)}${orgSection("offices", ro)}${orgSection("divisions", ro)}${orgSection("departments", ro)}`;
  } else if(tab === "attendance"){
    const sc = sched();
    body = `<div class="card-b stack"><p class="muted">Used to calculate late arrivals, early leave and absences in the Attendance Report.</p>
      <div class="fields"><label class="f"><span>Work starts</span><input type="time" data-cfg="schedule.start" value="${esc(sc.start)}" ${ro?"disabled":""}></label>
        <label class="f"><span>Work ends</span><input type="time" data-cfg="schedule.end" value="${esc(sc.end)}" ${ro?"disabled":""}></label>
        <label class="f"><span>Grace period (minutes)</span><input type="number" min="0" max="120" data-cfg="schedule.grace" value="${Number(sc.grace)||0}" ${ro?"disabled":""}><small>Check-ins within this many minutes after start aren't counted as late.</small></label></div>
      <fieldset style="border:0;padding:0;margin:0"><legend style="font-size:.8rem;font-weight:600;color:var(--ink2);margin-bottom:8px">Working days</legend><div class="row">${[1,2,3,4,5,6,0].map(w => `<label class="chk"><input type="checkbox" data-wd="${w}" ${(sc.workdays||[]).includes(w)?"checked":""} ${ro?"disabled":""}><span>${DOWL[w]}</span></label>`).join("")}</div></fieldset></div>`;
  } else if(tab === "notif"){
    const groups = [...new Set(Object.values(NOTIFY).map(d => d[5]))], noMail = activeE().filter(e => !e.system && (!e.email || /@example\.com$/i.test(e.email)));
    body = `<div class="card-b stack"><p class="muted">Every event below always appears in the person's notification bell. Tick <b>Email</b> to also send it to their work email — sent by the HRM's mail server, only to employees in the directory, with a button that opens the right page.</p>
      ${noMail.length ? `<div class="note warn">${ic("alert")}<div><b>${noMail.length} active employee${noMail.length === 1 ? "" : "s"} without a real work email</b> (${esc(noMail.slice(0, 4).map(e => e.name).join(", "))}${noMail.length > 4 ? "…" : ""}) won't receive emails. Add the email on their profile.</div></div>` : `<div class="note">${ic("check")}<div>Every active employee has a work email on file.</div></div>`}
      <div class="row"><button class="btn" type="button" data-act="mail-test">${ic("mail")}Send a test email to me</button><span class="small muted">${esc(me()?.email || "No email on your profile")}</span></div></div>
    ${groups.map(g => `<div class="card-h" style="border-top:1px solid var(--line)"><h2>${esc(g)}</h2></div>
      <div class="tw"><table class="t rt nt-t"><thead><tr><th>Event</th><th>Sent to</th><th class="c">In-app</th><th class="c">Email</th></tr></thead><tbody>
      ${Object.entries(NOTIFY).filter(([, d]) => d[5] === g).map(([k, d]) => `<tr><td data-l="Event"><span class="nt-ev"><span class="tile c${d[3]}">${ic(d[2])}</span><b>${esc(d[0])}</b></span></td>
        <td data-l="Sent to" class="muted">${esc(d[1])}</td><td data-l="In-app" class="c">${ic("check")}</td>
        <td data-l="Email" class="c"><label class="sw"><input type="checkbox" data-cfg="notify.${k}" ${emailOn(k) ? "checked" : ""} ${ro ? "disabled" : ""} aria-label="Email for ${esc(d[0])}"><span></span></label></td></tr>`).join("")}</tbody></table></div>`).join("")}`;
  } else {
    const cr = cfg().criteria || [];
    body = `<div class="card-b"><p class="muted">Supervisors score each criterion from 1 to 5. Changing criteria affects new reviews only.</p></div>
      <div class="list">${cr.map((c,i) => `<div class="li"><span class="tag">${i+1}</span><span class="grow">${esc(c)}</span>${ro||cr.length<2?"":`<button class="ib plain" type="button" data-act="crit-del" data-i="${i}" aria-label="Remove ${esc(c)}">${ic("trash")}</button>`}</div>`).join("")}</div>
      ${ro ? "" : `<form class="card-b row" data-draft="crit" data-submit="crit" style="border-top:1px solid var(--line);align-items:flex-end"><label class="f" style="flex:1 1 240px"><span>New criterion</span><input type="text" name="name" value="${esc(dv("crit","name",""))}" placeholder="e.g. Customer focus"></label><button class="btn pri" type="submit">Add</button></form>`}`;
  }
  const roleNote = isAdmin() ? "You're signed in as Admin: you can change every setting." : isHR() ? "As HRD you manage HR policy: leave quotas, rules, holidays, attendance hours and review criteria. Tabs marked Admin are managed by the Admin." : "Only HRD and Admin can change settings. You're viewing them read-only.";
  return `<div class="page-h"><div><h1>Settings</h1><p>${roleNote}</p></div></div>
  <section class="card"><div class="tabs" role="tablist" style="padding:0 14px">${tabs.map(([k,l,o]) => `<button type="button" role="tab" data-act="stab" data-v="${k}" aria-selected="${tab===k}">${l}${o==="admin" && !isAdmin() ? ` <span class="tag" style="margin-left:4px">Admin</span>` : ""}</button>`).join("")}</div>
    ${ro && isHR() ? `<div class="card-b" style="padding-bottom:0"><div class="note">${ic("info")}<div>This section is managed by the Admin. You can view it but not change it.</div></div></div>` : ""}${body}</section>`;
}
/* Who may change which settings: Admin owns system structure; HRD owns HR policy. */
const ADMIN_CFG = /^(company|jobLevels|offices|divisions|departments|flows|email|system|timezone|schemaVersion|signingSince)(\.|$)|^leaveTypes\.[^.]+\.(name|track|unit|paid|doc|gender|active)$/;
const canCfg = path => isAdmin() || (isHR() && !ADMIN_CFG.test(path));
async function setCfg(path, value){
  if(!canCfg(path)){ toast(ADMIN_CFG.test(path) ? "Only Admin can change this setting." : "Only HRD can change this setting."); render(); return; }
  const c = clone(cfg()), ks = path.split("."); let o = c; for(let i = 0; i < ks.length-1; i++){ o[ks[i]] = o[ks[i]] || {}; o = o[ks[i]]; } const old = o[ks[ks.length-1]]; o[ks[ks.length-1]] = value;
  await run(async () => { await store.config(c); audit("setting_changed", path, `${JSON.stringify(old ?? null).slice(0,80)} → ${JSON.stringify(value).slice(0,80)}`); }, "Settings saved.");
}

/* ================= modal & render ================= */
function renderModal(){
  const el = document.getElementById("modal");
  if(!S.modal){ el.innerHTML = ""; return; }
  const inner = {req:() => mReq(S.modal.id), task:mTask, review:mReview, cand:mCand, emp:mEmp, contract:mContract, rem:mRem, quota:mQuota, ann:mAnn}[S.modal.kind]?.() || "";
  el.innerHTML = `<div class="mb" data-act="backdrop"><div class="md ${S.modal.kind==="review"||S.modal.kind==="emp"?"wide":""}" role="dialog" aria-modal="true">${inner}</div></div>`;
}
async function wipeSample(){
  const gone = new Set(S.R.employees.filter(e => e.example && !e.system).map(e => e.id));
  const owned = (c, x) => x.example || ({private:gone.has(x.id), requests:gone.has(x.empId), attendance:gone.has(x.empId), reviews:gone.has(x.empId), notifs:gone.has(x.to), tasks:gone.has(x.supervisorId), reminders:x.empId && gone.has(x.empId)})[c];
  const plan = COLS.flatMap(c => (S.R[c] || []).filter(x => (c === "employees" ? gone.has(x.id) : owned(c, x))).map(x => [c, x.id]));
  const ok = await run(async () => { for(const [c, id] of plan) await withRetry(() => dbOn() ? S.db.collection(c).doc(id).delete() : (S.R[c] = S.R[c].filter(x => x.id !== id), rebuild())); audit("sample_data_removed", plan.length + " records", ""); }, `Removed ${plan.length} sample record(s). You can now add or import your real employees.`);
  if(ok){ S.view = "dashboard"; render(); }
}
/* ================= schema migrations (pure functions, also used when restoring older backups) ================= */
function splitEmployees(list){
  const pub = [], priv = [];
  for(const e0 of list){
    const e = Object.assign({}, e0), p = {id:e.id};
    for(const k of PRIVATE_FIELDS) if(e[k] !== undefined){ p[k] = e[k]; delete e[k]; }
    e.granted = grantedOf(p.quotaLog); e.bday = p.birthDate ? p.birthDate.slice(5) : (e.bday || ""); e.rev = Number(e.rev) || 1;
    p.rev = e.rev; pub.push(e); priv.push(p);
  }
  return {pub, priv};
}
const MIGRATIONS = {
  /* 1 → 2: confidential employee fields move to the private collection; signing starts */
  1: (data, config, now) => {
    const priv = new Map((data.private || []).map(p => [p.id, p]));
    const s = splitEmployees(data.employees || []);
    for(const p of s.priv){ const ex = priv.get(p.id); priv.set(p.id, ex ? Object.assign({}, p, ex) : p); }
    data.employees = s.pub.map(e => Object.assign(e, {granted:grantedOf(priv.get(e.id)?.quotaLog)}));
    data.private = [...priv.values()];
    config.schemaVersion = 2; config.signingSince = config.signingSince || now;
    return {data, config};
  }
};
function migrateData(data, config, from){
  const now = new Date().toISOString(); let v = from || 1;
  data = Object.assign({}, data); config = Object.assign({}, config || {});
  while(v < SCHEMA){ const m = MIGRATIONS[v]; if(!m) throw new Error("No migration from schema " + v); ({data, config} = m(data, config, now)); v++; }
  return {data, config};
}
const dbSchema = () => Number(cfg().schemaVersion) || 1;
async function runMigration(){
  if(!realAdmin()) return;
  S.ui.migrating = true; render();
  try {
    const b = await buildBackup(); await download(backupName(b, "before-upgrade"), JSON.stringify(b));
    const {data, config} = migrateData({employees:S.R.employees, private:S.R.private}, cfg(), dbSchema());
    for(const p of data.private) await withRetry(() => S.db.collection("private").doc(p.id).set(p));
    for(const e of data.employees) await withRetry(() => S.db.collection("employees").doc(e.id).set(e));
    await S.db.collection("config").doc("main").set(config);
    audit("schema_migrated", "schema " + SCHEMA, "app " + APP_VERSION);
    toast(`Database upgraded to schema ${SCHEMA}.`); scheduleSync(true);
  } catch(e){ console.error(e); toast("The upgrade stopped before finishing. Your pre-upgrade backup was downloaded; run it again or restore."); }
  S.ui.migrating = false; render();
}

/* ================= backup & restore ================= */
const backupName = (b, tag) => `${(company().name||"HRM").replace(/[^A-Za-z0-9]+/g,"-")}-HRM-backup-${b.createdAt.slice(0,16).replace(/[:T]/g,"-")}${tag ? "-" + tag : ""}.json`;
async function buildBackup(){
  const data = {};
  if(dbOn()){ for(const c of BACKUP_COLS){ const snap = await withRetry(() => S.db.collection(c).get()); data[c] = snap.docs.map(d => Object.assign({id:d.id}, d.data())); } }
  else { for(const c of BACKUP_COLS) data[c] = clone(S.R[c] || []); }
  const config = clone(cfg()), createdAt = new Date().toISOString();
  const counts = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length]));
  const body = JSON.stringify({schema:dbSchema(), data, config});
  return {format:"onederland-hrm-backup", version:1, app:APP_VERSION, schema:dbSchema(), createdAt, by:{id:S.realEmpId || S.me, name:nm(S.realEmpId || S.me)}, counts, checksum:await sha256(body), data, config};
}
const lastBackup = () => [...S.D.backups].sort((a,b) => b.at.localeCompare(a.at))[0];
const backupAgeDays = () => { const b = lastBackup(); return b ? Math.floor((Date.now() - new Date(b.at)) / 864e5) : null; };
async function recordBackup(b, dest, extra){
  const meta = Object.assign({id:uid("bk"), at:b.createdAt, by:S.realEmpId || S.me, dest, name:backupName(b), schema:b.schema, counts:b.counts, checksum:b.checksum, size:JSON.stringify(b).length}, extra || {});
  if(dbOn()) await withRetry(() => S.db.collection("backups").doc(meta.id).set(meta)); else S.R.backups.push(meta), rebuild();
  audit("backup_" + dest, meta.name, `${Object.values(b.counts).reduce((s,n) => s+n, 0)} records`);
}
async function backupNow(dest){
  if(!S.canEdit && dbOn()){ toast("Backups need HRD or Admin (Editor) access."); return; }
  S.ui.busy = "Preparing backup…"; render();
  try {
    const b = await buildBackup(), text = JSON.stringify(b);
    if(dest === "drive"){
      const r = await saveToDrive(backupName(b), text);
      if(!r.ok){ toast(r.reason); S.ui.busy = ""; render(); return; }
      await recordBackup(b, "drive", {fileId:r.id || "", link:r.link || ""}); toast("Backup saved to cloud storage.");
    } else { await download(backupName(b), text); await recordBackup(b, "download"); }
  } catch(e){ console.error(e); toast("The backup couldn't be completed. Check your connection and try again."); }
  S.ui.busy = ""; render();
}
async function saveToDrive(name, text){
  const mcp = await getMcp(); if(!mcp) return {ok:false, reason:"Cloud storage isn't available right now. Use “Download” instead."};
  try {
    const args = {title:name, textContent:text, contentMimeType:"application/json", disableConversionToGoogleType:true};
    if(cfg().system?.driveFolder) args.parentId = cfg().system.driveFolder;
    const res = await mcp.callTool("Google Drive", "create_file", args);
    const p = res?.payload || {};
    return {ok:true, id:p.id || p.fileId || p.file?.id || "", link:p.webViewLink || p.alternateLink || p.url || ""};
  } catch(err){ const c = err && err.code;
    return {ok:false, reason: "Cloud storage couldn't save the file. Use “Download” instead."}; }
}
async function readRestoreFile(file){
  S.ui.restore = {loading:true, file:file.name}; render();
  try {
    const obj = JSON.parse(await file.text());
    if(obj.format !== "onederland-hrm-backup" || !obj.data) throw new Error("format");
    const ok = (await sha256(JSON.stringify({schema:obj.schema, data:obj.data, config:obj.config}))) === obj.checksum;
    const sel = Object.fromEntries(Object.keys(obj.data).map(c => [c, !["notifs","rd","dec","links"].includes(c)])); sel.config = true;
    S.ui.restore = {file:file.name, obj, valid:ok, sel, mode:"replace", confirm:""};
  } catch(e){ S.ui.restore = {error: e.message === "format" ? "This isn't an ONEderland HRM backup file." : "The file couldn't be read as a backup (JSON)."}; }
  render();
}
function restorePlan(){
  const R0 = S.ui.restore, out = [];
  let {data, config} = {data:R0.obj.data, config:R0.obj.config};
  if((R0.obj.schema || 1) < SCHEMA) ({data, config} = migrateData(clone(data), clone(config), R0.obj.schema || 1));
  for(const [c, docs] of Object.entries(data)){
    if(!R0.sel[c]) continue;
    const cur = new Map((S.R[c] || []).map(d => [d.id, d])), inB = new Set(docs.map(d => d.id));
    const upsert = docs.filter(d => JSON.stringify(cur.get(d.id)) !== JSON.stringify(d));
    const del = R0.mode === "replace" ? [...cur.keys()].filter(id => !inB.has(id)) : [];
    out.push({c, total:docs.length, upsert, del});
  }
  return {plan:out, config, migrated:(R0.obj.schema || 1) < SCHEMA};
}
async function runRestore(){
  const R0 = S.ui.restore; if(!realAdmin() || !R0?.obj) return;
  if(R0.confirm !== "RESTORE"){ toast("Type RESTORE to confirm."); return; }
  const {plan, config} = restorePlan(), total = plan.reduce((s,p) => s + p.upsert.length + p.del.length, 0) + (R0.sel.config ? 1 : 0);
  R0.progress = {done:0, total}; render();
  try {
    const safety = await buildBackup(); await download(backupName(safety, "before-restore"), JSON.stringify(safety)); await recordBackup(safety, "download", {note:"automatic, before restore"});
    for(const p of plan){
      for(const d of p.upsert){ await withRetry(() => S.db.collection(p.c).doc(d.id).set(d)); R0.progress.done++; if(R0.progress.done % 10 === 0) render(); }
      for(const id of p.del){ await withRetry(() => S.db.collection(p.c).doc(id).delete()); R0.progress.done++; if(R0.progress.done % 10 === 0) render(); }
    }
    if(R0.sel.config) await S.db.collection("config").doc("main").set(config);
    audit("restore", R0.file, `${total} writes from backup of ${R0.obj.createdAt}`);
    toast(`Restore finished: ${total} change(s) applied.`); S.ui.restore = null; scheduleSync(true);
  } catch(e){ console.error(e); toast("The restore stopped part-way. Your pre-restore backup was downloaded; you can restore it to go back."); R0.progress = null; }
  render();
}

/* ================= health & integrity ================= */
function docSizes(){
  const out = [];
  for(const c of SUB_COLS) for(const d of (S.R[c] || [])) out.push({c, id:d.id, size:JSON.stringify(d).length});
  return out.sort((a,b) => b.size - a.size);
}
function integrity(){
  const items = [], t = today(), ids = new Set(S.R.employees.map(e => e.id));
  for(const r of S.D.requests){
    if(!ids.has(r.empId)) items.push({sev:2, text:`${r.no}: requester no longer exists`, req:r.id});
    if(r.status === "pending"){ const a = emp(r.steps[r.current]?.approverId); if(!a || a.status === "Resigned") items.push({sev:3, text:`${r.no} is stuck: the current approver ${a ? a.name + " has left" : "no longer exists"}`, req:r.id, fix:"reassign"}); }
    r.steps.forEach((s, i) => { const v = verifyStep(r, i); if(v === "missing" || v === "mismatch") items.push({sev:3, text:`${r.no}: step ${i+1} (${nm(s.approverId)}) has no matching signed decision — it may have been edited outside the approval screen`, req:r.id}); });
    if(r.status !== "cancelled"){ const e = emp(r.empId), c = countDays(r.start, r.end, unitOf(r), e?.office); if(e && c.days !== r.days) items.push({sev:1, text:`${r.no}: saved as ${r.days} day(s) but the dates give ${c.days}`, req:r.id}); }
  }
  for(const e of activeE()){
    let p = e.supervisorId, hop = 0; while(p && hop++ < 60){ if(p === e.id){ items.push({sev:2, text:`${e.name}: supervisor chain loops back to themselves`, emp:e.id}); break; } p = emp(p)?.supervisorId; }
    if(e.supervisorId && !ids.has(e.supervisorId)) items.push({sev:2, text:`${e.name}: supervisor record is missing`, emp:e.id});
    if(!e.supervisorId && e.role !== "gm") items.push({sev:1, text:`${e.name} has no direct supervisor — approvals skip straight to HRD`, emp:e.id});
    if(S.canEdit || S.mode !== "db") for(const [k, t2] of typesFor(e)) if(t2.track){ const b = balance(e.id, k); if(b.avail < 0) items.push({sev:2, text:`${e.name}: ${t2.name} balance is negative (${b.avail})`, emp:e.id}); }
  }
  const nos = new Map(); for(const e of E()){ const k = (e.empNo||"").toUpperCase(); if(nos.has(k)) items.push({sev:2, text:`Employee ID ${e.empNo} is used by ${nos.get(k)} and ${e.name}`, emp:e.id}); else nos.set(k, e.name); }
  if(S.canEdit) for(const p of S.R.private) if(!ids.has(p.id)) items.push({sev:1, text:`Orphan confidential record ${p.id} (employee deleted)`});
  for(const a of S.D.attendance) if(!ids.has(a.empId)) items.push({sev:1, text:`Attendance for an unknown employee (${a.id})`});
  return items.sort((a,b) => b.sev - a.sev);
}
function health(){
  const counts = Object.fromEntries(SUB_COLS.map(c => [c, (S.R[c] || []).length]));
  const total = Object.values(counts).reduce((s,n) => s+n, 0);
  const est = total + (S.R.employees.filter(e => e.userId).length * 2) + 40;
  const sizes = docSizes();
  return {counts, total, est, sizes, big:sizes.filter(s => s.size > 150000), age:backupAgeDays(), schemaOk:dbSchema() >= SCHEMA,
    unlinked:activeE().filter(e => !e.userId), pendingLinks:S.R.links.filter(l => !l.status || l.status === "pending"),
    pendingSubs:S.R.sub.reduce((s,d) => s + Object.keys(d.items||{}).filter(k => !(S.R.ingest?.done||{})[d.id + ":" + k]).length, 0)};
}

/* ================= maintenance actions ================= */
const SYS = () => Object.assign({notifDays:90, attMonths:24, reqYears:3, anonYears:5, backupDays:7, driveFolder:""}, cfg().system || {});
const recentBackup = hrs => { const b = lastBackup(); return b && (Date.now() - new Date(b.at)) < hrs * 36e5; };
async function maint(kind){
  if(!realAdmin()) return;
  const sys = SYS(), cut = d => { const x = new Date(); x.setDate(x.getDate() - d); return x.toISOString(); };
  let plan = [], label = "";
  if(kind === "notifs"){ const c = cut(sys.notifDays); plan = S.R.notifs.filter(n => (n.at || "") < c).map(n => ["notifs", n.id]); label = `notifications older than ${sys.notifDays} days`; }
  if(kind === "archive"){
    if(!recentBackup(24)){ toast("Make a backup first (within the last 24 hours) — archived records are deleted from the app."); return; }
    const reqCut = addDays(today(), -365 * sys.reqYears), attCut = shiftMonth(today().slice(0,7), -sys.attMonths);
    plan = S.R.requests.filter(r => r.status !== "pending" && r.end < reqCut).map(r => ["requests", r.id])
      .concat(S.R.attendance.filter(a => a.month < attCut).map(a => ["attendance", a.id]))
      .concat(S.R.attImports.filter(a => (a.to || "") < attCut + "-01").map(a => ["attImports", a.id]));
    label = `requests older than ${sys.reqYears} years and attendance older than ${sys.attMonths} months`;
  }
  if(kind === "anon"){
    if(!recentBackup(24)){ toast("Make a backup first (within the last 24 hours)."); return; }
    const c = addDays(today(), -365 * sys.anonYears), targets = E().filter(e => e.status === "Resigned" && e.exitDate && e.exitDate < c && !e.anonymized);
    if(!targets.length){ toast("No former employees past the retention period."); return; }
    if(S.ui.confirmMaint !== kind){ S.ui.confirmMaint = kind; toast(`Click again to anonymize ${targets.length} former employee(s).`); render(); return; }
    S.ui.confirmMaint = null;
    await run(async () => {
      for(const e0 of targets){
        const e = Object.assign(clone(e0), {name:"Former employee " + e0.empNo, email:"", phone:"", birthDate:"", gender:"", photo:"", userId:null, notes:[], exitReason:"", anonymized:today()});
        e.contracts = (e.contracts || []).map(c2 => ({type:c2.type, start:c2.start, end:c2.end})); e.contract = e.contracts[e.contracts.length - 1] || null;
        await putEmployee(e);
        for(const r of S.R.reviews.filter(r => r.empId === e.id)) await S.db.collection("reviews").doc(r.id).delete();
      }
      audit("anonymized", `${targets.length} former employee(s)`, `left before ${c}`);
    }, `${targets.length} former employee(s) anonymized.`);
    return;
  }
  if(kind === "resync"){ scheduleSync(true); toast("Refreshing private copies for every linked account…"); return; }
  if(!plan.length){ toast(`Nothing to clean up: no ${label}.`); return; }
  if(S.ui.confirmMaint !== kind){ S.ui.confirmMaint = kind; toast(`Click again to delete ${plan.length} record(s): ${label}.`); render(); return; }
  S.ui.confirmMaint = null;
  await run(async () => { for(const [c, id] of plan) await withRetry(() => S.db.collection(c).doc(id).delete()); audit("cleanup_" + kind, label, plan.length + " records"); }, `Deleted ${plan.length} record(s).`);
}
async function reassignStep(reqId){
  const r0 = S.D.requests.find(r => r.id === reqId); if(!r0 || !isHR()) return;
  const r = clone(r0), s = r.steps[r.current], hr = S.realEmpId || S.me;
  s.reassignedFrom = s.approverId; s.approverId = hr; s.label = s.label + " (reassigned)"; r.updatedAt = new Date().toISOString();
  await run(async () => { await store.put("requests", r); audit("approver_reassigned", r.no, `${nm(s.reassignedFrom)} → ${nm(hr)}`); }, `${r.no} now waits for ${nm(hr)}.`);
}

/* ================= account linking screen ================= */
function vLink(){
  const mine = S.R.links.find(l => l.id === S.uid), w = S.who || {}, email = (w.email || "").toLowerCase();
  const match = email ? S.R.employees.find(e => !e.system && (e.email || "").toLowerCase() === email && !e.userId) : null;
  const viewOnly = S.canWrite === false;
  const target = mine ? S.R.employees.find(e => e.id === mine.empId) : null;
  return `<div class="link-wrap"><section class="card"><div class="card-b stack" style="padding:32px">
    <span class="tile c1" style="width:52px;height:52px">${ic("user")}</span>
    <div><h1>Connect your account</h1><p class="muted" style="margin-top:6px">You're signed in${w.email ? " as <b>" + esc(w.email) + "</b>" : ""}, but this email isn't on an employee profile yet. Ask HRD to put this email on your profile (it then connects automatically within a minute), or send a request below with your Employee ID.</p></div>
    ${viewOnly ? `<div class="note warn">${ic("alert")}<div>Your account can't send requests. Contact HRD.</div></div>` :
    mine && mine.status === "rejected" ? `<div class="note warn">${ic("alert")}<div>Your request to link to <b>${esc(target?.name || mine.empName || mine.empNo || "")}</b> was declined by HR. Check the Employee ID and try again, or contact HRD.</div></div>${linkForm(match)}` :
    mine ? `<div class="note">${ic("clock")}<div>Request sent to link your account to <b>${esc(target?.name || mine.empName || "")}</b> (${esc(mine.empNo || "")}). HRD or Admin will confirm it — let them know you've sent it.</div></div>
      <div><button class="btn" type="button" data-act="link-cancel">Change request</button></div>` : linkForm(match)}
  </div></section></div>`;
}
function linkForm(match){
  return match ? `<div class="note">${ic("info")}<div>We found an employee profile with your email: <b>${esc(match.name)}</b> · ${esc(match.empNo)} · ${esc(match.position)}.</div></div>
    <div class="row"><button class="btn pri" type="button" data-act="link-claim" data-id="${match.id}">${ic("check")}This is me — connect</button><button class="btn" type="button" data-act="link-manual">Use a different Employee ID</button></div>${S.ui.linkManual ? linkManual() : ""}`
    : linkManual();
}
function linkManual(){
  return `<form class="stack" data-draft="link" data-submit="link"><div class="fields"><label class="f"><span>Employee ID</span><input type="text" name="empNo" value="${esc(dv("link","empNo",""))}" placeholder="e.g. ONE-0031"><small>Printed on your contract or ask HRD.</small></label>
    <label class="f"><span>Full name as registered</span><input type="text" name="name" value="${esc(dv("link","name",""))}"></label></div>
    ${S.ui.linkErr ? `<ul class="errs"><li>${esc(S.ui.linkErr)}</li></ul>` : ""}
    <div><button class="btn pri" type="submit">Send link request</button></div></form>`;
}
async function claimLink(empId){
  const e = S.R.employees.find(x => x.id === empId); if(!e) return;
  try { await S.db.doc("links/" + S.uid).set({empId:e.id, empNo:e.empNo, status:"pending", at:new Date().toISOString()}); toast("Request sent."); }
  catch(err){ toast(err?.code === "invalid_argument" ? "Your account can't send requests. Contact HRD." : "Couldn't send the request. Try again."); }
}

/* ================= banners ================= */
function banners(){
  const out = [], age = backupAgeDays(), sys = SYS();
  if(S.offline) out.push(["warn", "alert", "You're offline. Changes won't be saved until the connection is back."]);
  if(S.preview) out.push([S.preview.writable ? "warn" : "", "info", S.preview.writable
    ? `Acting on behalf of <b>${esc(nm(S.me))}</b> (no account linked yet). Actions are recorded under your own name in the audit log. <button class="btn link" type="button" data-act="preview-exit">Exit</button>`
    : `Previewing as <b>${esc(nm(S.me))}</b> — read only. <button class="btn link" type="button" data-act="preview-exit">Exit preview</button>`]);
  if(dbOn() && realAdmin() && dbSchema() < SCHEMA) out.push(["warn", "alert", `Database upgrade available (schema ${dbSchema()} → ${SCHEMA}). A backup is downloaded first. <button class="btn link" type="button" data-act="migrate">${S.ui.migrating ? "Upgrading…" : "Upgrade now"}</button>`]);
  if(dbOn() && isMgmt() && !S.canEdit) out.push(["warn", "alert", "Your HR access is being applied — reload the page in a minute if confidential data stays hidden."]);
  if(dbOn() && S.canEdit && isHR() && !S.preview && (age === null || age >= sys.backupDays)) out.push(["warn", "clock", `${age === null ? "No backup has been made yet." : `Last backup was ${age} days ago.`} <button class="btn link" type="button" data-act="backup" data-v="drive">Back up to cloud storage</button> · <button class="btn link" type="button" data-act="backup" data-v="download">Download</button>`]);
  if(realAdmin() && S.errors.length) out.push(["", "info", `${S.errors.length} app error(s) this session were recorded in the audit log. <button class="btn link" type="button" data-act="go" data-v="system">Open System</button>`]);
  return out.length ? `<div class="banners">${out.map(([k, i, h]) => `<div class="note ${k}">${ic(i)}<div>${h}</div></div>`).join("")}</div>` : "";
}

/* ================= System page (Admin) ================= */
function vSystem(){
  const tab = S.ui.systab || "health", tabs = [["health","Health"],["accounts","Accounts & Access"],["backup","Backup & Restore"],["audit","Audit Log"],["maint","Maintenance"],["runbook","Runbook"]];
  const body = {health:sysHealth, accounts:sysAccounts, backup:sysBackup, audit:sysAudit, maint:sysMaint, runbook:sysRunbook}[tab]();
  return `<div class="page-h"><div><h1>System</h1><p>Security, backups and maintenance for the HRM. App ${APP_VERSION} · database schema ${dbSchema()}${dbSchema() < SCHEMA ? ` (upgrade to ${SCHEMA} available)` : ""} · time zone ${esc(TZ())}.</p></div>
    <div class="row"><button class="btn" type="button" data-act="backup" data-v="download">${ic("download")}Download backup</button><button class="btn pri" type="button" data-act="backup" data-v="drive">${ic("upload")}Back up to cloud</button></div></div>
  ${S.ui.busy ? `<div class="note">${ic("clock")}<div>${esc(S.ui.busy)}</div></div>` : ""}
  <section class="card"><div class="tabs" role="tablist" style="padding:0 14px">${tabs.map(([k,l]) => `<button type="button" role="tab" data-act="systab" data-v="${k}" aria-selected="${tab===k}">${l}</button>`).join("")}</div>${body}</section>`;
}
const meter = (v, max, warnAt) => `<div class="stackbar" style="margin-top:6px"><i style="width:${Math.min(100, v/max*100)}%;background:${v/max > (warnAt||.8) ? "var(--bad)" : v/max > .5 ? "var(--warn)" : "var(--ok)"}"></i></div>`;
function sysHealth(){
  const H = health(), I = integrity(), age = H.age, sys = SYS();
  const tile = (l, v, s, bad) => `<div class="kpi ${bad?"warn":""}"><span class="kl">${l}</span><span class="kval" style="font-size:1.5rem">${v}</span><span class="ks">${s}</span></div>`;
  return `<div class="card-b stack">
    <div class="grid kpis">${tile("Records stored", "≈ " + H.est.toLocaleString(), "free plan fits ~200,000" + meter(H.est, 200000), H.est > 150000)}
      ${tile("Last backup", age === null ? "Never" : age === 0 ? "Today" : age + " days ago", `target every ${sys.backupDays} days`, age === null || age >= sys.backupDays)}
      ${tile("Schema", dbSchema() + " / " + SCHEMA, H.schemaOk ? "up to date" : "upgrade available", !H.schemaOk)}
      ${tile("Accounts linked", `${activeE().length - H.unlinked.length}/${activeE().length}`, `${H.pendingLinks.length} request(s) waiting`, H.pendingLinks.length > 0)}
      ${tile("Integrity issues", I.length, `${I.filter(x => x.sev === 3).length} critical`, I.some(x => x.sev === 3))}
      ${tile("Private copies", S.ui.lastSync ? ago(S.ui.lastSync) : (S.canEdit ? "pending" : "—"), `${H.pendingSubs} submission(s) to process`, !!S.ui.syncErr)}</div>
    ${H.big.length ? `<div class="note warn">${ic("alert")}<div>Large records (limit 256 KB each): ${H.big.map(b => `${esc(b.c)}/${esc(b.id)} ${(b.size/1024).toFixed(0)} KB`).join(", ")}. Archive old data in Maintenance.</div></div>` : ""}
    <div class="grid two"><div><h3 class="sub">Records per collection</h3>${hbars(Object.entries(H.counts).filter(x => x[1]).sort((a,b) => b[1]-a[1]), Math.max(...Object.values(H.counts), 1))}</div>
      <div><h3 class="sub">Largest records</h3><div class="list">${H.sizes.slice(0,6).map(s => `<div class="li" style="padding:8px 0"><span class="grow small">${esc(s.c)} / ${esc(s.id)}</span><span class="num small">${(s.size/1024).toFixed(1)} KB</span></div>`).join("")}</div></div></div>
  </div>
  <div class="card-h" style="border-top:1px solid var(--line)"><h2>Integrity checks</h2><span class="tag">${I.length}</span></div>
  ${I.length ? `<div class="list">${I.slice(0,60).map(x => `<div class="li att s${x.sev}"><span class="sevdot"></span><span class="grow">${esc(x.text)}</span>
      ${x.fix === "reassign" ? `<button class="btn sm" type="button" data-act="reassign" data-id="${x.req}">Reassign to me</button>` : ""}${x.req ? `<button class="btn sm" type="button" data-act="open-req" data-id="${x.req}">Open</button>` : x.emp ? `<button class="btn sm" type="button" data-act="open-emp" data-id="${x.emp}">Open</button>` : ""}</div>`).join("")}</div>`
    : `<div class="empty"><b>All checks passed</b>Approvals are signed, balances are consistent and the reporting lines are valid.</div>`}`;
}
function sysAccounts(){
  const ids = S.R.links.map(l => l.id).concat(E().filter(e => e.userId).map(e => e.userId));
  ensureProfiles(ids);
  const prof = id => S.prof[id] || {};
  const accts = [...S.D.employees].filter(e => e.status !== "Resigned").sort((a,b) => (b.admin?1:0) - (a.admin?1:0) || (b.role==="hrd"?1:0) - (a.role==="hrd"?1:0) || a.name.localeCompare(b.name));
  const Y = `<span class="up">✓</span>`, N = `<span class="muted">—</span>`;
  const matrix = [["View own profile, apply leave & WFH", Y,Y,Y,Y,Y],["Approve team requests, write team reviews", N,Y,Y,Y,Y],["Company-wide view of all employees", N,N,Y,Y,Y],
    ["Employees, contracts, leave quotas, import", N,N,N,Y,Y],["Recruitment, attendance upload, reminders, announcements, review tasks", N,N,N,Y,Y],
    ["Leave quotas & rules, holidays, attendance hours, review criteria", N,N,N,Y,Y],["Backups (download / cloud storage)", N,N,N,Y,Y],
    ["Approval flows, organization, job levels, branding, email settings", N,N,N,N,Y],["Grant HRD / Admin, link accounts, restore, maintenance", N,N,N,N,Y]];
  return `<div class="card-b stack">
    <div class="note">${ic("info")}<div><b>How access is enforced.</b> Each person signs in with their own email account, connected once to their employee profile (automatically when the verified email matches the profile, otherwise approved by HRD/Admin). The database derives the access level from the profile: <b>HRD, General Manager and Admin</b> can read and change confidential HR data; <b>everyone else</b> can submit requests, approve their team and write reviews, but the database refuses confidential data, quotas, contracts and settings — even outside this screen. Signed-in people without a profile see nothing.</div></div>
    <h3 class="sub" style="margin:0">Link requests</h3>
    ${linkRequests() || `<p class="small muted">No pending requests.</p>`}
    <h3 class="sub" style="margin:0">Who can do what</h3>
    <div class="tw" style="border:1px solid var(--line);border-radius:10px"><table class="t"><thead><tr><th>Permission</th><th>Staff</th><th>Supervisor / Manager</th><th>General Manager</th><th>HRD</th><th>Admin</th></tr></thead><tbody>
      ${matrix.map(r => `<tr><td style="white-space:normal">${r[0]}</td>${r.slice(1).map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>
  <div class="card-h" style="border-top:1px solid var(--line)"><h2>People & access</h2></div>
  <div class="tw"><table class="t rt"><thead><tr><th>Person</th><th>Signed-in account</th><th>Access level</th><th>HRD</th><th>Admin</th><th></th></tr></thead><tbody>
    ${accts.map(e => { const p = e.userId ? prof(e.userId) : null, need = e.admin || e.role === "hrd" || e.role === "gm" ? "HR editor" : "Employee";
      return `<tr><td class="wide">${who(e.id, e.system ? "System account" : e.position)}</td><td data-l="Account">${e.userId ? `<span class="pill p-active">Linked</span> <span class="small muted">${esc(p?.name || "")}</span>` : `<span class="pill p-neutral">Not linked</span>`}</td>
        <td data-l="Access">${need}</td>
        <td data-l="HRD"><input type="checkbox" data-access="hrd" data-id="${e.id}" ${e.role==="hrd"?"checked":""} ${e.system?"disabled":""} aria-label="HRD access for ${esc(e.name)}"></td>
        <td data-l="Admin"><input type="checkbox" data-access="admin" data-id="${e.id}" ${e.admin?"checked":""} aria-label="Admin access for ${esc(e.name)}"></td>
        <td class="r">${e.userId ? `<button class="btn sm" type="button" data-act="unlink" data-id="${e.id}">${S.ui.unlink === e.id ? "Click to confirm" : "Unlink"}</button>` : ""}<button class="btn sm" type="button" data-act="preview-as" data-id="${e.id}">${e.userId ? "Preview" : "Act as"}</button></td></tr>`; }).join("")}</tbody></table></div>`;
}
function sysBackup(){
  const list = [...S.D.backups].sort((a,b) => b.at.localeCompare(a.at)).slice(0,20), R0 = S.ui.restore, sys = SYS();
  let restore;
  if(!R0 || R0.error) restore = `<label class="drop" id="restore-drop"><input type="file" id="restore-file" accept=".json,application/json"><span class="tile c2">${ic("upload")}</span><b>Choose a backup file (.json) to restore</b><span class="small muted">Nothing changes until you review the plan and type RESTORE.</span></label>${R0?.error ? `<ul class="errs"><li>${esc(R0.error)}</li></ul>` : ""}`;
  else if(R0.loading) restore = `<div class="empty"><b>Checking ${esc(R0.file)}…</b></div>`;
  else { const P = restorePlan(), writes = P.plan.reduce((s,p) => s + p.upsert.length + p.del.length, 0);
    restore = `<div class="stack"><div class="note ${R0.valid ? "" : "warn"}">${ic(R0.valid ? "check" : "alert")}<div><b>${esc(R0.file)}</b> · made ${fmt(R0.obj.createdAt)} ${R0.obj.createdAt.slice(11,16)} by ${esc(R0.obj.by?.name || "")} · schema ${R0.obj.schema}${P.migrated ? ` (will be upgraded to ${SCHEMA})` : ""} · ${R0.valid ? "checksum verified" : "<b>checksum does not match — the file was modified or damaged</b>"}</div></div>
      <div class="seg" role="group"><button type="button" data-act="rmode" data-v="replace" aria-pressed="${R0.mode==="replace"}">Replace (exact copy of backup)</button><button type="button" data-act="rmode" data-v="merge" aria-pressed="${R0.mode==="merge"}">Merge (add/overwrite, keep newer records)</button></div>
      <div class="tw" style="border:1px solid var(--line);border-radius:10px"><table class="t"><thead><tr><th></th><th>Collection</th><th class="r">In backup</th><th class="r">Add / update</th><th class="r">Delete</th></tr></thead><tbody>
        ${Object.keys(R0.obj.data).map(c => { const p = P.plan.find(x => x.c === c); return `<tr><td><input type="checkbox" data-rsel="${c}" ${R0.sel[c]?"checked":""} aria-label="Restore ${c}"></td><td>${esc(c)}</td><td class="r num">${R0.obj.data[c].length}</td><td class="r num">${p ? p.upsert.length : "—"}</td><td class="r num ${p?.del.length ? "down" : ""}">${p ? p.del.length : "—"}</td></tr>`; }).join("")}
        <tr><td><input type="checkbox" data-rsel="config" ${R0.sel.config?"checked":""} aria-label="Restore settings"></td><td>settings</td><td class="r">1</td><td class="r">${R0.sel.config ? 1 : 0}</td><td class="r">0</td></tr></tbody></table></div>
      ${R0.progress ? `<div><b>Restoring… ${R0.progress.done}/${R0.progress.total}</b>${meter(R0.progress.done, Math.max(1, R0.progress.total), 2)}</div>` :
      `<div class="note warn">${ic("alert")}<div>${writes} change(s) will be written. A backup of the current data is downloaded automatically first, so you can undo by restoring it.</div></div>
       <div class="row"><input type="text" id="restore-confirm" placeholder="Type RESTORE" value="${esc(R0.confirm||"")}" style="max-width:200px" aria-label="Type RESTORE to confirm">
        <button class="btn bad" type="button" data-act="restore-run" ${realAdmin() ? "" : "disabled"}>Restore now</button><button class="btn" type="button" data-act="restore-cancel">Cancel</button></div>`}</div>`; }
  return `<div class="card-b stack">
    <div class="note">${ic("info")}<div><b>3-2-1 rule.</b> Three layers protect the data: the server takes an automatic snapshot every night (below), “Back up to cloud” keeps a copy in the project's private storage, and a downloaded copy belongs on a company laptop or shared drive — outside Supabase. Backups include every employee record, confidential data, requests, attendance, settings and approval signatures. Store them like payroll files — they contain personal data.</div></div>
    <div class="fields"><label class="f"><span>Remind to back up every (days)</span><input type="number" min="1" max="60" data-cfg="system.backupDays" value="${sys.backupDays}" ${realAdmin()?"":"disabled"}></label>
</div></div>
  <div class="card-h" style="border-top:1px solid var(--line)"><h2>Backup history</h2><span class="tag">${S.D.backups.length}</span></div>
  ${list.length ? `<div class="tw"><table class="t rt"><thead><tr><th>When</th><th>Where</th><th>By</th><th class="r">Records</th><th>Checksum</th></tr></thead><tbody>${list.map(b => `<tr><td data-l="When">${fmt(b.at)} ${b.at.slice(11,16)}</td>
    <td data-l="Where">${b.dest === "drive" ? (b.fileId ? `<button class="btn link" type="button" data-act="cloud-dl" data-v="${esc(b.fileId)}">Cloud storage</button>` : "Cloud storage") : "Downloaded"}${b.note ? ` <span class="small muted">· ${esc(b.note)}</span>` : ""}</td>
    <td data-l="By">${esc(nm(b.by))}</td><td data-l="Records" class="r num">${Object.values(b.counts||{}).reduce((s,n) => s+n, 0)}</td><td data-l="Checksum" class="small muted">${esc((b.checksum||"").slice(0,12))}…</td></tr>`).join("")}</tbody></table></div>`
    : `<div class="empty"><b>No backups yet</b>Make the first one now.</div>`}
  ${sysSnapshots()}
  <div class="card-h" style="border-top:1px solid var(--line)"><h2>Restore</h2>${realAdmin() ? "" : `<span class="tag">Admin only</span>`}</div>
  <div class="card-b">${realAdmin() ? restore : `<p class="muted">Only Admin can restore a backup.</p>`}</div>`;
}
function sysSnapshots(){
  if(!window.HRM) return "";
  const U = S.ui.snaps;
  if(!U){ S.ui.snaps = {loading:true}; window.HRM.snapshots().then(l => { S.ui.snaps = {list:l}; render(); }).catch(() => { S.ui.snaps = {error:true}; render(); }); }
  const list = (U && U.list) || [];
  return `<div class="card-h" style="border-top:1px solid var(--line)"><h2>Server snapshots</h2><span class="tag">automatic · daily 02:00 WITA</span>
      <button class="btn sm" type="button" data-act="snap-now" style="margin-left:auto">${ic("plus")}Snapshot now</button></div>
    <div class="card-b stack"><p class="muted small">The database copies itself every night: daily snapshots are kept 30 days, Sunday snapshots 6 months, manual ones 90 days. Load one into Restore to bring data back.</p>
    ${!U || U.loading ? `<div class="empty"><b>Loading…</b></div>` : U.error ? `<div class="note warn">${ic("alert")}<div>Snapshots couldn't be loaded.</div></div>` :
      list.length ? `<div class="tw"><table class="t rt"><thead><tr><th>When</th><th>Kind</th><th class="r">Records</th><th class="r">Size</th><th></th></tr></thead><tbody>${list.slice(0, 40).map(s => `<tr>
        <td data-l="When">${fmt(s.at.slice(0,10))} ${new Date(s.at).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</td><td data-l="Kind">${esc(s.kind)}</td><td data-l="Records" class="r num">${s.docs}</td><td data-l="Size" class="r num">${Math.max(1, Math.round(s.bytes/1024))} KB</td>
        <td class="r"><button class="btn sm" type="button" data-act="snap-dl" data-v="${s.id}">Download</button>${realAdmin() ? `<button class="btn sm" type="button" data-act="snap-load" data-v="${s.id}">Load into Restore</button>` : ""}</td></tr>`).join("")}</tbody></table></div>`
      : `<div class="empty"><b>No snapshots yet</b>The first one is taken tonight, or press “Snapshot now”.</div>`}</div>`;
}
async function snapToBackup(id){
  const s = await window.HRM.snapshot(Number(id)); if(!s) throw new Error("missing");
  const data = Object.fromEntries(BACKUP_COLS.map(c => [c, []])); let config = clone(cfg());
  for(const [path, v] of Object.entries(s.data || {})){ const parts = path.split("/"); if(parts.length !== 2) continue;
    const [c, id2] = parts; if(c === "config" && id2 === "main"){ config = v.data; continue; } if(data[c]) data[c].push(Object.assign({id:id2}, v.data)); }
  const schema = Number(config.schemaVersion) || 1, counts = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length]));
  const checksum = await sha256(JSON.stringify({schema, data, config}));
  return {format:"onederland-hrm-backup", version:1, app:APP_VERSION, schema, createdAt:new Date(s.at).toISOString(), by:{id:null, name:"Server snapshot #" + s.id}, counts, checksum, data, config};
}
function sysAudit(){
  const A = S.ui.audit || {ym:today().slice(0,7)}, rows = (A.rows || []).filter(r => (!A.q || (r.a + " " + r.x + " " + r.i + " " + nm(r.by)).toLowerCase().includes(A.q.toLowerCase())));
  return `<div class="card-b stack"><p class="muted">Every person's actions are written to their own monthly log, which only they can append to and only Admin can read. Use it to answer “who changed this and when”.</p>
    <div class="row" style="justify-content:space-between">${monthNav(A.ym, "aud-month")}<div class="row"><input type="search" id="aud-q" placeholder="Filter by person, action or record" value="${esc(A.q||"")}" style="width:260px">
      <button class="btn" type="button" data-act="aud-load">${ic("history")}${A.rows ? "Reload" : "Load"} ${monthLabel(A.ym)}</button>${A.rows?.length ? `<button class="btn" type="button" data-act="aud-export">${ic("download")}CSV</button>` : ""}</div></div></div>
  ${A.loading ? `<div class="empty"><b>Loading audit log…</b></div>` : A.rows ? (rows.length ? `<div class="tw"><table class="t rt"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Record</th><th>Details</th></tr></thead><tbody>
    ${rows.slice(0,400).map(r => `<tr><td data-l="When" class="small">${fmt(r.t)} ${r.t.slice(11,19)}</td><td data-l="Who">${esc(r.by ? nm(r.by) : "—")}${r.as ? `<br><span class="small muted">as ${esc(nm(r.as))}</span>` : ""}</td><td data-l="Action"><span class="tag">${esc(r.a)}</span></td><td data-l="Record" class="wide" style="white-space:normal">${esc(r.x)}</td><td data-l="Details" class="wide small muted" style="white-space:normal">${esc(r.i)}</td></tr>`).join("")}</tbody></table></div>`
    : `<div class="empty">No events match.</div>`) : `<div class="empty">Choose a month and load the log.</div>`}`;
}
async function loadAudit(){
  const A = S.ui.audit = S.ui.audit || {ym:today().slice(0,7)}; A.loading = true; render();
  const uids = [...new Set(S.R.employees.filter(e => e.userId).map(e => e.userId).concat(S.uid ? [S.uid] : []))], rows = [];
  for(const u of uids){ try { const s = await S.db.doc(`audit/${u}/m/${A.ym}`).get(); if(s.exists) rows.push(...(s.data().ev || [])); } catch(e){} }
  A.rows = rows.sort((a,b) => b.t.localeCompare(a.t)); A.loading = false; render();
}
function sysMaint(){
  const sys = SYS(), n = (k, l, h, min, max) => `<label class="f"><span>${l}</span><input type="number" min="${min}" max="${max}" data-cfg="system.${k}" value="${sys[k]}"><small>${h}</small></label>`;
  const btn = (k, l, cls) => `<button class="btn sm ${cls||""}" type="button" data-act="maint" data-v="${k}">${S.ui.confirmMaint === k ? "Click again to confirm" : l}</button>`;
  return `<div class="card-b stack"><h3 class="sub" style="margin:0">Data retention</h3>
    <div class="fields">${n("notifDays","Keep notifications (days)","Older notifications are removed by the cleanup below.",14,730)}${n("reqYears","Keep leave & WFH requests (years)","Older closed requests are archived (deleted after a backup).",1,10)}
      ${n("attMonths","Keep attendance (months)","Older attendance months are archived.",6,120)}${n("anonYears","Anonymize former employees after (years)","Personal data of people who left is removed; headcount history stays.",1,10)}</div>
    <label class="f" style="max-width:320px"><span>Company time zone</span><select data-cfg="timezone">${[["Asia/Makassar","WITA — Bali, Gili, Lombok (UTC+8)"],["Asia/Jakarta","WIB — Jakarta, Surabaya (UTC+7)"],["Asia/Jayapura","WIT (UTC+9)"]].map(([v,l]) => `<option value="${v}" ${TZ()===v?"selected":""}>${l}</option>`).join("")}</select><small>Decides what “today” means for deadlines, reminders and backdating rules.</small></label></div>
  <div class="card-h" style="border-top:1px solid var(--line)"><h2>Tasks</h2></div>
  <div class="list">
    <div class="li"><div class="grow"><b style="font-weight:600">Clean up old notifications</b><br><span class="small muted">${S.R.notifs.filter(x => (x.at||"") < new Date(Date.now() - sys.notifDays*864e5).toISOString()).length} older than ${sys.notifDays} days</span></div>${btn("notifs","Clean up")}</div>
    <div class="li"><div class="grow"><b style="font-weight:600">Archive old requests & attendance</b><br><span class="small muted">Needs a backup from the last 24 hours. Keeps the database fast and under its limits.</span></div>${btn("archive","Archive")}</div>
    <div class="li"><div class="grow"><b style="font-weight:600">Anonymize former employees</b><br><span class="small muted">For data-protection (UU PDP) retention. Removes name, contact, notes and reviews of people who left more than ${sys.anonYears} years ago.</span></div>${btn("anon","Anonymize","bad")}</div>
    <div class="li"><div class="grow"><b style="font-weight:600">Refresh private copies</b><br><span class="small muted">Rebuilds each person's copy of their own confidential data. Runs automatically when HRD or Admin has the app open.</span></div>${btn("resync","Refresh now")}</div>
    <div class="li"><div class="grow"><b style="font-weight:600">Unused images</b><br><span class="small muted">Photos and logos that no profile points to any more.</span></div><button class="btn sm" type="button" data-act="assets-scan">${S.ui.assetScan ? `${S.ui.assetScan.unused.length} unused · ${(S.ui.assetScan.usage.bytes/1048576).toFixed(1)} MB used` : "Scan"}</button>${S.ui.assetScan?.unused.length ? `<button class="btn sm bad" type="button" data-act="assets-clean">Delete unused</button>` : ""}</div>
  </div>`;
}
function sysRunbook(){
  const sec = (t, items) => `<div><h3 style="margin-bottom:8px">${t}</h3><ol class="steps">${items.map(i => `<li>${i}</li>`).join("")}</ol></div>`;
  return `<div class="card-b stack" style="max-width:860px">
    ${sec("Go-live checklist", ["Remove sample data (System → Maintenance) and import your employees from the Excel template.", "Give every employee their <b>Employee ID</b> — they need it to connect their account.", "Make sure every employee profile has the person's work email — accounts connect automatically when the verified email matches.", "Send everyone the HRM link; they create an account with that email and confirm it. Approve the few manual requests from Employees or System → Accounts.", "Make the first backup to cloud storage and download a second copy."])}
    ${sec("Weekly (HRD)", ["Back up when the banner asks (default every 7 days).", "Clear <b>Needs attention</b> on the dashboard: contracts ending, overdue reviews, stuck approvals."])}
    ${sec("Monthly (HRD / Admin)", ["Upload last month's attendance export.", "Open System → Health: integrity issues should be zero.", "Check Accounts: new joiners are connected, people who left are unlinked."])}
    ${sec("Quarterly (Admin)", ["Restore drill: download a backup and check it opens in the Restore screen (stop before typing RESTORE).", "Run Maintenance → clean up notifications and archive old records after a fresh backup.", "Review the audit log for unexpected changes to quotas, access or settings."])}
    ${sec("When someone leaves", ["Set status to Resigned with the last working day.", "System → Accounts → Unlink (a resigned profile loses access automatically).", "Reassign any approvals waiting for them (Health shows stuck requests)."])}
    ${sec("If something goes wrong", ["Wrong data saved: find the change in the Audit Log, fix it by hand or restore only that collection (Merge mode).", "Mass mistake (bad import): Restore → Replace from the last good backup; a safety copy of the current state is downloaded first.", "App won't load for everyone: check status.supabase.com, then revert the last change in GitHub (the site redeploys in ~1 minute) — data is stored separately and is not affected.", "Data lost or corrupted: Backup & Restore → Server snapshots → Load into Restore (nightly copies), or restore a downloaded backup."])}
    <div class="note">${ic("info")}<div><b>Where it runs.</b> The site is hosted on GitHub Pages; data, sign-in and files live in Supabase (PostgreSQL with row-level security, region Tokyo). On the free plan a project pauses after a week without visits and has no provider backups — for production use the Pro plan adds daily provider backups and no pausing. The JSON backup stays the portable format.</div></div>
  </div>`;
}
function linkRequests(){
  const links = S.R.links.filter(l => !l.status || l.status === "pending"); if(!links.length) return "";
  ensureProfiles(links.map(l => l.id));
  return `<div class="list">${links.map(l => { const e = S.R.employees.find(x => x.id === l.empId), p = S.prof[l.id] || {};
    return `<div class="li" style="flex-wrap:wrap;padding-left:0;padding-right:0"><div class="grow"><b style="font-weight:600">${esc(p.name || "A signed-in person")}</b> <span class="small muted">(${esc(p.email || "email not verified")})</span><br>
      <span class="small">wants to connect as <b>${esc(e?.name || "unknown")}</b> · ${esc(l.empNo || "")}${e?.userId ? " · <span class='down'>this profile is already connected</span>" : ""} · ${ago(l.at)}</span></div>
      <button class="btn sm ok" type="button" data-act="link-approve" data-id="${l.id}" ${e && !e.userId ? "" : "disabled"}>Approve</button><button class="btn sm bad" type="button" data-act="link-reject" data-id="${l.id}">Decline</button></div>`; }).join("")}</div>`;
}
function ensureProfiles(ids){
  const need = ids.filter(id => id && !(id in S.prof) && !S.profAsk.has(id)); if(!need.length || !S.user) return;
  need.forEach(id => S.profAsk.add(id));
  S.user.profiles(need).then(ps => { Object.assign(S.prof, ps); render(); }).catch(() => {});
}

function vEmpty(){
  return `<div class="page-h"><div><h1>Set up your HRM</h1><p>There are no employees yet. Import your team from the Excel template, add people one by one, or load the sample company to explore.</p></div></div>
  <div class="row">${isHR() ? `<button class="btn pri" type="button" data-act="emp-imp-open">${ic("upload")}Import employees from Excel</button><button class="btn" type="button" data-act="first-hr">${ic("plus")}Add first employee</button>` : ""}<button class="btn" type="button" data-act="seed">Load sample data</button></div>
  ${isHR() && S.ui.empImpOpen ? importPanel() : ""}`;
}
function render(){
  const a = document.activeElement, aid = a && a.id, aname = a && a.name, aform = a?.form?.dataset?.draft, sel = a && "selectionStart" in a ? (() => { try { return [a.selectionStart, a.selectionEnd]; } catch(e){ return null; } })() : null;
  renderNav(); renderTop();
  const main = document.getElementById("main"); let html;
  let link = false;
  if(S.mode === "loading" || (S.mode === "db" && !S.loadedAll)) html = `<div class="card empty"><b>Loading HR data…</b>Employees, requests and settings are being loaded.</div>`;
  else if(S.mode === "db" && !S.me){ html = vLink(); link = true; }
  else if(!E().length) html = vEmpty();
  else {
    if(S.mode !== "db" && !emp(S.me)) pickMe();
    if(S.view === "system" && !realAdmin()) S.view = "dashboard";
    const views = {system:vSystem, attendance:vAttendance, announcements:vAnnouncements, dashboard:vDashboard, apply:vApply, myrequests:vMyRequests, profile:vProfile, approvals:vApprovals, calendar:vCalendar, directory:vDirectory, reviews:vReviews, recruitment:vRecruitment, reminders:vReminders, settings:vSettings};
    if(["recruitment","reminders","settings","attendance"].includes(S.view) && !isMgmt()) S.view = "dashboard";
    html = (views[S.view] || vDashboard)();
  }
  main.innerHTML = `<div class="wrap">${link || S.mode === "loading" ? "" : banners()}${html}</div>`;
  renderModal();
  let el = aid ? document.getElementById(aid) : null;
  if(!el && aname && aform) el = document.querySelector(`form[data-draft="${CSS.escape(aform)}"] [name="${CSS.escape(aname)}"]`);
  if(el && el !== document.body){ try { el.focus({preventScroll:true}); if(sel && el.setSelectionRange) el.setSelectionRange(sel[0], sel[1]); } catch(e){} }
}
function go(view, prm={}){
  S.view = view; S.prm = prm; S.pop = null; document.getElementById("app").classList.remove("open");
  if(view === "profile") S.ui.ptab = prm.tab || "overview";
  if(view === "apply" && prm.kind){ S.drafts.apply = Object.assign(S.drafts.apply||{}, {kind:prm.kind}); }
  render(); window.scrollTo({top:0});
}
function pickMe(){ const s = LS("hrm.me"); S.me = (s && emp(s)) ? s : (byRole("hrd") || E()[0] || S.D.employees.find(e => e.admin) || {}).id || null; }

/* ================= events ================= */
document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-act]");
  if(S.pop && !ev.target.closest(".pop") && !(b && b.dataset.act === "pop") && !ev.target.closest("#searchbox")){ S.pop = null; if(!b){ renderTop(); return; } }
  if(!b) return;
  const act = b.dataset.act, id = b.dataset.id, v = b.dataset.v;
  switch(act){
    case "backdrop": if(ev.target === b){ S.modal = null; renderModal(); } return;
    case "close": S.modal = null; renderModal(); return;
    case "go": { const p = {}; if(b.dataset.p === "wfh") p.kind = "wfh"; else if(b.dataset.p === "leave") p.kind = "leave"; if(v === "myrequests" && b.dataset.p) p.scope = b.dataset.p; return go(v, p); }
    case "nav-open": document.getElementById("app").classList.add("open"); return;
    case "nav-close": document.getElementById("app").classList.remove("open"); return;
    case "pop": S.pop = S.pop === v ? null : v; renderTop(); return;
    case "search-toggle": S.ui.searchOpen = !S.ui.searchOpen; renderTop(); if(S.ui.searchOpen) document.getElementById("q")?.focus(); return;
    case "theme": { const r = document.documentElement, dark = r.dataset.theme === "dark" || (!r.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches); r.dataset.theme = dark ? "light" : "dark"; LS("hrm.theme", r.dataset.theme); renderTop(); return; }
    case "view-as": if(S.mode === "db") return; S.me = id; LS("hrm.me", id); S.pop = null; S.modal = null; S.drafts.apply = {}; S.ui.applyTried = false; if(S.view === "profile") S.prm = {}; render(); toast(`Now viewing as ${nm(id)} (${emp(id).admin ? "Admin" : jobOf(emp(id)) + (emp(id).role==="hrd"?" · HRD":"")}).`); return;
    case "read-all": { const list = S.D.notifs.filter(n => n.to === S.me && !n.read); await run(async () => { for(const n of list) await store.put("notifs", Object.assign(clone(n), {read:true})); }); return; }
    case "open-notif": { S.pop = null; const n = S.D.notifs.find(x => x.id === id);
      if(n && !n.read) run(() => store.put("notifs", Object.assign(clone(n), {read:true})));
      const item = n || notifList().due.find(x => x.id === id); if(!item) return render();
      if(item.view === "profile" && item.ref){ const kd = n ? notifKind(n) : ""; return go("profile", {id:item.ref, tab: kd === "review_ready" ? "performance" : kd === "contract" ? "contract" : kd === "quota" ? "leave" : kd === "note" ? "history" : undefined}); }
      if(item.view === "announcements" && item.ref){ S.ui["ann-"+item.ref] = true; go("announcements"); markAnnRead([item.ref]); return; }
      if(["approvals","myrequests"].includes(item.view) && item.ref && S.D.requests.some(r => r.id === item.ref)){ go(item.view === "approvals" && isLead() ? "approvals" : "myrequests"); S.modal = {kind:"req", id:item.ref}; return renderModal(); }
      return go(item.view || "dashboard"); }
    case "mail-test": { const m0 = me(); if(!m0?.email){ toast("Add your email to your profile first."); return; }
      const r = await sendRich(m0, {subject:"Test email", heading:"Email notifications are working", intro:"This is a test from the ONEderland HRM. If you can read this, approvals, reviews, announcements and reminders will reach people by email too.", rows:[["Sent by", nm(m0.id)], ["Time", new Date().toLocaleString()]], tone:"ok", cta:{label:"Open HRM", go:"dashboard", ref:""}});
      toast(r.ok ? `Test email sent to ${m0.email}.` : `Not sent: ${r.reason}.`); return; }
    case "notif-settings": S.pop = null; S.ui.stab = "notif"; return go("settings");
    case "open-req": S.pop = null; S.modal = {kind:"req", id}; renderTop(); renderModal(); return;
    case "open-emp": S.modal = null; S.q = ""; return go("profile", {id, tab:b.dataset.tab});
    case "kind": S.drafts.apply = Object.assign(S.drafts.apply||{}, {kind:v}); S.ui.applyTried = false; render(); return;
    case "apply-reset": S.drafts.apply = {kind:dv("apply","kind","leave")}; S.ui.applyTried = false; render(); return;
    case "decide": await decide(id, v === "1"); if(S.modal?.kind === "req" && !S.D.requests.find(r => r.id === id && r.status === "pending" && r.steps[r.current]?.approverId === S.me)) {} render(); return;
    case "cx": S.ui["cx-"+id] = true; renderModal(); return;
    case "cx-no": delete S.ui["cx-"+id]; renderModal(); return;
    case "cx-yes": await cancelReq(id); render(); return;
    case "scope": S.prm.scope = v; render(); return;
    case "rstatus": S.ui.reqStatus = v; render(); return;
    case "calm": { const [y,m] = (S.ui.cal || today().slice(0,7)).split("-").map(Number); S.ui.cal = v === "0" ? today().slice(0,7) : iso(new Date(y, m-1+Number(v), 1)).slice(0,7); render(); return; }
    case "calk": S.ui.calKind = v; render(); return;
    case "ptab": S.ui.ptab = v; render(); return;
    case "stab": S.ui.stab = v; render(); return;
    case "stage": S.ui.stage = v; render(); return;
    case "task-new": S.drafts.task = {}; S.ui.taskErr = ""; S.modal = {kind:"task", emp:b.dataset.emp}; renderModal(); return;
    case "review-open": S.ui.rvErr = ""; S.modal = {kind:"review", task:b.dataset.task, emp:b.dataset.emp}; renderModal(); return;
    case "cand-new": S.ui.candErr = ""; S.modal = {kind:"cand", id:null}; renderModal(); return;
    case "cand-open": S.ui.candErr = ""; S.modal = {kind:"cand", id}; renderModal(); return;
    case "hire": S.ui.empErr = ""; S.modal = {kind:"emp", cand:id}; renderModal(); return;
    case "emp-new": S.ui.empErr = ""; S.modal = {kind:"emp"}; renderModal(); return;
    case "first-hr": S.ui.empErr = ""; S.drafts["emp-new"] = {hrAdmin:isAdmin(), jobLevel:"Supervisor", position:"HR Manager", dept:"Human Resources", status:"Active", ctype:"PKWTT", joinDate:today()}; S.modal = {kind:"emp"}; renderModal(); return;
    case "emp-edit": S.ui.empErr = ""; S.modal = {kind:"emp", id, rev:emp(id)?.rev}; renderModal(); return;
    case "contract-new": S.modal = {kind:"contract", id, rev:emp(id)?.rev}; renderModal(); return;
    case "quota-adj": if(!isHR()) return; S.ui.qErr = ""; delete S.drafts["qa-"+id]; S.modal = {kind:"quota", id, type:v, rev:emp(id)?.rev}; renderModal(); return;
    case "rem-new": S.drafts.rem = {}; S.ui.remErr = ""; S.modal = {kind:"rem", emp:b.dataset.emp}; renderModal(); return;
    case "rem-done": case "rem-undo": { const r = S.D.reminders.find(x => x.id === id); if(r) await run(() => store.put("reminders", Object.assign(clone(r), {done: act === "rem-done"})), act === "rem-done" ? "Marked as done." : "Reminder reopened."); return; }
    case "rem-del": if(S.ui.delRem !== id){ S.ui.delRem = id; toast("Tap delete again to remove this reminder."); setTimeout(() => { if(S.ui.delRem === id) S.ui.delRem = null; }, 4000); return; }
      S.ui.delRem = null; await run(() => store.del("reminders", id), "Reminder deleted."); return;
    case "flow-mv": if(!isAdmin()) return; { const f = clone(cfg().flows[b.dataset.k]), i = Number(b.dataset.i), j = i + Number(v); [f[i], f[j]] = [f[j], f[i]]; await setCfg("flows."+b.dataset.k, f); return; }
    case "flow-rm": if(!isAdmin()) return; { const f = clone(cfg().flows[b.dataset.k]); f.splice(Number(b.dataset.i), 1); await setCfg("flows."+b.dataset.k, f); return; }
    case "hol-del": await setCfg("holidays", (cfg().holidays||[]).filter((h, i) => String(i) !== b.dataset.i)); return;
    case "crit-del": { const c = clone(cfg().criteria); c.splice(Number(b.dataset.i), 1); await setCfg("criteria", c); return; }
    case "seed": await seed(); return;
    case "preview-as": if(!realAdmin() || S.mode !== "db") return; S.preview = {id, writable:!emp(id)?.userId}; S.me = id; S.pop = null; S.modal = null; S.drafts.apply = {}; if(S.view === "profile") S.prm = {}; if(S.view === "system") S.view = "dashboard"; audit("preview_started", nm(id), S.preview.writable ? "acting on behalf" : "read-only"); render(); return;
    case "preview-exit": S.preview = null; S.me = S.realEmpId; S.pop = null; S.modal = null; render(); return;
    case "systab": S.ui.systab = v; render(); return;
    case "backup": await backupNow(v); return;
    case "sign-out": if(window.HRM) await window.HRM.signOut(); return;
    case "cloud-dl": try { await window.HRM.downloadCloudBackup(v); } catch(e){ toast("That backup couldn't be downloaded."); } return;
    case "snap-now": try { await window.HRM.snapshotNow(); toast("Snapshot taken."); audit("snapshot_manual", "", ""); } catch(e){ toast(/too many/.test(e?.message || "") ? "Too many snapshots this hour — try later." : "The snapshot couldn't be taken."); } S.ui.snaps = null; render(); return;
    case "snap-dl": try { const b = await snapToBackup(v); await download(backupName(b).replace(".json", "-snapshot.json"), JSON.stringify(b)); } catch(e){ toast("That snapshot couldn't be downloaded."); } return;
    case "snap-load": if(!realAdmin()) return; try { const b = await snapToBackup(v); await readRestoreFile({name:"Server snapshot #" + v, text: async () => JSON.stringify(b)}); document.getElementById("restore-confirm")?.scrollIntoView({block:"center"}); } catch(e){ toast("That snapshot couldn't be loaded."); } return;
    case "migrate": if(!S.ui.migrating) await runMigration(); return;
    case "reassign": await reassignStep(id); return;
    case "link-claim": await claimLink(id); return;
    case "link-manual": S.ui.linkManual = true; render(); return;
    case "link-cancel": try { await S.db.doc("links/" + S.uid).delete(); } catch(e){} return;
    case "link-approve": { const L = S.R.links.find(l => l.id === id); if(L && (realAdmin() || (isHR() && S.canEdit))) await run(() => approveLink(L, "approved by " + nm(S.realEmpId)), "Account linked."); return; }
    case "link-reject": { const L = S.R.links.find(l => l.id === id); if(L && (realAdmin() || (isHR() && S.canEdit))) await run(async () => { await S.db.doc("links/" + id).set(Object.assign({}, L, {status:"rejected", decidedBy:S.realEmpId, decidedAt:new Date().toISOString()})); audit("account_link_declined", L.empNo || "", ""); }, "Request declined."); return; }
    case "unlink": { if(!realAdmin()) return; if(S.ui.unlink !== id){ S.ui.unlink = id; render(); setTimeout(() => { if(S.ui.unlink === id){ S.ui.unlink = null; render(); } }, 5000); return; }
      S.ui.unlink = null; const e = emp(id), u = e?.userId; if(!e) return;
      await run(async () => { await putEmployee(Object.assign(clone(e), {userId:null})); if(u) await S.db.doc("links/" + u).set({empId:e.id, empNo:e.empNo, status:"unlinked", decidedBy:S.realEmpId, decidedAt:new Date().toISOString()}); audit("account_unlinked", `${e.empNo} ${e.name}`, ""); }, `${e.name} unlinked.`); return; }
    case "rmode": if(S.ui.restore) S.ui.restore.mode = v; render(); return;
    case "restore-run": if(!dbOn()){ toast("Restore works on the live database only."); return; } await runRestore(); return;
    case "restore-cancel": S.ui.restore = null; render(); return;
    case "aud-month": S.ui.audit = {ym:shiftMonth((S.ui.audit||{ym:today().slice(0,7)}).ym, Number(v))}; render(); return;
    case "aud-load": if(dbOn()) await loadAudit(); return;
    case "aud-export": { const rows = (S.ui.audit?.rows || []); await download(`Audit_${S.ui.audit.ym}.csv`, [["Time","Person","Acting as","Action","Record","Details"]].concat(rows.map(r => [r.t, nm(r.by), r.as ? nm(r.as) : "", r.a, r.x, r.i])).map(l => l.map(csvCell).join(",")).join("\n")); return; }
    case "maint": await maint(v); return;
    case "assets-scan": { const a = await getAssets(); if(!a){ toast("Image storage isn't available in this view."); return; }
      try { const L = await a.list(), used = new Set(S.R.employees.map(e => e.photo).concat(S.R.ph.map(x => x.asset), [cfg().company?.logo]).filter(Boolean)); S.ui.assetScan = {usage:L.usage, unused:L.assets.filter(x => !used.has(x.id)).map(x => x.id)}; render(); } catch(e){ toast("Couldn't list stored images."); } return; }
    case "assets-clean": { const a = await getAssets(), ids = S.ui.assetScan?.unused || []; if(!a || !ids.length) return; let n = 0; for(const x of ids){ try { await a.delete(x); n++; } catch(e){} } audit("assets_cleaned", n + " images", ""); S.ui.assetScan = null; toast(`Deleted ${n} unused image(s).`); render(); return; }
    case "emp-imp-open": S.ui.empImpOpen = true; S.ui.empImp = null; render(); return;
    case "emp-imp-close": S.ui.empImpOpen = false; S.ui.empImp = null; render(); return;
    case "emp-imp-reset": S.ui.empImp = null; render(); return;
    case "emp-imp-run": await runImport(); return;
    case "emp-tpl": await downloadEmpTemplate(false); return;
    case "emp-export": await downloadEmpTemplate(true); return;
    case "photo-del": if(canEditPhoto(id)) await setPhotoRef(id, ""); return;
    case "logo-del": await setCfg("company.logo", ""); return;
    case "att-month": S.ui.attMonth = shiftMonth(attMonth(), Number(v)); render(); return;
    case "att-upload": S.ui.attUp = true; S.ui.attParse = null; render(); return;
    case "att-upclose": S.ui.attUp = false; S.ui.attParse = null; render(); return;
    case "att-import": await importAtt(); return;
    case "att-export": await download(`Attendance_${attMonth()}${S.ui.attOffice?"_"+S.ui.attOffice.replace(/\s+/g,"-"):""}.csv`, attCSV()); return;
    case "att-template": { const ex = activeE().slice(0,2); await download("Attendance_template.csv", ["Employee ID,Name,Date,Check In,Check Out"].concat(ex.map(e => [e.empNo, e.name, "01/11/2026", "08:25", "17:40"].map(csvCell).join(","))).join("\n")); return; }
    case "wipe-sample": if(!realAdmin()) return; if(!S.ui.wipe){ S.ui.wipe = true; render(); setTimeout(() => { if(S.ui.wipe){ S.ui.wipe = false; render(); } }, 5000); return; }
      S.ui.wipe = false; await wipeSample(); return;
    case "job-del": if(!isAdmin()) return; { const n = E().filter(e => e.jobLevel === v).length; if(n){ toast(`${n} employee(s) still have the “${v}” level. Change them first.`); return; }
      if(Object.values(cfg().flows).some(f => f.includes("job:" + v))){ toast(`“${v}” is used in an approval flow. Remove that step first.`); return; }
      await setCfg("jobLevels", JOBS().filter(j => j.name !== v)); return; }
    case "org-del": if(!isAdmin()) return; { const kind = b.dataset.k, [label, field] = ORG[kind], n = E().filter(e => e[field] === v).length;
      if(n){ toast(`${n} employee(s) still use “${v}”. Move them first.`); return; } await setCfg(kind, (cfg()[kind]||[]).filter(x => x !== v)); return; }
    case "ann-new": if(!isHR()) return; S.ui.annErr = ""; delete S.drafts["ann-new"]; S.modal = {kind:"ann"}; renderModal(); return;
    case "ann-edit": if(!isHR()) return; S.ui.annErr = ""; delete S.drafts["ann-"+id]; S.modal = {kind:"ann", id}; renderModal(); return;
    case "ann-cat": S.ui.annCat = v; render(); return;
    case "ann-open": S.ui["ann-"+id] = true; if(S.view !== "announcements") go("announcements"); else render();
      await markAnnRead([id]); document.getElementById("ann-"+id)?.scrollIntoView({block:"start", behavior:"smooth"}); return;
    case "ann-readall": await markAnnRead(annUnread().map(a => a.id)); toast("All announcements marked as read."); return;
    case "ann-pin": { const a = S.D.announcements.find(x => x.id === id); if(a && isHR()) await run(() => store.put("announcements", Object.assign(clone(a), {pinned:!a.pinned})), a.pinned ? "Unpinned." : "Pinned to the top."); return; }
    case "ann-del": if(!isHR()) return; if(S.ui.delAnn !== id){ S.ui.delAnn = id; toast("Tap delete again to remove this announcement."); setTimeout(() => { if(S.ui.delAnn === id) S.ui.delAnn = null; }, 4000); return; }
      S.ui.delAnn = null; await run(() => store.del("announcements", id), "Announcement deleted."); return;
  }
});
function syncDraft(t){
  const f = t.closest("form[data-draft]"); if(!f || !t.name) return false;
  const d = S.drafts[f.dataset.draft] = S.drafts[f.dataset.draft] || {};
  if(t.dataset.multi) d[t.name] = [...f.querySelectorAll(`input[name="${CSS.escape(t.name)}"]:checked`)].map(x => x.value);
  else d[t.name] = t.type === "checkbox" ? t.checked : t.value;
  return f;
}
document.addEventListener("input", ev => {
  const t = ev.target;
  if(t.id === "q"){ S.q = t.value; S.pop = t.value.trim() ? "search" : null; renderTop(); const q = document.getElementById("q"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); return; }
  if(t.id === "dq"){ S.ui.dq = t.value; render(); return; }
  if(t.id === "aud-q"){ S.ui.audit.q = t.value; render(); return; }
  if(t.id === "restore-confirm"){ S.ui.restore.confirm = t.value.trim(); return; }
  const f = syncDraft(t); if(!f) return;
  if(f.dataset.draft === "apply" && t.type !== "radio") document.getElementById("summary") && (document.getElementById("summary").innerHTML = applySummary());
  if(f.dataset.draft.startsWith("dec-") && t.value.trim()) delete S.ui["err-"+f.dataset.draft.slice(4)];
});
document.addEventListener("change", async ev => {
  const t = ev.target;
  if(t.id === "cal-dept"){ S.ui.calDept = t.value; render(); return; }
  if(t.id === "ddept"){ S.ui.ddept = t.value; render(); return; }
  if(t.id === "dformer"){ S.ui.dformer = t.checked; render(); return; }
  if(t.id === "doff"){ S.ui.doff = t.value; render(); return; }
  if(t.id === "att-office"){ S.ui.attOffice = t.value; render(); return; }
  if(t.id === "att-div"){ S.ui.attDiv = t.value; render(); return; }
  if(t.dataset.photo){ if(t.files?.[0]) setPhoto(t.dataset.photo, t.files[0]); return; }
  if(t.id === "logo-file"){ if(t.files?.[0]) setLogo(t.files[0]); return; }
  if(t.id === "emp-file"){ if(t.files?.[0]) readEmpFile(t.files[0]); return; }
  if(t.id === "emp-addnew"){ S.ui.empImp.addNew = t.checked; render(); return; }
  if(t.id === "att-file"){ if(t.files?.[0]) readAttFile(t.files[0]); return; }
  if(t.id === "restore-file"){ if(t.files?.[0]) readRestoreFile(t.files[0]); return; }
  if(t.dataset.rsel){ S.ui.restore.sel[t.dataset.rsel] = t.checked; render(); return; }
  if(t.id === "att-sheet"){ S.ui.attParse.sheet = Number(t.value); autoMap(); render(); return; }
  if(t.id === "att-dmy"){ S.ui.attParse.dmy = t.value === "1"; render(); return; }
  if(t.dataset.attmap){ S.ui.attParse.map[t.dataset.attmap] = t.value === "" ? null : Number(t.value); render(); return; }
  if((t.dataset.org || t.dataset.job !== undefined || t.dataset.jobacc !== undefined || t.classList.contains("flow-add")) && !isAdmin()){ toast("Only Admin can change this setting."); render(); return; }
  if(t.dataset.access){ if(!realAdmin()) return; const e0 = emp(t.dataset.id), e = clone(e0);
    if(t.dataset.access === "admin"){ if(!t.checked && S.D.employees.filter(x => x.admin).length <= 1){ toast("Keep at least one Admin."); render(); return; } e.admin = t.checked; }
    else e.role = roleFor(e.jobLevel, t.checked);
    await run(async () => { await store.put("employees", e); audit("access_changed", e.name, `${t.dataset.access} ${t.checked ? "granted" : "removed"}`); }, `${e.name}: ${t.dataset.access === "admin" ? "Admin" : "HRD"} access ${t.checked ? "granted" : "removed"}.`); return; }
  if(t.dataset.org){ await renameOrg(t.dataset.org, t.dataset.old, t.value); return; }
  if(t.dataset.job !== undefined){ const old = t.dataset.job, nv = t.value.trim(); if(!nv || nv === old) return render(); if(JOBS().some(j => j.name === nv)){ toast(`“${nv}” already exists.`); return render(); }
    const flows = clone(cfg().flows); for(const k in flows) flows[k] = flows[k].map(x => x === "job:" + old ? "job:" + nv : x); S.config = Object.assign(clone(cfg()), {flows});
    return updateJobs(JOBS().map(j => j.name === old ? Object.assign({}, j, {name:nv}) : j), e => e.jobLevel === old ? Object.assign(clone(e), {jobLevel:nv}) : null, `Renamed to “${nv}”.`); }
  if(t.dataset.jobacc !== undefined){ const name = t.dataset.jobacc, list = JOBS().map(j => j.name === name ? Object.assign({}, j, {access:t.value}) : j); S.config = Object.assign(clone(cfg()), {jobLevels:list});
    return updateJobs(list, e => { if(e.jobLevel !== name || e.role === "hrd") return null; const r = roleFor(name, false); return r !== e.role ? Object.assign(clone(e), {role:r}) : null; }, `Access for ${name} updated.`); }
  if(t.dataset.wd){ const w = Number(t.dataset.wd), cur = sched().workdays || []; await setCfg("schedule.workdays", t.checked ? [...new Set(cur.concat([w]))].sort() : cur.filter(x => x !== w)); return; }
  if(t.classList.contains("flow-add") && t.value){ await setCfg("flows."+t.dataset.k, (cfg().flows[t.dataset.k]||[]).concat([t.value])); return; }
  if(t.dataset.cfg){ const val = t.type === "checkbox" ? t.checked : t.type === "number" ? Number(t.value||0) : t.value; await setCfg(t.dataset.cfg, val); return; }
  const f = syncDraft(t); if(!f) return;
  const dk = f.dataset.draft;
  if(dk === "apply" && t.name === "type"){ render(); return; }
  if(dk === "apply") { document.getElementById("summary").innerHTML = applySummary(); return; }
  if(dk.startsWith("rv-") && t.type === "radio"){ const crit = cfg().criteria||[], vals = crit.map(c => Number(dv(dk,"s:"+c,0))).filter(Boolean); document.getElementById("rv-avg").textContent = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : "—"; return; }
  if(t.dataset.rerender || (dk === "task" && t.name === "supervisorId")){ if(dk === "task") delete S.drafts.task.members; renderModal(); return; }
  if(dk.startsWith("emp-") && (t.name === "status" || t.name === "gender")){ renderModal(); return; }
  if(dk.startsWith("emp-") && (t.name === "ctype" || t.name === "cstart" || t.name === "joinDate")){ if(t.name !== "cend") delete S.drafts[dk].cend; if(t.name === "ctype") for(const x of Object.keys(S.drafts[dk])) if(x.startsWith("g:")) delete S.drafts[dk][x]; if(t.name === "joinDate") delete S.drafts[dk].cstart; renderModal(); return; }
  if(dk.startsWith("ct-") && (t.name === "type" || t.name === "start")){ delete S.drafts[dk].end; if(t.name === "type") for(const x of Object.keys(S.drafts[dk])) if(x.startsWith("g:")) delete S.drafts[dk][x]; renderModal(); return; }
  if((dk.startsWith("ct-") || dk.startsWith("emp-")) && t.name === "grant"){ renderModal(); return; }
  if(dk.startsWith("qa-")){ if(t.name === "type") delete S.drafts[dk].amount; renderModal(); return; }
});
document.addEventListener("submit", async ev => {
  ev.preventDefault(); const f = ev.target, s = f.dataset.submit;
  if(s === "apply") return submitApply();
  if(s === "task") return saveTask();
  if(s === "review") return saveReview();
  if(s === "cand") return saveCand(f.dataset.id);
  if(s === "emp") return saveEmp();
  if(s === "contract") return saveContract();
  if(s === "quota") return saveQuota();
  if(s === "ann") return saveAnn();
  if((s === "job" || s === "org") && !isAdmin()) return;
  if(s === "job"){ const n = (dv("job-new","name","")||"").trim(); if(!n) return; if(JOBS().some(j => j.name === n)){ toast(`“${n}” already exists.`); return; } const a = dv("job-new","access","staff"); delete S.drafts["job-new"]; return setCfg("jobLevels", JOBS().concat([{name:n, access:a}])); }
  if(s === "org"){ const kind = f.dataset.k, n = (dv("org-"+kind,"name","")||"").trim(); if(!n) return; if((cfg()[kind]||[]).includes(n)){ toast(`“${n}” already exists.`); return; } delete S.drafts["org-"+kind]; return setCfg(kind, (cfg()[kind]||[]).concat([n])); }
  if(s === "rem") return saveRem();
  if(s === "link" && window.HRM){ const no = (dv("link","empNo","")||"").trim(), nmv = (dv("link","name","")||"").trim();
    if(!no || !nmv){ S.ui.linkErr = "Enter your Employee ID and full name."; render(); return; }
    try { const r = await window.HRM.claim(no, nmv);
      S.ui.linkErr = r === "pending" ? "" : r === "taken" ? "That profile is already connected to another account. Contact HRD." : "No employee matches that Employee ID and name. Check with HRD.";
      if(r === "pending") toast("Request sent. HRD or Admin will confirm it."); render(); } catch(e){ S.ui.linkErr = "Couldn't send the request. Try again."; render(); }
    return; }
  if(s === "link"){ const no = (dv("link","empNo","")||"").trim().toUpperCase(), nmv = normName(dv("link","name",""));
    const e = S.R.employees.find(x => !x.system && (x.empNo||"").toUpperCase() === no && (!nmv || normName(x.name) === nmv));
    if(!e){ S.ui.linkErr = "No employee matches that Employee ID and name. Check with HRD."; render(); return; }
    S.ui.linkErr = ""; return claimLink(e.id); }
  if(s === "note"){ const e0 = emp(f.dataset.id), k = "note-"+e0.id, text = (dv(k,"text","")||"").trim(); if(!text){ toast("Write the note first."); return; }
    if(dbOn() && !S.canEdit){ const nk = dv(k,"kind","Training"), date = dv(k,"date",today()); delete S.drafts[k]; return run(() => submitItem("note", {empId:e0.id, noteKind:nk, date, text}), "Note submitted. It appears on the timeline as soon as HR's app processes it."); }
    const e = clone(e0); e.notes = (e.notes||[]).concat([{id:uid("n"), date:dv(k,"date",today()), kind:dv(k,"kind","Training"), by:S.me, text}]); delete S.drafts[k];
    return run(async () => { await store.put("employees", e); audit("note_added", e.name, dv(k,"kind","Training")); if(e.id !== S.me) await notify(e.id, `New ${dv(k,"kind","Training").toLowerCase()} note on your profile`, `Added by ${nm(S.me)}`, "profile", e.id, "note",
      {intro:`${nm(S.me)} added a ${dv(k,"kind","Training").toLowerCase()} entry to your history.`, quote:text, cta:{label:"View my history", go:"profile", ref:e.id}}); }, "Entry saved."); }
  if(s === "hol"){ const date = dv("hol","date",""), name = (dv("hol","name","")||"").trim(); if(!date || !name){ toast("Enter a date and a name."); return; }
    const offices = dv("hol","offices",[]) || []; delete S.drafts.hol; return setCfg("holidays", (cfg().holidays||[]).filter(h => !(h.date === date && JSON.stringify(h.offices||[]) === JSON.stringify(offices))).concat([{date, name, offices}])); }
  if(s === "crit"){ const n = (dv("crit","name","")||"").trim(); if(!n) return; delete S.drafts.crit; return setCfg("criteria", (cfg().criteria||[]).concat([n])); }
});
document.addEventListener("dragover", ev => { const d = ev.target.closest?.("#att-drop,#emp-drop,#restore-drop"); if(d){ ev.preventDefault(); d.classList.add("over"); } });
document.addEventListener("dragleave", ev => { ev.target.closest?.("#att-drop,#emp-drop,#restore-drop")?.classList.remove("over"); });
document.addEventListener("drop", ev => { const d = ev.target.closest?.("#att-drop,#emp-drop,#restore-drop"); if(!d) return; ev.preventDefault(); const f = ev.dataTransfer?.files?.[0]; if(f) (d.id === "emp-drop" ? readEmpFile : d.id === "restore-drop" ? readRestoreFile : readAttFile)(f); });
document.addEventListener("keydown", ev => {
  if(ev.key === "Escape"){ if(S.modal){ S.modal = null; renderModal(); } else if(S.pop){ S.pop = null; renderTop(); } document.getElementById("app").classList.remove("open"); }
});

/* ================= boot ================= */
async function seed(){
  const d = sample();
  if(S.mode !== "db"){ for(const c of COLS) S.R[c] = d[c] || []; S.config = d.config; rebuild(); pickMe(); render(); return; }
  const {data, config} = migrateData(d, d.config, 1);
  const keepUid = id => S.R.employees.find(e => e.id === id)?.userId;
  await run(async () => {
    for(const c of COLS) for(const x of (data[c] || [])){ const doc = c === "employees" && keepUid(x.id) ? Object.assign({}, x, {userId:keepUid(x.id)}) : x; await withRetry(() => S.db.collection(c).doc(x.id).set(doc)); }
    await S.db.collection("config").doc("main").set(config); audit("sample_data_loaded", "", "");
  }, "Sample data loaded.");
}
function startDemo(){ const d = sample(); S.mode = "demo"; for(const c of COLS) S.R[c] = d[c] || []; S.config = d.config; rebuild(); pickMe(); render(); }
function resolveMe(){
  if(S.mode !== "db") return;
  const linked = S.R.employees.find(e => e.userId && e.userId === S.uid);
  S.realEmpId = linked?.id || null;
  if(S.preview && (!S.realEmpId || !S.R.employees.some(e => e.id === S.preview.id))) S.preview = null;
  S.me = S.preview ? S.preview.id : S.realEmpId;
}
let bootstrapping = false;
async function ownerBootstrap(){
  if(bootstrapping || !S.isOwner || !S.canEdit || !S.uid || S.realEmpId) return;
  if(S.R.employees.some(e => e.admin && e.userId)) return;
  bootstrapping = true;
  try {
    const sys = S.R.employees.find(e => e.system && e.admin && !e.userId);
    const base = sys ? emp(sys.id) : {id:"e00", empNo:"SYS-0001", name:"Admin", system:true, admin:true, role:"employee", jobLevel:"", position:"System Administrator", dept:"", division:"", office:"", supervisorId:null, joinDate:today(), status:"Active", email:S.who?.email || "", contracts:[], notes:[], quotaLog:[]};
    await putEmployee(Object.assign(clone(base), {userId:S.uid})); audit("owner_linked_as_admin", base.empNo, "");
  } catch(e){ console.warn("bootstrap", e); }
  bootstrapping = false;
}
/* links in notification emails open the right page: ?go=<view>&ref=<id> */
let DEEP = null;
try { const q = new URLSearchParams(location.search), v = q.get("go");
  if(v && /^[a-z]{3,20}$/.test(v)){ DEEP = {view:v, ref:/^[A-Za-z0-9_-]{1,60}$/.test(q.get("ref") || "") ? q.get("ref") : ""}; history.replaceState(null, "", location.pathname + location.hash); } } catch(e){}
function openDeep(){
  const d = DEEP; DEEP = null; if(!d || !S.me) return;
  if(d.view === "approvals" || d.view === "myrequests"){ const r = S.D.requests.find(x => x.id === d.ref); go(d.view === "approvals" && isLead() ? "approvals" : "myrequests"); if(r){ S.modal = {kind:"req", id:r.id}; renderModal(); } return; }
  if(d.view === "profile") return go("profile", d.ref ? {id:d.ref} : {});
  if(d.view === "announcements"){ if(d.ref){ S.ui["ann-"+d.ref] = true; markAnnRead([d.ref]); } return go("announcements"); }
  if(["reviews","reminders","directory","dashboard"].includes(d.view)) return go(d.view);
}
function logErr(msg){ if(!msg || S.errors.length > 20) return; S.errors.push(msg); if(S.errors.length <= 5) audit("client_error", String(msg).slice(0,160), APP_VERSION); }
async function boot(){
  try { const th = LS("hrm.theme"); if(th) document.documentElement.dataset.theme = th; } catch(e){}
  S.offline = typeof navigator !== "undefined" && navigator.onLine === false;
  window.addEventListener?.("online", () => { S.offline = false; render(); });
  window.addEventListener?.("offline", () => { S.offline = true; render(); });
  window.addEventListener?.("error", ev => logErr(ev.message));
  window.addEventListener?.("unhandledrejection", ev => logErr(String(ev.reason?.message || ev.reason || "")));
  render();
  if(window.HRM) window.HRM.onAssets = () => render();
  let db = null; try { db = window.claude?.use ? await window.claude.use("db") : null; } catch(e){ db = null; }
  if(!db){ startDemo(); return; }
  S.db = db; S.mode = "db";
  try { S.user = await window.claude.use("user"); } catch(e){ S.user = null; }
  if(S.user){ const m = await S.user.me(); S.uid = m.id; S.who = m; S.canEdit = !!m.canEdit; S.isOwner = !!m.isOwner; try { S.canWrite = await S.user.can("data.write"); } catch(e){} }
  const fail = e => { if(e && ["revoked","not_granted"].includes(e.code)) toast("Your access to this page changed. Reload to continue."); };
  const tick = () => {
    if(!S.loadedAll && CORE_COLS.every(c => S.loaded[c]) && S.loaded.config) S.loadedAll = true;
    rebuild(); resolveMe();
    if(S.loadedAll){ if(!S.realEmpId) ownerBootstrap(); render(); scheduleSync(); pruneOwnSubs(); if(DEEP && S.me) openDeep(); }
  };
  for(const c of SUB_COLS) db.collection(c).onSnapshot(snap => { S.R[c] = snap.docs.map(x => Object.assign({id:x.id}, x.data())); if(!snap.metadata.fromCache) S.loaded[c] = true; tick(); }, fail);
  db.collection("config").doc("main").onSnapshot(snap => {
    if(snap.exists){ const c = snap.data(); S.config = Object.assign(clone(DEFAULT_CONFIG), c, {flows:Object.assign(clone(DEFAULT_CONFIG.flows), c.flows), leaveTypes:Object.fromEntries(Object.entries(Object.assign(clone(DEFAULT_CONFIG.leaveTypes), c.leaveTypes||{})).map(([k,t]) => [k, Object.assign({}, DEFAULT_CONFIG.leaveTypes[k]||{}, t)])), email:Object.assign({}, DEFAULT_CONFIG.email, c.email), schedule:Object.assign({}, DEFAULT_CONFIG.schedule, c.schedule), jobLevels:c.jobLevels || clone(DEFAULT_CONFIG.jobLevels)}); }
    else S.config = Object.assign(clone(DEFAULT_CONFIG), {schemaVersion:SCHEMA});
    if(!snap.metadata.fromCache) S.loaded.config = true; tick(); }, fail);
  db.doc("ingest/state").onSnapshot(s2 => { S.R.ingest = s2.exists ? s2.data() : null; tick(); }, fail);
  if(S.canEdit) db.doc("sync/state").onSnapshot(s2 => { S.R.sync = s2.exists ? s2.data() : null; }, () => {});
  if(S.uid) db.collection(`pv/${S.uid}/d`).onSnapshot(snap => { S.pv = Object.fromEntries(snap.docs.map(d => [d.id, d.data()])); tick(); }, fail);
  setTimeout(() => { if(!S.loadedAll){ CORE_COLS.forEach(c => S.loaded[c] = true); S.loaded.config = true; tick(); } }, 8000);
}
boot();
})();
