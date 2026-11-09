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
  const FN = (CFG.functionsUrl || (CFG.supabaseUrl + "/functions/v1")) + "/kiosk";
  let token = LS.get("hrm.kiosk.token"), kiosk = LS.get("hrm.kiosk.info"), offset = 0, threshold = 0.5;
  // what the tablet is doing, sent with "hello" so HR / support can see why a tablet doesn't record (no photos, no personal data)
  const D = { v: "4.1", ua: navigator.userAgent.slice(0, 160), stage: "start", backend: "", modelsMs: 0, cam: "", detMs: 0, frames: 0, faces: 0, sent: 0, err: "" };
  const diagErr = (e) => { D.err = String((e && (e.name ? e.name + ": " : "") + (e.message || e)) || "").slice(0, 160); };

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
  const prompt = (id, en, cls) => { $("prompt").innerHTML = `<b>${id}</b><span>${en || ""}</span>`; $("ring").className = "ring " + (cls || ""); D.stage = String(en || id).slice(0, 60); diagLine(); };
  // tap the clock 5 times to see the diagnostics line
  let taps = 0, tapT = 0; const diagLine = () => { const el = $("diag"); if (el && el.classList.contains("on")) el.textContent = `${D.backend || "?"} · det ${D.detMs} ms · frames ${D.frames} · faces ${D.faces} · sent ${D.sent} · ${D.cam}${D.err ? " · " + D.err : ""}`; };
  document.addEventListener("click", (ev) => { if (!ev.target.closest || !ev.target.closest(".clock")) return; const n = Date.now(); taps = n - tapT < 800 ? taps + 1 : 1; tapT = n; if (taps >= 5) { $("diag").classList.toggle("on"); diagLine(); taps = 0; } });
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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
    try { const t0 = Date.now(), r = await call("hello", { diag: D }); offset = Date.parse(r.serverTime) - (t0 + Date.now()) / 2; kiosk = r.kiosk; threshold = r.threshold || 0.5; LS.set("hrm.kiosk.info", kiosk);
      $("h-office").innerHTML = `${esc(kiosk.office)}<small>${esc(kiosk.name || "")}</small>`; clock(); flush(); }
    catch (e) { if (kiosk) { $("h-office").innerHTML = `${esc(kiosk.office)}<small>offline</small>`; } }
  }
  setInterval(() => { if (token) hello(); }, 10 * 60e3);
  setInterval(() => { if (token) flush(); }, 20e3);

  /* ---------- camera + face ---------- */
  // Flow: the person taps IN or OUT → the tablet looks for a known face for up to 30 seconds →
  // success: chime + "Success" + their name · nothing after 30 s: "Please try again". No blink / eyes-closed step.
  let stream = null, running = false, busy = false, modelsReady = false;
  let mode = null, deadline = 0, lastSend = 0, stable = 0, misses = 0, resultT = null, cdT = null;
  const SCAN_MS = 30000, SEND_GAP = 1300;
  async function loadModels() {
    if (modelsReady) return;
    const gl = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();
    const t0 = Date.now();
    try { if (!gl || !(await FA.tf.setBackend("webgl"))) await FA.tf.setBackend("cpu"); } catch (e) { await FA.tf.setBackend("cpu"); }
    await FA.tf.ready();
    // older iPads: WebGL can be present but compute wrong numbers — check once and fall back to the CPU
    if (FA.tf.getBackend() === "webgl") { try { const r = FA.tf.tidy(() => FA.tf.tensor1d([1.5, -2.25, 3]).mul(2).add(0.5).dataSync()); if (Math.abs(r[0] - 3.5) > 1e-2 || Math.abs(r[1] + 4) > 1e-2 || Math.abs(r[2] - 6.5) > 1e-2) throw new Error("webgl_math"); } catch (e) { diagErr(e); await FA.tf.setBackend("cpu"); await FA.tf.ready(); } }
    D.backend = FA.tf.getBackend();
    const base = "vendor/face-api/model";
    await Promise.all([FA.nets.tinyFaceDetector.loadFromUri(base), FA.nets.faceLandmark68Net.loadFromUri(base), FA.nets.faceRecognitionNet.loadFromUri(base)]);
    modelsReady = true; D.modelsMs = Date.now() - t0;
  }
  async function startCam() {
    show("cam"); idle(); prompt("Menyiapkan kamera…", "Starting the camera…"); $("choose").classList.add("wait");
    try {
      if (!stream) stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      $("video").srcObject = stream; await $("video").play().catch(() => {});
      prompt("Menyiapkan pengenal wajah…", "Loading face recognition…"); D.stage = "models";
      await loadModels(); setTimeout(() => { if (token) hello(); }, 45e3);   // first report after it has run for a while
      try { if (navigator.wakeLock) await navigator.wakeLock.request("screen"); } catch (e) { /* not supported */ }
      $("choose").classList.remove("wait"); idle();
      running = true; loop();
    } catch (e) { diagErr(e); $("choose").classList.remove("wait"); prompt("Kamera tidak bisa dibuka", "Camera unavailable — use PIN (" + (e.name || e.message) + ")", ""); if (token) hello(); }
  }
  function stopCam() { running = false; if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && token && $("cam").classList.contains("on") && !running) startCam(); });

  /* ---------- sound ---------- */
  let AC = null, voiceReady = false;
  function unlockAudio() {   // iPad only plays sound after a tap, so this runs on the IN / OUT tap
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (e) { AC = null; }
    try { if (window.speechSynthesis && !voiceReady) { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); voiceReady = true; } } catch (e) { /* no voice */ }
  }
  function tone(notes) {
    if (!AC) return; let t = AC.currentTime + 0.01;
    for (const [f, d] of notes) { const o = AC.createOscillator(), g = AC.createGain(); o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + 0.03); t += d * 0.85; }
  }
  function say(text) { try { const s = window.speechSynthesis; if (!s) return; s.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = 0.95; u.volume = 1; s.speak(u); } catch (e) { /* no voice */ } }
  const soundOk = (text) => { tone([[880, 0.12], [1320, 0.2]]); setTimeout(() => say(text || "Success"), 280); };
  const soundFail = () => { tone([[392, 0.22], [262, 0.34]]); setTimeout(() => say("Please try again"), 380); };

  /* ---------- choose → scan → result ---------- */
  const DIR = { in: ["IN", "Masuk"], out: ["OUT", "Pulang"] };
  const CK = (k) => `<div class="okmark ${k || ""}"><svg viewBox="0 0 52 52" aria-hidden="true">${k ? '<path class="ck" d="M26 14v16M26 38v1"/>' : '<path class="ck" d="M14 27l8 8 16-17"/>'}</svg></div>`;
  function idle() {
    mode = null; busy = false; clearInterval(cdT); $("cd").style.width = "0"; $("cam").classList.remove("scanning", "d-in", "d-out");
    prompt("Tekan IN atau OUT", "Tap IN or OUT, then look at the camera", "");
  }
  function begin(dir) {
    if (!modelsReady || !running) return;
    unlockAudio(); mode = dir; deadline = Date.now() + SCAN_MS; lastSend = 0; stable = 0; misses = 0;
    $("cam").classList.remove("d-in", "d-out"); $("cam").classList.add("scanning", "d-" + dir); $("scan-dir").textContent = `${DIR[dir][0]} · ${DIR[dir][1]}`; $("scan-dir").className = "scan-dir " + dir;
    prompt("Lihat ke kamera", "Look at the camera", "face");
    clearInterval(cdT); cdT = setInterval(() => { const left = Math.max(0, deadline - Date.now()); $("cd").style.width = (left / SCAN_MS * 100) + "%"; $("cd-s").textContent = Math.ceil(left / 1000) + " s"; }, 200);
  }
  $("btn-in").addEventListener("click", () => begin("in"));
  $("btn-out").addEventListener("click", () => begin("out"));
  $("btn-cancel").addEventListener("click", () => idle());
  function result(kind, html, ms) { const c = $("rcard"); c.className = "rcard " + (kind || ""); c.innerHTML = html; $("result").classList.add("on"); clearTimeout(resultT); resultT = setTimeout(() => { $("result").classList.remove("on"); idle(); }, ms || 4000); }
  function greet() { const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: kiosk?.tz || "Asia/Makassar", hour: "numeric", hourCycle: "h23" }).format(new Date(Date.now() + offset))); return h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 19 ? "Selamat sore" : "Selamat malam"; }
  function showOk(r, dir) {
    mode = null; clearInterval(cdT); $("cam").classList.remove("scanning");
    const d = DIR[r.dir || dir] || null;
    if (r.dup) { soundOk("Already recorded"); return result("warn", `${CK("warn")}<h2>${esc(r.name)}</h2><div class="big">${esc(r.time)}</div><p>Sudah tercatat · Already recorded</p>`, 3200); }
    soundOk("Success");
    result("ok", `${CK()}<p>${greet()},</p><h2>${esc(r.name)}</h2><div class="big">${esc(r.time)}</div><p><b class="dirtag ${esc(r.dir || dir || "")}">${d ? d[0] : "TERCATAT"}</b> · ${d ? d[1] : "Recorded"}</p>`, 4000);
  }
  function fail() {
    mode = null; clearInterval(cdT); $("cam").classList.remove("scanning"); soundFail();
    result("bad", `${CK("bad")}<h2>Silakan coba lagi</h2><p>Please try again — face not recognised within 30 seconds.</p><p>Hadap lurus ke kamera di tempat yang terang, atau pakai PIN.</p>`, 4200);
  }
  const opts = () => new FA.TinyFaceDetectorOptions({ inputSize: D.detMs > 400 ? 224 : 320, scoreThreshold: 0.45 });
  async function loop() {
    while (running) {
      await new Promise((r) => setTimeout(r, mode ? 80 : 300));
      if (!mode || busy || !$("cam").classList.contains("on")) continue;
      if (Date.now() > deadline) { fail(); continue; }
      const v = $("video"); if (!v.videoWidth) continue;
      D.cam = `${v.videoWidth}x${v.videoHeight}`;
      let det = null; const t1 = Date.now();
      try { det = await FA.detectSingleFace(v, opts()).withFaceLandmarks().withFaceDescriptor(); } catch (e) { diagErr(e); continue; }
      D.frames++; D.detMs = Math.round(D.detMs ? D.detMs * 0.8 + (Date.now() - t1) * 0.2 : Date.now() - t1);
      if (!mode) continue;
      if (!det) { stable = 0; if (++misses > 2) prompt("Lihat ke kamera", "Look at the camera", ""); continue; }
      D.faces++; misses = 0;
      if (det.detection.box.width < v.videoWidth * 0.2) { stable = 0; prompt("Mendekat sedikit", "Come a little closer", "face"); continue; }
      if (++stable < 2) { prompt("Tahan sebentar…", "Hold still…", "face"); continue; }   // two clear frames in a row
      if (Date.now() - lastSend < SEND_GAP) continue;
      busy = true; lastSend = Date.now(); prompt("Mencocokkan…", "Checking…", "go"); D.sent++;
      const dir = mode, body = { descriptor: Array.from(det.descriptor).map((x) => Math.round(x * 1e5) / 1e5), photo: snap(), dir };
      try {
        const r = await call("identify", body);
        if (!mode) { busy = false; continue; }   // cancelled meanwhile
        if (r.ok) showOk(r, dir);
        else { busy = false; stable = 0; prompt("Belum dikenali — tetap hadap kamera", r.reason === "ambiguous" ? "Not sure who this is — keep looking at the camera" : "Not recognised yet — keep looking at the camera", "face"); }
      } catch (err) {
        if (err.fatal) return;
        if (!err.status || err.status >= 500) { enqueue("identify", body); mode = null; soundOk("Saved"); result("warn", `${CK("warn")}<h2>Tersimpan offline</h2><p>Saved offline — sent automatically when the connection is back.</p>`, 3500); }
        else { busy = false; prompt("Gagal — coba lagi", "Failed (" + err.message + ")", ""); }
      }
    }
  }
  function snap() {
    const v = $("video"), c = $("snap"), w = 240, h = Math.round(w * (v.videoHeight || 480) / (v.videoWidth || 640));
    c.width = w; c.height = h; const g = c.getContext("2d"); g.translate(w, 0); g.scale(-1, 1); g.drawImage(v, 0, 0, w, h);
    return c.toDataURL("image/jpeg", 0.6);
  }

  /* ---------- PIN ---------- */
  let pin = "", pinDir = "in";
  const keys = $("keys"); keys.innerHTML = ["1","2","3","4","5","6","7","8","9","⌫","0","✓"].map((k) => `<button type="button" data-k="${k}">${k}</button>`).join("");
  const dots = () => $("pin-dots").querySelectorAll("i").forEach((d, i) => d.classList.toggle("f", i < pin.length));
  const pinDirShow = () => document.querySelectorAll("[data-pdir]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pdir === pinDir)));
  document.querySelectorAll("[data-pdir]").forEach((b) => b.addEventListener("click", () => { pinDir = b.dataset.pdir; pinDirShow(); }));
  keys.addEventListener("click", (ev) => { const k = ev.target.closest("[data-k]")?.dataset.k; if (!k) return; if (k === "⌫") pin = pin.slice(0, -1); else if (k === "✓") $("pin-form").requestSubmit(); else if (pin.length < 6) pin += k; dots(); });
  function openPin() { unlockAudio(); pinDir = mode || pinDir || "in"; mode = null; clearInterval(cdT); $("cam").classList.remove("scanning"); $("cam").classList.remove("d-in", "d-out"); pin = ""; dots(); pinDirShow(); $("pin-err").textContent = ""; $("pin-emp").value = ""; show("pin"); setTimeout(() => $("pin-emp").focus(), 50); }
  $("btn-pin").addEventListener("click", openPin);
  $("btn-pin2").addEventListener("click", openPin);
  $("pin-cancel").addEventListener("click", () => { show("cam"); idle(); });
  // Full screen: best is "Add to Home Screen" (opens with no Safari bar at all). Otherwise try the Fullscreen API.
  const standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches);
  if (standalone) document.documentElement.classList.add("standalone");
  const fsMark = () => document.documentElement.classList.toggle("fs", !!(document.fullscreenElement || document.webkitFullscreenElement));
  document.addEventListener("fullscreenchange", fsMark); document.addEventListener("webkitfullscreenchange", fsMark);
  $("btn-fs").addEventListener("click", () => {
    const de = document.documentElement, fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    const req = de.requestFullscreen || de.webkitRequestFullscreen, exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (fsEl && exit) { try { exit.call(document); } catch (e) { /* ignore */ } return; }
    let p = null; try { p = req ? req.call(de) : null; } catch (e) { p = null; }
    const hint = () => toast("Untuk layar penuh: Safari → tombol Share → \"Add to Home Screen\", lalu buka dari ikon ONE Absen");
    if (!req) return hint();
    if (p && p.catch) p.catch(hint);
    setTimeout(() => { if (!(document.fullscreenElement || document.webkitFullscreenElement)) hint(); }, 700);
  });
  $("pin-form").addEventListener("submit", async (ev) => {
    ev.preventDefault(); const empNo = $("pin-emp").value.trim();
    if (!empNo || pin.length !== 6) { $("pin-err").textContent = "Isi ID karyawan dan 6 digit PIN · Enter your Employee ID and 6-digit PIN"; return; }
    const dir = pinDir, body = { empNo, pin, photo: stream ? snap() : "", dir }; pin = ""; dots();
    try {
      const r = await call("pin", body);
      if (r.ok) { show("cam"); showOk(r, dir); }
      else { soundFail(); $("pin-err").textContent = r.reason === "locked" ? "Terlalu banyak percobaan — coba lagi 15 menit · Too many tries, wait 15 minutes" : r.reason === "no_pin" ? "PIN belum dibuat — atur di HRM → My Profile · No PIN set yet" : "ID atau PIN salah · Wrong ID or PIN"; }
    } catch (err) {
      if (err.fatal) return;
      if (!err.status || err.status >= 500) { enqueue("pin", body); show("cam"); soundOk("Saved"); result("warn", `${CK("warn")}<h2>Tersimpan offline</h2><p>Saved offline — sent automatically when the connection is back.</p>`, 3500); }
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
