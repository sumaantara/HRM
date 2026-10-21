/* ONEderland HRM — Supabase backend adapter.
   The app (app.js) talks to a small document API: collection(path).doc(id).get/set/delete/onSnapshot, plus user,
   downloads, assets and mail. This file provides that API on top of Supabase (Postgres + RLS, Auth, Storage,
   Realtime, Edge Functions) and shows the sign-in screen before the app starts.
   Access is enforced in the database (supabase/migrations) — nothing here is trusted for security. */
(function () {
  "use strict";
  const CFG = window.HRM_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  if (!window.supabase || !CFG.supabaseUrl || !CFG.supabaseKey) {
    document.addEventListener("DOMContentLoaded", () => showFatal("The app isn't configured yet (js/config.js)."));
    return;
  }
  // links from invitation / password-reset emails land here with #...&type=invite|recovery
  const LINK = (() => { try { const h = new URLSearchParams(location.hash.slice(1)); return { type: h.get("type") || "", error: h.get("error_description") || "" }; } catch (e) { return { type: "", error: "" }; } })();
  const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  /* ------------------------------------------------------------------ session & identity */
  let who = null;          // {id, email, name, confirmed, level}
  let readyResolve;
  const ready = new Promise((r) => (readyResolve = r));

  async function whoami() {
    const { data, error } = await sb.rpc("hrm_whoami");
    if (error) throw error;
    return data;
  }
  let entering = false;
  async function enter() {
    if (entering || who) return;
    entering = true;
    let w;
    try { w = await whoami(); } catch (e) { entering = false; throw e; }
    if (w && w.level === 0) {
      try {
        const { data } = await sb.rpc("hrm_link_by_email");
        if (data === "linked") w = await whoami();
      } catch (e) { /* stays unlinked; the app shows the link screen */ }
    }
    who = w;
    hideAuth();
    readyResolve();
    watchLevel();
  }
  // Re-check access periodically: when HR links/unlinks an account or changes a role, reload into the new access level.
  function watchLevel() {
    const tick = async () => {
      if (document.visibilityState === "visible") {
        try {
          const w = await whoami();
          if (!w) return location.reload();
          if (w.level !== who.level) return location.reload();
        } catch (e) { /* offline: try later */ }
      }
      setTimeout(tick, who.level <= 0 ? 15000 : 60000);
    };
    setTimeout(tick, who.level <= 0 ? 15000 : 60000);
  }

  sb.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") { authView = "newpass"; showAuth(); return; }
    if (event === "SIGNED_OUT") { location.reload(); return; }
    if (session && !who && !setsPassword() && event !== "INITIAL_SESSION") enter().catch(fatalFromError);
  });

  async function start() {
    const hashErr = LINK.error;
    const { data } = await sb.auth.getSession();
    if (data.session && !setsPassword()) {
      try { await enter(); } catch (e) { fatalFromError(e); }
    } else {
      showAuth(hashErr ? decodeURIComponent(hashErr.replace(/\+/g, " ")) : "");
    }
  }

  /* ------------------------------------------------------------------ sign-in screen */
  let authView = LINK.type === "invite" ? "welcome" : LINK.type === "recovery" ? "newpass" : "signin";
  let authMsg = "";
  const setsPassword = () => authView === "newpass" || authView === "welcome";
  function showAuth(msg) {
    if (msg !== undefined) authMsg = msg;
    const el = $("auth");
    el.hidden = false;
    document.body.classList.add("auth-on");
    const name = CFG.appName || "HRM";
    const f = (inner, submit) => `<form class="auth-form" data-auth="${authView}" novalidate>${inner}
      <button class="btn pri" type="submit">${submit}</button></form>`;
    const email = `<label class="f"><span>Work email</span><input type="email" name="email" autocomplete="email" required placeholder="name@company.com"></label>`;
    const pass = (lbl, ac) => `<label class="f"><span>${lbl}</span><input type="password" name="password" autocomplete="${ac}" required minlength="8"></label>`;
    let body = "";
    if (authView === "signin") body = f(email + pass("Password", "current-password"), "Sign in") +
      `<div class="auth-links auth-links-end"><button type="button" class="btn link" data-av="forgot">Forgot password?</button></div>
       <p class="auth-alt">No account yet? HR sends you an invitation by email.</p>`;
    if (authView === "forgot") body = f(email, "Send reset link") +
      `<p class="auth-alt"><button type="button" class="btn link" data-av="signin">Back to sign in</button></p>`;
    if (authView === "newpass" || authView === "welcome") body = f(pass("New password (min. 8 characters)", "new-password") +
      `<label class="f"><span>Repeat the password</span><input type="password" name="password2" autocomplete="new-password" required minlength="8"></label>`, authView === "welcome" ? "Set password & sign in" : "Save new password") +
      (authView === "welcome" ? `<p class="auth-hint">You'll use your work email and this password to sign in from now on.</p>` : "");
    const titles = { signin: "Sign in", forgot: "Reset your password", newpass: "Set a new password", welcome: "Welcome! Set your password" };
    el.innerHTML = `<div class="auth-card" role="dialog" aria-labelledby="auth-t">
      ${CFG.logo ? `<div class="auth-brand auth-logo"><img src="${esc(CFG.logo)}" alt="${esc(name)}"></div>`
        : `<div class="auth-brand"><span class="logo" aria-hidden="true">${esc(name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase())}</span><div><b>${esc(name)}</b><small>${esc(CFG.tagline || "Human Resource Management")}</small></div></div>`}
      <h1 id="auth-t">${titles[authView]}</h1>
      ${authMsg ? `<div class="note ${/sent|check|saved|created/i.test(authMsg) ? "" : "warn"}" role="status"><div>${esc(authMsg)}</div></div>` : ""}
      ${body}
      <p class="auth-foot">Access is personal. Your actions are recorded under your account.</p></div>`;
    const first = el.querySelector("input");
    if (first) first.focus();
  }
  function hideAuth() { const el = $("auth"); if (el) { el.hidden = true; el.innerHTML = ""; } document.body.classList.remove("auth-on"); }
  function redirectTo() { return CFG.siteUrl || (location.origin + location.pathname); }
  const friendly = (e) => {
    const m = (e && (e.message || e.error_description)) || "Something went wrong.";
    if (/invalid login/i.test(m)) return "Email or password is incorrect.";
    if (/email not confirmed/i.test(m)) return "Confirm your email first — open the link we sent you, then sign in.";
    if (/rate limit|too many/i.test(m)) return "Too many attempts. Wait a few minutes and try again.";
    if (/same.*password|different from the old/i.test(m)) return "Choose a password you haven't used before.";
    if (/session missing|expired|invalid.*token/i.test(m)) return "This link has expired or was already used. Ask HR to resend the invitation, or use “Forgot password?”.";
    if (/fetch|network/i.test(m)) return "Can't reach the server. Check your connection.";
    return m;
  };

  document.addEventListener("click", (ev) => {
    const b = ev.target.closest && ev.target.closest("[data-av]");
    if (!b || !$("auth") || $("auth").hidden) return;
    authView = b.dataset.av; authMsg = ""; showAuth();
  });
  document.addEventListener("submit", async (ev) => {
    const form = ev.target.closest && ev.target.closest("form[data-auth]");
    if (!form) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    const v = Object.fromEntries(new FormData(form).entries());
    const email = String(v.email || "").trim().toLowerCase();
    const btn = form.querySelector("button[type=submit]"); btn.disabled = true;
    try {
      const kind = form.dataset.auth;
      if (kind !== "newpass" && kind !== "welcome" && !/^\S+@\S+\.\S+$/.test(email)) throw { message: "Enter a valid email address." };
      if (kind === "signin") {
        const { error } = await sb.auth.signInWithPassword({ email, password: v.password });
        if (error) throw error;
      } else if (kind === "forgot") {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirectTo() });
        if (error) throw error;
        authView = "signin"; showAuth("If that email has an account, a reset link was sent.");
        return;
      } else if (kind === "newpass" || kind === "welcome") {
        if (String(v.password || "").length < 8) throw { message: "Use at least 8 characters for the password." };
        if (v.password !== v.password2) throw { message: "The two passwords don't match." };
        const { data: cur } = await sb.auth.getSession();
        if (!cur.session) throw { message: "This link has expired or was already used. Ask HR to resend the invitation, or use “Forgot password?”." };
        const { error } = await sb.auth.updateUser({ password: v.password });
        if (error) throw error;
        authView = "signin"; history.replaceState(null, "", location.pathname);
        await enter();
        return;
      }
    } catch (e) {
      authMsg = friendly(e); showAuth();
    } finally { if (btn.isConnected) btn.disabled = false; }
  }, true);

  function showFatal(msg) {
    const el = $("auth"); if (!el) return;
    el.hidden = false; document.body.classList.add("auth-on");
    el.innerHTML = `<div class="auth-card"><h1>Can't open the HRM</h1><div class="note warn"><div>${esc(msg)}</div></div><button class="btn" type="button" id="auth-retry">Try again</button></div>`;
    const r = document.getElementById("auth-retry"); if (r) r.addEventListener("click", () => location.reload());
  }
  function fatalFromError(e) { console.error(e); showFatal(friendly(e)); }

  /* ------------------------------------------------------------------ document store */
  const segs = (p) => p.split("/");
  const colOf = (p) => p.replace(/\/[^/]+$/, "");
  const clone = (o) => (o == null ? o : JSON.parse(JSON.stringify(o)));
  function mapErr(e) {
    const m = (e && e.message) || "";
    if (e && (e.code === "42501" || e.status === 403 || /row-level security|denied|permission/i.test(m))) return { code: "invalid_argument", message: m };
    if ((typeof navigator !== "undefined" && navigator.onLine === false) || /fetch|network|timeout/i.test(m) || (e && e.status >= 500)) return { code: "unavailable", message: m };
    return { code: "internal", message: m };
  }
  const snapOf = (path, row) => ({
    id: segs(path).pop(), exists: !!row,
    data: () => (row ? clone(row.data) : undefined),
    metadata: { fromCache: false, hasPendingWrites: false },
  });

  // live cache: collections and single docs that the app listens to
  const cols = new Map();   // col -> {rows: Map(path,row), subs:Set, loaded}
  const docs = new Map();   // path -> {row, subs:Set, loaded}
  const pending = new Set();
  let flushT = null;
  function schedule(entry) { pending.add(entry); if (!flushT) flushT = setTimeout(flush, 30); }
  function flush() {
    flushT = null;
    const list = [...pending]; pending.clear();
    for (const en of list) {
      if (!en.loaded) continue;
      if (en.rows) {
        const snap = { docs: [...en.rows.values()].sort((a, b) => (a.path < b.path ? -1 : 1)).map((r) => snapOf(r.path, r)), metadata: { fromCache: false } };
        snap.size = snap.docs.length;
        for (const s of en.subs) try { s.next(snap); } catch (e) { console.error(e); }
      } else {
        for (const s of en.subs) try { s.next(snapOf(en.path, en.row)); } catch (e) { console.error(e); }
      }
    }
  }
  function applyRow(row) {          // newer versions win
    const c = cols.get(row.col);
    if (c) { const cur = c.rows.get(row.path); if (!cur || (row.version || 0) >= (cur.version || 0)) { c.rows.set(row.path, row); schedule(c); } }
    const d = docs.get(row.path);
    if (d) { if (!d.row || (row.version || 0) >= (d.row.version || 0)) { d.row = row; schedule(d); } }
  }
  function removePath(path) {
    const c = cols.get(colOf(path));
    if (c && c.rows.delete(path)) schedule(c);
    const d = docs.get(path);
    if (d && d.row) { d.row = null; schedule(d); }
  }

  async function fetchCol(col) {
    const out = []; const page = 1000;
    for (let from = 0; ; from += page) {
      const { data, error } = await sb.from("docs").select("path,col,data,version").eq("col", col).order("path").range(from, from + page - 1);
      if (error) throw error;
      out.push(...data);
      if (data.length < page) break;
    }
    return out;
  }
  async function fetchDoc(path) {
    const { data, error } = await sb.from("docs").select("path,col,data,version").eq("path", path).maybeSingle();
    if (error) throw error;
    return data;
  }
  async function loadCol(col, en) {
    const rows = await fetchCol(col);
    const fresh = new Map(rows.map((r) => [r.path, r]));
    for (const [p, cur] of en.rows) { const f = fresh.get(p); if (f && (cur.version || 0) > (f.version || 0)) fresh.set(p, cur); }
    en.rows = fresh; en.loaded = true; schedule(en);
  }
  async function loadDoc(path, en) {
    const row = await fetchDoc(path);
    if (!(en.row && row && (en.row.version || 0) > (row.version || 0))) en.row = row;
    en.loaded = true; schedule(en);
  }
  async function refreshAll() {
    for (const [col, en] of cols) if (en.subs.size) loadCol(col, en).catch((e) => en.subs.forEach((s) => s.error && s.error(mapErr(e))));
    for (const [path, en] of docs) if (en.subs.size) loadDoc(path, en).catch(() => {});
  }

  let channel = null, wasDown = false;
  function startRealtime() {
    if (channel) return;
    channel = sb.channel("hrm-docs")
      .on("postgres_changes", { event: "*", schema: "public", table: "docs" }, (p) => {
        if (p.eventType === "DELETE") { if (p.old && p.old.path) removePath(p.old.path); }
        else if (p.new && p.new.path) applyRow(p.new);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") { if (wasDown) refreshAll(); wasDown = false; }
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") wasDown = true;
      });
    // safety net: catch anything realtime missed
    setInterval(() => { if (document.visibilityState === "visible") refreshAll(); }, 120000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refreshAll(); });
    window.addEventListener("online", refreshAll);
  }

  function docRef(path) {
    if (segs(path).length % 2) throw new Error("A document path needs an even number of segments: " + path);
    return {
      id: segs(path).pop(), path,
      async get() { try { return snapOf(path, await fetchDoc(path)); } catch (e) { throw mapErr(e); } },
      async set(data) {
        const { data: row, error } = await sb.from("docs").upsert({ path, data: clone(data) }, { onConflict: "path" }).select("path,col,data,version").maybeSingle();
        if (error) throw mapErr(error);
        if (row) applyRow(row);
      },
      async update(patch) {
        const cur = await fetchDoc(path);
        if (!cur) throw { code: "invalid_argument", message: "no such document" };
        return this.set(Object.assign({}, cur.data, clone(patch)));
      },
      async delete() {
        const { data: gone, error } = await sb.from("docs").delete().eq("path", path).select("path");
        if (error) throw mapErr(error);
        if (!gone || !gone.length) {           // nothing deleted: either already gone, or the rules refused it
          const still = await fetchDoc(path).catch(() => null);
          if (still) throw { code: "invalid_argument", message: "delete refused" };
        }
        removePath(path);
      },
      async acquire(o) {
        const { data, error } = await sb.rpc("hrm_acquire", { p: path, holder: String((o && o.holder) || "anon"), ttl_ms: Math.round((o && o.ttlMs) || 30000) });
        if (error) throw mapErr(error);
        return data;
      },
      onSnapshot(next, error) {
        startRealtime();
        let en = docs.get(path);
        if (!en) { en = { path, row: null, subs: new Set(), loaded: false }; docs.set(path, en); }
        const sub = { next, error }; en.subs.add(sub);
        if (en.loaded) schedule(en); else loadDoc(path, en).catch((e) => error && error(mapErr(e)));
        return () => en.subs.delete(sub);
      },
      collection: (sub) => colRef(path + "/" + sub),
    };
  }
  function colRef(col) {
    if (segs(col).length % 2 === 0) throw new Error("A collection path needs an odd number of segments: " + col);
    return {
      path: col,
      doc: (id) => docRef(col + "/" + (id || randomId(20))),
      async get() {
        try { const rows = await fetchCol(col); const d = rows.map((r) => snapOf(r.path, r)); return { docs: d, size: d.length, metadata: { fromCache: false } }; }
        catch (e) { throw mapErr(e); }
      },
      onSnapshot(next, error) {
        startRealtime();
        let en = cols.get(col);
        if (!en) { en = { col, rows: new Map(), subs: new Set(), loaded: false }; cols.set(col, en); }
        const sub = { next, error }; en.subs.add(sub);
        if (en.loaded) schedule(en); else loadCol(col, en).catch((e) => error && error(mapErr(e)));
        return () => en.subs.delete(sub);
      },
    };
  }
  const db = { collection: colRef, doc: docRef };

  /* ------------------------------------------------------------------ user */
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const user = {
    async me() { return { id: who.id, email: who.email, name: who.name || "", canEdit: who.level >= 2, isOwner: who.level >= 3, avatarUrl: "", color: "" }; },
    async id() { return who.id; },
    async can(what) { return what === "data.write" ? who.level >= 0 : who.level >= 1; },
    async canEdit() { return who.level >= 2; },
    async isOwner() { return who.level >= 3; },
    async profiles(ids) {
      const list = (Array.isArray(ids) ? ids : [ids]).filter((x) => UUID.test(String(x)));
      const out = Object.fromEntries((Array.isArray(ids) ? ids : [ids]).map((i) => [i, { id: i, name: "", email: null }]));
      if (!list.length) return out;
      const { data } = await sb.rpc("hrm_profiles", { ids: list });
      for (const [k, v] of Object.entries(data || {})) out[k] = Object.assign({ id: k, name: "", email: null }, v);
      return out;
    },
  };

  /* ------------------------------------------------------------------ files */
  function randomId(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map((x) => (x % 36).toString(36)).join(""); }
  function hex32() { const a = new Uint8Array(16); crypto.getRandomValues(a); return [...a].map((x) => x.toString(16).padStart(2, "0")).join(""); }
  const assets = {
    async upload(blob, o) {
      const id = hex32(), type = (o && o.type) || blob.type || "image/jpeg";
      const { error } = await sb.storage.from("files").upload(id, blob, { contentType: type, upsert: false, cacheControl: "31536000" });
      if (error) throw mapErr(error);
      return { id, url: "", sizeBytes: blob.size, contentType: type };
    },
  };
  // signed URLs for stored images, fetched in batches and cached; the app re-renders when they arrive
  const urlCache = new Map(); const want = new Set(); let urlT = null;
  function assetUrl(id) {
    const c = urlCache.get(id);
    if (c && c.exp > Date.now()) return c.url;
    if (!want.has(id)) { want.add(id); if (!urlT) urlT = setTimeout(fetchUrls, 40); }
    return c ? c.url : "";
  }
  async function fetchUrls() {
    urlT = null; const ids = [...want]; want.clear(); if (!ids.length || !who) return;
    const ttl = 6 * 24 * 3600;
    const { data } = await sb.storage.from("files").createSignedUrls(ids, ttl);
    let any = false;
    for (const r of data || []) if (r.signedUrl) { urlCache.set(r.path, { url: r.signedUrl, exp: Date.now() + (ttl - 3600) * 1000 }); any = true; }
    if (any && typeof HRM.onAssets === "function") HRM.onAssets();
  }

  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data], { type: /\.json$/i.test(filename) ? "application/json" : /\.csv$/i.test(filename) ? "text/csv" : /\.xlsx$/i.test(filename) ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/octet-stream" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 30000);
    },
  };

  /* ------------------------------------------------------------------ mail & cloud backups (replace Claude connectors) */
  const mcp = {
    async callTool(server, tool, args) {
      if (server === "Gmail" && tool === "send_message") {
        const pick = ["to", "subject", "body", "heading", "name", "intro", "rows", "quote", "tone", "cta"];
        const payload = Object.fromEntries(pick.filter((k) => args[k] !== undefined && args[k] !== "").map((k) => [k, args[k]]));
        const { data, error } = await sb.functions.invoke("send-email", { body: payload });
        if (error) {
          let status = error.context && error.context.status;
          throw { code: status === 503 ? "server_not_connected" : status === 403 ? "not_in_manifest" : "tool_error", message: error.message };
        }
        return { payload: data };
      }
      if (server === "Google Drive" && tool === "create_file") {
        const name = String(args.title || "backup.json").replace(/[^A-Za-z0-9._-]/g, "_");
        const path = new Date().toISOString().slice(0, 7) + "/" + name;
        const { error } = await sb.storage.from("backups").upload(path, new Blob([args.textContent], { type: "application/json" }), { contentType: "application/json", upsert: false });
        if (error) throw { code: "tool_error", message: error.message };
        return { payload: { id: path, url: "" } };
      }
      throw { code: "not_in_manifest" };
    },
  };

  /* ------------------------------------------------------------------ public helpers for app.js */
  const HRM = window.HRM = {
    onAssets: null,
    assetUrl,
    backend: "supabase",
    async signOut() { await sb.auth.signOut(); location.reload(); },
    async invite(empId) {
      const { data, error } = await sb.functions.invoke("send-email", { body: { action: "invite", empId } });
      if (error) {
        let detail = {}; try { detail = await error.context.json(); } catch (e) { /* no body */ }
        const r = detail.error || error.message;
        throw { message: r === "email_not_configured" ? "email isn't set up yet (SMTP secrets in Supabase)" : r === "not_allowed" ? "only HRD or Admin can invite" : r === "no_email" ? "add a real work email first" : String(r || "server error").replace(/_/g, " ") };
      }
      return data;
    },
    async claim(empNo, name) { const { data, error } = await sb.rpc("hrm_claim", { emp_no: empNo, full_name: name }); if (error) throw mapErr(error); return data; },
    async downloadCloudBackup(path) {
      const { data, error } = await sb.storage.from("backups").download(path);
      if (error) throw mapErr(error);
      await downloads.save({ filename: path.split("/").pop(), data });
    },
    async snapshots() { const { data, error } = await sb.rpc("hrm_snapshots"); if (error) throw mapErr(error); return data || []; },
    async snapshot(id) { const { data, error } = await sb.rpc("hrm_snapshot", { sid: id }); if (error) throw mapErr(error); return data; },
    async snapshotNow() { const { data, error } = await sb.rpc("hrm_snapshot_now"); if (error) throw mapErr(error); return data; },
    async changelog(n) { const { data, error } = await sb.rpc("hrm_changelog", { lim: n || 200 }); if (error) throw mapErr(error); return data || []; },
    async payslip(action, items) {
      const { data, error } = await sb.functions.invoke("payslip", { body: { action, items } });
      if (error) {
        let detail = {}; try { detail = await error.context.json(); } catch (e) { /* no body */ }
        const r = detail.error || error.message;
        throw { message: r === "not_allowed" ? "only Finance (Payroll access), HRD or Admin can do this" : String(r || "server error").replace(/_/g, " ") };
      }
      return data;
    },
    async downloadPayslip(path, filename) {
      const { data, error } = await sb.storage.from("payslips").download(path);
      if (error) throw mapErr(error);
      await downloads.save({ filename, data });
    },
    async uploadPayAsset(kind, file) {
      if (!/^(letterhead|stamp|signature)$/.test(kind)) throw { message: "bad asset" };
      const type = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
      const path = `_assets/${kind}-${Date.now()}.${type === "image/jpeg" ? "jpg" : "png"}`;
      const { error } = await sb.storage.from("payslips").upload(path, file, { contentType: type, upsert: false });
      if (error) throw mapErr(error);
      return path;
    },
    async payAssetUrl(path) {
      const { data, error } = await sb.storage.from("payslips").createSignedUrl(path, 600);
      if (error) throw mapErr(error);
      return data.signedUrl;
    },
    who: () => who,
  };

  /* ------------------------------------------------------------------ the capability entry point app.js uses */
  window.claude = {
    async use(name) {
      await ready;
      if (name === "db") return db;
      if (name === "user") return user;
      if (name === "downloads") return downloads;
      if (name === "assets") return who.level >= 1 ? assets : null;
      if (name === "mcp") return mcp;
      return null;
    },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
