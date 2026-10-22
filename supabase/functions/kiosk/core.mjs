// ONEderland HRM — attendance tablet: pure logic shared by the edge function (Deno) and the local test server (Node).
export const pad = (n) => String(n).padStart(2, "0");
export const hhmm = (m) => (m == null || isNaN(m) ? "" : `${pad(Math.floor(m / 60) % 24)}:${pad(Math.round(m % 60))}`);

// same pairing as the fingerprint imports: first scan = in, last = out, gaps between pairs = breaks, scans < 2 min apart ignored
export function dayCalc(list) {
  const t = [...list].map(Number).filter((x) => !isNaN(x)).sort((a, b) => a - b).filter((x, i, a) => i === 0 || x - a[i - 1] >= 2);
  const n = t.length; if (!n) return null;
  if (n === 1) return { in: hhmm(t[0]), out: "", work: 0, brk: 0, n, miss: true };
  let brk = 0; for (let k = 1; 2 * k <= n - 2; k++) brk += t[2 * k] - t[2 * k - 1];
  return { in: hhmm(t[0]), out: hhmm(t[n - 1]), work: Math.max(0, t[n - 1] - t[0] - brk), brk, n, miss: n % 2 === 1 };
}

// local date / minute of day in the tablet's time zone (offices are in WIB and WITA)
export function localParts(date, tz) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz || "Asia/Makassar", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
  const h = Number(p.hour) % 24, m = Number(p.minute), s = Number(p.second);
  return { date: `${p.year}-${p.month}-${p.day}`, min: h * 60 + m, hm: `${pad(h)}:${pad(m)}`, hms: `${pad(h)}${pad(m)}${pad(s)}` };
}

// add a tablet scan to a day record (keeps fingerprint scans "mp" and tablet scans "kp" side by side)
export function applyPunch(day, minute) {
  const old = day || {}, kp = (old.kp || []).map(Number);
  if (kp.some((x) => Math.abs(x - minute) < 2)) return { day: old, dup: true, n: (old.n || kp.length) };   // same person again within 2 minutes
  const nkp = kp.concat([minute]).sort((a, b) => a - b), all = (old.mp || []).map(Number).concat(nkp), d = dayCalc(all);
  const src = old.src && old.src !== "KIOSK" && !String(old.src).includes("KIOSK") && (old.mp || []).length ? `${old.src}+KIOSK` : (old.src && String(old.src).includes("KIOSK") ? old.src : "KIOSK");
  const nd = Object.assign({}, old, d, { kp: nkp, src });
  if (!old.mp && (old.in || old.out) && !String(old.src || "").includes("KIOSK")) nd.note = [old.note, `sheet: ${old.in || "?"}–${old.out || "?"}`].filter(Boolean).join(" · ");
  return { day: nd, dup: false, n: d.n };
}
export const punchLabel = (n) => (n === 1 ? "in" : n % 2 === 0 ? "out" : "back");

export const euclid = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d; } return Math.sqrt(s); };
// best match among enrolled people (each person: several descriptors); needs to be clearly better than the runner-up
export function matchFace(desc, people, threshold = 0.5) {
  let best = null, second = null;
  for (const p of people) {
    const d = Math.min(...(p.desc || []).map((x) => euclid(desc, x)));
    if (!isFinite(d)) continue;
    if (!best || d < best.dist) { second = best; best = { empId: p.empId, dist: d }; } else if (!second || d < second.dist) second = { empId: p.empId, dist: d };
  }
  if (!best || best.dist > threshold) return { empId: null, dist: best ? best.dist : null };
  if (second && second.dist - best.dist < 0.04) return { empId: null, dist: best.dist, ambiguous: true };
  return { empId: best.empId, dist: best.dist };
}
export const validDesc = (d) => Array.isArray(d) && d.length === 128 && d.every((x) => typeof x === "number" && isFinite(x) && Math.abs(x) < 10);
export const weakPin = (p) => !/^\d{6}$/.test(p) || /^(\d)\1{5}$/.test(p) || "0123456789".includes(p) || "9876543210".includes(p);
