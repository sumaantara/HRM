/* ONEderland HRM — attendance tablet (kiosk.html).
   Face recognition runs here in the browser (face-api / TensorFlow.js, models in vendor/face-api/model); only the 128-number
   descriptor of the face in front of the camera and a small proof photo are sent to the "kiosk" edge function, which matches
   it against the enrolled employees and records the scan with the server's time. PIN is the fallback. */
(function () {
  "use strict";
  const CFG = window.HRM_CONFIG || {}, FA = window.faceapi;
  const $ = (id) => document.getElementById(id);
  const LS = { get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } } };
  const q = new URLSearchParams(location.search), local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const TEST_NOLIVE = local && q.get("nolive") === "1";
  const FN = (CFG.functionsUrl || (CFG.supabaseUrl + "/functions/v1")) + "/kiosk";
  let token = LS.get("hrm.kiosk.token"), kiosk = LS.get("hrm.kiosk.info"), offset = 0, threshold = 0.5;

  /* ---------- server ---------- */
  async function call(action, body) {
    const r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json", apikey: CFG.supabaseKey, Authorization: "Bearer " + CFG.supabaseKey }, body: JSON.stringify(Object.assign({ action, token }, body || {})) });
    let j = {}; try { j = await r.json(); } catch (e) { /* empty */ }
    if (r.status === 401 && (j.error === "kiosk_revoked" || j.error === "no_token")) { unpair(); throw Object.assign(new Error("revoked"), { fatal: true }); }
    if (!r.ok) throw Object.assign(new Error(j.error || "http_" + r.status), { status: r.status, body: j });
    return j;
  }
  const nowIso = () => new Date(Date.now() + offset).toISOString();
  // scans made while offline are kept on the tablet and sent later with their (server-synced) time
  const queue = () => LS.get("hrm.kiosk.queue") || [];
  function enqueue(action, body) { const a = queue(); a.push({ action, body: Object.assign({}, body, { at: nowIso() }) }); LS.set("hrm.kiosk.queue", a.slice(-300)); netBadge(); }
  async function flush() {
    const a = queue(); if (!a.length || !navigator.onLine) return netBadge();
    const rest = [];
    for (const it of a) { try { await call(it.action, it.body); } catch (e) { if (e.fatal) return; if (!e.status || e.status >= 500) rest.push(it); } }
    LS.set("hrm.kiosk.queue", rest); netBadge();
  }
  function netBadge() { const n = queue().length, el = $("net"); el.textContent = !navigator.onLine ? `Offline · ${n} tersimpan` : n ? `${n} absen menunggu dikirim` : ""; el.classList.toggle("on", !navigator.onLine || n > 0); }
  window.addEventListener("online", () => { netBadge(); flush(); }); window.addEventListener("offline", netBadge);

  /* ---------- screens ---------- */
  const show = (id) => { for (const s of document.querySelectorAll(".screen")) s.classList.toggle("on", s.id === id); $("hdr").hidden = !(id === "cam" || id === "pin"); };
  let toastT = null; const toast = (m) => { const t = $("toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 3000); };
  const prompt = (id, en, cls) => { $("prompt").innerHTML = `<b>${id}</b><span>${en || ""}</span>`; $("ring").className = "ring " + (cls || ""); };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const LABEL = { in: ["Masuk", "Checked in"], out: ["Keluar", "Checked out"], back: ["Kembali", "Back in"] };
  let resultT = null;
  // after a result the next scan waits until the face has left the camera (next person), or 20 s at most
  let needGone = 0;
  function result(kind, html, ms) { const c = $("rcard"); c.className = "rcard " + (kind || ""); c.innerHTML = html; $("result").classList.add("on"); clearTimeout(resultT); resultT = setTimeout(() => { $("result").classList.remove("on"); busy = false; cooldownUntil = Date.now() + 1500; needGone = Date.now() + 20000; }, ms || 3500); }
  function greet() { const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: kiosk?.tz || "Asia/Makassar", hour: "numeric", hourCycle: "h23" }).format(new Date(Date.now() + offset))); return h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 19 ? "Selamat sore" : "Selamat malam"; }
  function showOk(r) {
    const [id, en] = LABEL[r.label] || LABEL.in;
    if (r.dup) return result("warn", `<h2>${esc(r.name)}</h2><div class="big">${esc(r.time)}</div><p>Sudah tercatat · Already recorded</p>`, 2800);
    result("", `<p>${greet()},</p><h2>${esc(r.name)}</h2><div class="big">${esc(r.time)}</div><p><b style="color:var(--ink)">${id}</b> · ${en}</p>`, 3500);
  }
  function clock() {
    if (!kiosk) return; const d = new Date(Date.now() + offset), tz = kiosk.tz || "Asia/Makassar";
    $("h-time").textContent = new Intl.DateTimeFormat("id-ID", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
    $("h-date").textContent = new Intl.DateTimeFormat("id-ID", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(d) + " · " + ({ "Asia/Jakarta": "WIB", "Asia/Makassar": "WITA", "Asia/Jayapura": "WIT" }[tz] || "");
  }
  setInterval(clock, 1000);

  /* ---------- pairing ---------- */
  function unpair() { token = null; kiosk = null; LS.set("hrm.kiosk.token", null); LS.set("hrm.kiosk.info", null); stopCam(); show("pair"); }
  $("pair-form").addEventListener("submit", async (ev) => {
    ev.preventDefault(); $("pair-err").textContent = "";
    try { const r = await call("pair", { code: $("pair-code").value }); token = r.token; kiosk = r.kiosk; LS.set("hrm.kiosk.token", token); LS.set("hrm.kiosk.info", kiosk); await hello(); startCam(); }
    catch (e) { $("pair-err").textContent = e.message === "code_invalid" ? "Kode salah atau kedaluwarsa · Invalid or expired code" : "Gagal · Failed (" + e.message + ")"; }
  });
  async function hello() {
    try { const t0 = Date.now(), r = await call("hello"); offset = Date.parse(r.serverTime) - (t0 + Date.now()) / 2; kiosk = r.kiosk; threshold = r.threshold || 0.5; LS.set("hrm.kiosk.info", kiosk);
      $("h-office").innerHTML = `${esc(kiosk.office)}<small>${esc(kiosk.name || "")}</small>`; clock(); flush(); }
    catch (e) { if (kiosk) { $("h-office").innerHTML = `${esc(kiosk.office)}<small>offline</small>`; } }
  }
  setInterval(() => { if (token) hello(); }, 10 * 60e3);
  setInterval(() => { if (token) flush(); }, 20e3);

  /* ---------- camera + face ---------- */
  let stream = null, running = false, busy = false, cooldownUntil = 0, modelsReady = false;
  async function loadModels() {
    if (modelsReady) return;
    const gl = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();
    try { if (!gl || !(await FA.tf.setBackend("webgl"))) await FA.tf.setBackend("cpu"); } catch (e) { await FA.tf.setBackend("cpu"); }
    await FA.tf.ready();
    const base = "vendor/face-api/model";
    await Promise.all([FA.nets.tinyFaceDetector.loadFromUri(base), FA.nets.faceLandmark68Net.loadFromUri(base), FA.nets.faceRecognitionNet.loadFromUri(base)]);
    modelsReady = true;
  }
  async function startCam() {
    show("cam"); prompt("Menyiapkan kamera…", "Starting the camera…");
    try {
      if (!stream) stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      $("video").srcObject = stream; await $("video").play().catch(() => {});
      await loadModels();
      try { if (navigator.wakeLock) await navigator.wakeLock.request("screen"); } catch (e) { /* not supported */ }
      running = true; loop();
    } catch (e) { prompt("Kamera tidak bisa dibuka", "Camera unavailable — use PIN (" + (e.name || e.message) + ")", ""); }
  }
  function stopCam() { running = false; if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && token && $("cam").classList.contains("on") && !running) startCam(); });

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ear = (e) => (dist(e[1], e[5]) + dist(e[2], e[4])) / (2 * dist(e[0], e[3]));
  let live = { since: 0, base: 0, closed: false, blinked: false, misses: 0 }, unknownTries = 0;
  const opts = () => new FA.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
  async function loop() {
    while (running) {
      await new Promise((r) => setTimeout(r, 120));
      if (busy || !$("cam").classList.contains("on") || Date.now() < cooldownUntil) continue;
      const v = $("video"); if (!v.videoWidth) continue;
      let det = null; try { det = await FA.detectSingleFace(v, opts()).withFaceLandmarks(); } catch (e) { continue; }
      if (needGone) { if (!det) { if (++live.misses > 4) needGone = 0; } else { live.misses = 0; if (Date.now() < needGone) { prompt("Silakan, berikutnya", "Next person, please", ""); continue; } needGone = 0; } if (needGone || !det) continue; }
      if (!det) { if (++live.misses > 4) { live = { since: 0, base: 0, closed: false, blinked: false, misses: 0 }; prompt("Lihat ke kamera", "Look at the camera"); } continue; }
      live.misses = 0;
      const box = det.detection.box;
      if (box.width < v.videoWidth * 0.22) { prompt("Mendekat sedikit", "Come a little closer", "face"); continue; }
      if (!live.since) live.since = Date.now();
      const e = (ear(det.landmarks.getLeftEye()) + ear(det.landmarks.getRightEye())) / 2;
      live.base = Math.max(live.base * 0.97, e);
      if (!TEST_NOLIVE && !live.blinked) {
        if (e < Math.min(0.24, live.base * 0.72)) live.closed = true;
        else if (live.closed && e > live.base * 0.85) live.blinked = true;
        if (!live.blinked) { prompt("Kedipkan mata", "Blink your eyes", "face"); if (Date.now() - live.since > 12000) prompt("Kedipkan mata pelan-pelan", "Blink slowly — or use PIN", "face"); continue; }
      }
      busy = true; prompt("Mencocokkan…", "Checking…", "go");
      let full = null; try { full = await FA.detectSingleFace(v, opts()).withFaceLandmarks().withFaceDescriptor(); } catch (err) { full = null; }
      if (!full) { busy = false; continue; }
      const body = { descriptor: Array.from(full.descriptor).map((x) => Math.round(x * 1e5) / 1e5), photo: snap() };
      live = { since: 0, base: 0, closed: false, blinked: false, misses: 0 };
      try {
        const r = await call("identify", body);
        if (r.ok) { unknownTries = 0; showOk(r); }
        else { unknownTries++; result("bad", `<h2>Wajah tidak dikenali</h2><p>Face not recognised${r.reason === "ambiguous" ? " (not sure who this is)" : ""}.</p><p>${unknownTries >= 2 ? "Silakan pakai PIN · Please use your PIN" : "Coba lagi, hadap lurus ke kamera · Try again, face the camera"}</p>`, 3000); if (unknownTries >= 2) setTimeout(openPin, 3000); }
      } catch (err) {
        if (err.fatal) return;
        if (!err.status || err.status >= 500) { enqueue("identify", body); result("warn", `<h2>Tersimpan offline</h2><p>Saved offline — sent automatically when the connection is back.</p>`, 3000); }
        else result("bad", `<h2>Gagal</h2><p>${esc(err.message)}</p>`, 3000);
      }
    }
  }
  function snap() {
    const v = $("video"), c = $("snap"), w = 240, h = Math.round(w * (v.videoHeight || 480) / (v.videoWidth || 640));
    c.width = w; c.height = h; const g = c.getContext("2d"); g.translate(w, 0); g.scale(-1, 1); g.drawImage(v, 0, 0, w, h);
    return c.toDataURL("image/jpeg", 0.6);
  }

  /* ---------- PIN ---------- */
  let pin = "";
  const keys = $("keys"); keys.innerHTML = ["1","2","3","4","5","6","7","8","9","⌫","0","✓"].map((k) => `<button type="button" data-k="${k}">${k}</button>`).join("");
  const dots = () => $("pin-dots").querySelectorAll("i").forEach((d, i) => d.classList.toggle("f", i < pin.length));
  keys.addEventListener("click", (ev) => { const k = ev.target.closest("[data-k]")?.dataset.k; if (!k) return; if (k === "⌫") pin = pin.slice(0, -1); else if (k === "✓") $("pin-form").requestSubmit(); else if (pin.length < 6) pin += k; dots(); });
  function openPin() { pin = ""; dots(); $("pin-err").textContent = ""; $("pin-emp").value = ""; show("pin"); setTimeout(() => $("pin-emp").focus(), 50); }
  $("btn-pin").addEventListener("click", openPin);
  $("pin-cancel").addEventListener("click", () => { unknownTries = 0; show("cam"); });
  $("btn-fs").addEventListener("click", () => { (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {}); });
  $("pin-form").addEventListener("submit", async (ev) => {
    ev.preventDefault(); const empNo = $("pin-emp").value.trim();
    if (!empNo || pin.length !== 6) { $("pin-err").textContent = "Isi ID karyawan dan 6 digit PIN · Enter your Employee ID and 6-digit PIN"; return; }
    const body = { empNo, pin, photo: stream ? snap() : "" }; pin = ""; dots();
    try {
      const r = await call("pin", body);
      if (r.ok) { unknownTries = 0; show("cam"); showOk(r); }
      else $("pin-err").textContent = r.reason === "locked" ? "Terlalu banyak percobaan — coba lagi 15 menit · Too many tries, wait 15 minutes" : r.reason === "no_pin" ? "PIN belum dibuat — atur di HRM → My Profile · No PIN set yet" : "ID atau PIN salah · Wrong ID or PIN";
    } catch (err) {
      if (err.fatal) return;
      if (!err.status || err.status >= 500) { enqueue("pin", body); show("cam"); result("warn", `<h2>Tersimpan offline</h2><p>Saved offline — sent automatically when the connection is back.</p>`, 3000); }
      else $("pin-err").textContent = "Gagal · Failed (" + err.message + ")";
    }
  });

  /* ---------- start ---------- */
  (async function boot() {
    if (!FA) { $("boot-msg").textContent = "Face library missing."; return; }
    if (!navigator.mediaDevices?.getUserMedia) $("boot-msg").textContent = "Kamera tidak didukung browser ini · Camera not supported";
    netBadge();
    if (!token) { show("pair"); return; }
    await hello(); if (token) startCam();
  })();
})();
