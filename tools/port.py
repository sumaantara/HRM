#!/usr/bin/env python3
"""One-time port of the Claude-artifact HRM (single HTML file) to the Supabase web app layout:
   index.html (markup + styles), js/app.js (app logic), js/backend.js (Supabase adapter, hand-written), js/config.js.
   Usage: python3 tools/port.py <artifact.html> <repo dir>
   Every replacement must match exactly once, so the script fails loudly if the source changed."""
import re, sys, pathlib

src = pathlib.Path(sys.argv[1]).read_text()
out = pathlib.Path(sys.argv[2])

head_end = src.index("<script>")
script_end = src.rindex("</script>")
markup = src[:head_end]
js = src[head_end + len("<script>"):script_end]

def rep(text, a, b, count=1):
    n = text.count(a)
    if n != count:
        raise SystemExit(f"expected {count} match(es), found {n}: {a[:90]!r}")
    return text.replace(a, b)

# ---------------------------------------------------------------- app logic
J = js
J = rep(J, 'const APP_VERSION = "3.0.0"', 'const APP_VERSION = "3.1.0"')
J = rep(J, 'const assetSrc = ref => !ref ? "" : /^[0-9a-f]{32}$/i.test(ref) ? "/_blob/" + ref : ref;',
        'const assetSrc = ref => !ref ? "" : /^[0-9a-f]{32}$/i.test(ref) ? ((window.HRM && window.HRM.assetUrl(ref)) || "") : ref;')
J = rep(J, '"This change needs HRD or Admin access (Editor in the page\'s Share menu)."', '"This change needs HRD or Admin access."')
# email
J = rep(J, '"Email isn\'t available in this view. Connect Gmail in claude.ai to send emails."', '"Email isn\'t available right now."')
J = rep(J, '''    return {ok:false, reason: c === "server_not_connected" ? "Gmail isn't connected. Add it in claude.ai Settings → Connectors." :
      c === "needs_reauth" ? "Reconnect Gmail in claude.ai Settings → Connectors." :
      c === "not_in_manifest" || c === "approval_required" ? "Email sending wasn't allowed for this page." : "Gmail couldn't send the email."}; }''',
'''    return {ok:false, reason: c === "server_not_connected" ? "Email isn't set up yet (Admin: add the SMTP settings in Supabase — see README)." :
      c === "not_in_manifest" ? "Your account isn't allowed to send this email." : "The email couldn't be sent."}; }''')
J = rep(J, 'Emails are sent from the Gmail account of the person doing the action (usually HRD), through their Gmail connection in claude.ai.',
        "Emails are sent by the HRM's mail server (SMTP settings of the Supabase project), only to addresses of employees in the directory.")
# account / sign-in wording
J = rep(J, '"Signed in with Claude" + (S.who?.name ? " as " + esc(S.who.name) : "")', '"Signed in" + (S.who?.email ? " as " + esc(S.who.email) : "")')
J = rep(J, '''<span class="tag">${e.admin ? "Admin" : esc(jobOf(e)) + (e.role==="hrd"?" · HRD":"")}</span></button>`).join("")}` : ""}</div></div>`;''',
        '''<span class="tag">${e.admin ? "Admin" : esc(jobOf(e)) + (e.role==="hrd"?" · HRD":"")}</span></button>`).join("")}` : ""}
      ${!demo && window.HRM ? `<button class="res" type="button" data-act="sign-out" style="border-top:1px solid var(--line)">${ic("x")}<span>Sign out</span></button>` : ""}</div></div>`;''')
J = rep(J, '''You're signed in to Claude${w.name ? " as <b>" + esc(w.name) + "</b>" : ""}${w.email ? " (" + esc(w.email) + ")" : ""}. Link this sign-in to your employee profile once — after that the app always knows who you are, so nobody can act on your behalf.''',
        '''You're signed in${w.email ? " as <b>" + esc(w.email) + "</b>" : ""}, but this email isn't on an employee profile yet. Ask HRD to put this email on your profile (it then connects automatically within a minute), or send a request below with your Employee ID.''')
J = rep(J, '''You have view-only access to this page. Ask the owner to share it with you as <b>Contributor</b> (staff) or <b>Editor</b> (HRD, Admin, General Manager).''',
        '''Your account can't send requests. Contact HRD.''')
J = rep(J, '''Request sent to link your account to <b>${esc(target?.name || "")}</b>''', '''Request sent to link your account to <b>${esc(target?.name || mine.empName || "")}</b>''')
J = rep(J, '''Your request to link to <b>${esc(target?.name || mine.empNo || "")}</b> was declined''', '''Your request to link to <b>${esc(target?.name || mine.empName || mine.empNo || "")}</b> was declined''')
J = rep(J, '''"Your access level can't send requests. Ask the owner for Contributor access."''', '''"Your account can't send requests. Contact HRD."''')
J = rep(J, '''  if(s === "link"){ const no = (dv("link","empNo","")||"").trim().toUpperCase(), nmv = normName(dv("link","name",""));''',
'''  if(s === "link" && window.HRM){ const no = (dv("link","empNo","")||"").trim(), nmv = (dv("link","name","")||"").trim();
    if(!no || !nmv){ S.ui.linkErr = "Enter your Employee ID and full name."; render(); return; }
    try { const r = await window.HRM.claim(no, nmv);
      S.ui.linkErr = r === "pending" ? "" : r === "taken" ? "That profile is already connected to another account. Contact HRD." : "No employee matches that Employee ID and name. Check with HRD.";
      if(r === "pending") toast("Request sent. HRD or Admin will confirm it."); render(); } catch(e){ S.ui.linkErr = "Couldn't send the request. Try again."; render(); }
    return; }
  if(s === "link"){ const no = (dv("link","empNo","")||"").trim().toUpperCase(), nmv = normName(dv("link","name",""));''')
J = rep(J, '''if(dbOn() && isMgmt() && !S.canEdit) out.push(["warn", "alert", "Your role needs <b>Editor</b> access in this page's Share menu to see confidential HR data and save HR changes. Ask the owner."]);''',
        '''if(dbOn() && isMgmt() && !S.canEdit) out.push(["warn", "alert", "Your HR access is being applied — reload the page in a minute if confidential data stays hidden."]);''')
# backups: cloud storage instead of Google Drive
J = rep(J, '<button class="btn link" type="button" data-act="backup" data-v="drive">Back up to Google Drive</button>', '<button class="btn link" type="button" data-act="backup" data-v="drive">Back up to cloud storage</button>')
J = rep(J, '${ic("upload")}Back up to Drive</button>', '${ic("upload")}Back up to cloud</button>')
J = rep(J, 'toast("Backup saved to Google Drive.");', 'toast("Backup saved to cloud storage.");')
J = rep(J, '"Google Drive isn\'t available in this view. Use “Download” instead."', '"Cloud storage isn\'t available right now. Use “Download” instead."')
J = rep(J, '''    return {ok:false, reason: c === "server_not_connected" ? "Google Drive isn't connected. Add it in claude.ai Settings → Connectors, or use “Download”." :
      c === "needs_reauth" ? "Reconnect Google Drive in claude.ai Settings → Connectors." :
      c === "not_in_manifest" || c === "approval_required" ? "Saving to Google Drive wasn't allowed for this page." : "Google Drive couldn't save the file. Use “Download” instead."}; }''',
'''    return {ok:false, reason: "Cloud storage couldn't save the file. Use “Download” instead."}; }''')
J = rep(J, '["Backups (download / Google Drive)", N,N,N,Y,Y]', '["Backups (download / cloud storage)", N,N,N,Y,Y]')
J = rep(J, '''<b>3-2-1 rule.</b> Keep backups in at least two places: Google Drive (one click, from your own connected Drive) and a downloaded copy on a company laptop or shared drive.''',
        '''<b>3-2-1 rule.</b> Three layers protect the data: the server takes an automatic snapshot every night (below), “Back up to cloud” keeps a copy in the project's private storage, and a downloaded copy belongs on a company laptop or shared drive — outside Supabase.''')
J = rep(J, '''      <label class="f"><span>Google Drive folder ID <span class="muted" style="font-weight:400">(optional)</span></span><input type="text" data-cfg="system.driveFolder" value="${esc(sys.driveFolder)}" placeholder="From the folder's URL" ${realAdmin()?"":"disabled"}><small>Leave empty to save in My Drive.</small></label></div></div>''',
        '''</div></div>''')
J = rep(J, '''${b.dest === "drive" ? (b.link ? `<a href="${esc(b.link)}" target="_blank" rel="noopener">Google Drive</a>` : "Google Drive") : "Downloaded"}''',
        '''${b.dest === "drive" ? (b.fileId ? `<button class="btn link" type="button" data-act="cloud-dl" data-v="${esc(b.fileId)}">Cloud storage</button>` : "Cloud storage") : "Downloaded"}''')
J = rep(J, '''  <div class="card-h" style="border-top:1px solid var(--line)"><h2>Restore</h2>${realAdmin() ? "" : `<span class="tag">Admin only</span>`}</div>''',
        '''  ${sysSnapshots()}
  <div class="card-h" style="border-top:1px solid var(--line)"><h2>Restore</h2>${realAdmin() ? "" : `<span class="tag">Admin only</span>`}</div>''')
J = rep(J, 'function sysAudit(){', r'''function sysSnapshots(){
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
function sysAudit(){''')
J = rep(J, '    case "backup": await backupNow(v); return;', '''    case "backup": await backupNow(v); return;
    case "sign-out": if(window.HRM) await window.HRM.signOut(); return;
    case "cloud-dl": try { await window.HRM.downloadCloudBackup(v); } catch(e){ toast("That backup couldn't be downloaded."); } return;
    case "snap-now": try { await window.HRM.snapshotNow(); toast("Snapshot taken."); audit("snapshot_manual", "", ""); } catch(e){ toast(/too many/.test(e?.message || "") ? "Too many snapshots this hour — try later." : "The snapshot couldn't be taken."); } S.ui.snaps = null; render(); return;
    case "snap-dl": try { const b = await snapToBackup(v); await download(backupName(b).replace(".json", "-snapshot.json"), JSON.stringify(b)); } catch(e){ toast("That snapshot couldn't be downloaded."); } return;
    case "snap-load": if(!realAdmin()) return; try { const b = await snapToBackup(v); await readRestoreFile({name:"Server snapshot #" + v, text: async () => JSON.stringify(b)}); document.getElementById("restore-confirm")?.scrollIntoView({block:"center"}); } catch(e){ toast("That snapshot couldn't be loaded."); } return;''')
# health / runbook wording
J = rep(J, 'tile("Records stored", "≈ " + H.est.toLocaleString(), "of 25,000 per app" + meter(H.est, 25000), H.est > 20000)',
        'tile("Records stored", "≈ " + H.est.toLocaleString(), "free plan fits ~200,000" + meter(H.est, 200000), H.est > 150000)')
J = rep(J, '''<b>How access is enforced.</b> Each person signs in with their own Claude account, linked once to their employee profile. The page's Share menu sets what the database allows: give <b>HRD, Admin and the General Manager “Editor”</b> and <b>everyone else “Contributor”</b>. Contributors can submit requests, approve their team and write reviews, but cannot read or change confidential HR data, quotas, contracts or settings — the database refuses it even outside this screen.''',
        '''<b>How access is enforced.</b> Each person signs in with their own email account, connected once to their employee profile (automatically when the verified email matches the profile, otherwise approved by HRD/Admin). The database derives the access level from the profile: <b>HRD, General Manager and Admin</b> can read and change confidential HR data; <b>everyone else</b> can submit requests, approve their team and write reviews, but the database refuses confidential data, quotas, contracts and settings — even outside this screen. Signed-in people without a profile see nothing.''')
J = rep(J, '<th>Share level needed</th>', '<th>Access level</th>')
J = rep(J, 'need = e.admin || e.role === "hrd" || e.role === "gm" ? "Editor" : "Contributor";', 'need = e.admin || e.role === "hrd" || e.role === "gm" ? "HR editor" : "Employee";')
J = rep(J, '<td data-l="Share level">${need}</td>', '<td data-l="Access">${need}</td>')
J = rep(J, '''"Share the page: HRD, Admin and General Manager as <b>Editor</b>; everyone else as <b>Contributor</b>. Nobody as Viewer.", "Ask each person to open the link once and send a connect request; approve it from Employees or System → Accounts after checking the Claude name belongs to that person.", "Make the first backup to Google Drive and download a second copy."''',
        '''"Make sure every employee profile has the person's work email — accounts connect automatically when the verified email matches.", "Send everyone the HRM link; they create an account with that email and confirm it. Approve the few manual requests from Employees or System → Accounts.", "Make the first backup to cloud storage and download a second copy."''')
J = rep(J, '"Check Accounts: link new joiners, unlink people who left (also remove them from the Share menu)."', '"Check Accounts: new joiners are connected, people who left are unlinked."')
J = rep(J, '"Open System → Health: integrity issues should be zero; record count should stay below 20,000."', '"Open System → Health: integrity issues should be zero."')
J = rep(J, '"System → Accounts → Unlink, and remove them from the page\'s Share menu."', '"System → Accounts → Unlink (a resigned profile loses access automatically)."')
J = rep(J, '"App won\'t load for everyone: reload; if it persists, the Admin can republish the previous app version — data is stored separately and is not affected."',
        '"App won\'t load for everyone: check status.supabase.com, then revert the last change in GitHub (the site redeploys in ~1 minute) — data is stored separately and is not affected.", "Data lost or corrupted: Backup & Restore → Server snapshots → Load into Restore (nightly copies), or restore a downloaded backup."')
J = rep(J, '''<b>Growing beyond this setup.</b> This HRM runs inside a Claude artifact with its own database (up to 25,000 records, 256 KB per record). That comfortably fits a company of ~150 people for several years with yearly archiving. For larger teams, payroll, or strict legal separation of personal data, move to a dedicated backend (e.g. PostgreSQL with row-level security); the JSON backup is the migration format.''',
        '''<b>Where it runs.</b> The site is hosted on GitHub Pages; data, sign-in and files live in Supabase (PostgreSQL with row-level security, region Tokyo). On the free plan a project pauses after a week without visits and has no provider backups — for production use the Pro plan adds daily provider backups and no pausing. The JSON backup stays the portable format.''')
J = rep(J, '(Claude account${p.guest ? ", outside your organization" : ""})', '(${esc(p.email || "email not verified")})')
J = rep(J, 'Approve only when the Claude name belongs to that employee.', 'Approve only when the email belongs to that employee.')
J = rep(J, '${fmt((a.publishAt||a.createdAt).slice(0,10))}', '${fmt((a.publishAt||a.createdAt||"").slice(0,10))}', 2)
# the backend reports image URLs asynchronously
J = rep(J, '  render();\n  let db = null; try { db = window.claude?.use', '  render();\n  if(window.HRM) window.HRM.onAssets = () => render();\n  let db = null; try { db = window.claude?.use')

# ---------------------------------------------------------------- markup / styles
M = markup
M = rep(M, '<title>ONEderland HRM</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n', '')
style_start = M.index("<style>"); style_end = M.index("</style>") + len("</style>")
styles = M[style_start:style_end]
shell = M[style_end:].strip()
fonts = M[:style_start].strip()

auth_css = """
/* sign-in screen (js/backend.js) */
.auth{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:24px 16px;background:var(--bg);overflow:auto}
.auth[hidden]{display:none}
body.auth-on .app{visibility:hidden}
.auth-card{width:100%;max-width:420px;background:var(--surface);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow);padding:32px 28px;display:flex;flex-direction:column;gap:18px}
.auth-brand{display:flex;align-items:center;gap:12px}.auth-brand b{display:block;font-family:var(--f-head);font-size:1.05rem}.auth-brand small{color:var(--muted)}
.auth-card h1{font-size:1.4rem}
.auth-form{display:flex;flex-direction:column;gap:14px}.auth-form .btn.pri{justify-content:center;min-height:44px}
.auth-links{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}
.auth-alt,.auth-hint,.auth-foot{color:var(--muted);font-size:.86rem}.auth-foot{border-top:1px solid var(--line);padding-top:14px}
"""
styles = styles.replace("input[type=text],input[type=email],", "input[type=text],input[type=email],input[type=password],", 1)
styles = styles.replace("</style>", auth_css + "</style>")

index = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; object-src 'none'; base-uri 'self'; form-action 'self'">
<title>ONEderland HRM</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%233554f5'/%3E%3Ctext x='32' y='42' font-family='Arial' font-weight='700' font-size='26' fill='white' text-anchor='middle'%3EON%3C/text%3E%3C/svg%3E">
{fonts}
{styles}
</head>
<body>
<div class="auth" id="auth" hidden></div>
{shell}
<script src="js/config.js"></script>
<script src="vendor/supabase.js"></script>
<script src="js/backend.js"></script>
<script src="js/app.js"></script>
</body>
</html>
"""
(out / "index.html").write_text(index)
(out / "js").mkdir(exist_ok=True)
(out / "js" / "app.js").write_text("/* ONEderland HRM — app logic (ported from the Claude artifact). Data access goes through js/backend.js. */\n" + J.strip() + "\n")
print("ok", len(index), len(J))
