#!/usr/bin/env node
/**
 * Builds index.html for a UI harness run from its results.json.
 * run.mjs calls this at the end; it also runs on its own:
 *
 *   node scripts/ui-harness/report.mjs .harness-output/ui-harness/<run>
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const esc = s =>
  String(s ?? '').replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

const SEV_ORDER = { error: 0, warn: 1, info: 2 };

/** Flatten one module's findings, each tagged with where it was seen. */
export function collectFindings(m) {
  const out = [];
  for (const [kind, byTheme] of Object.entries(m.card || {})) {
    for (const [theme, res] of Object.entries(byTheme)) {
      for (const f of res.findings || []) out.push({ ...f, scope: `card · ${kind} · ${theme}` });
    }
  }
  for (const [theme, ed] of Object.entries(m.editor || {})) {
    if (ed.error)
      out.push({
        check: 'editor-error',
        severity: 'error',
        message: ed.error,
        where: '',
        scope: `editor · ${theme}`,
      });
    for (const tab of ed.tabs || []) {
      for (const f of tab.findings || [])
        out.push({ ...f, scope: `editor · ${tab.name} · ${theme}` });
    }
  }
  for (const i of m.interactions || []) {
    if (i.dead)
      out.push({
        check: 'dead-click',
        severity: 'warn',
        message: `Looks clickable but nothing happened: “${i.label || i.where}”`,
        where: i.where,
        scope: 'card · click',
      });
  }
  for (const e of m.errors || []) {
    out.push({
      check: 'console-error',
      severity: 'error',
      message: e.text,
      where: '',
      scope: e.module.replace(/^\S+\s/, ''),
    });
  }
  for (const n of m.notes || [])
    out.push({ check: 'note', severity: 'info', message: n, where: '', scope: 'editor' });

  // The same problem usually shows in several themes/sizes: fold duplicates.
  const folded = new Map();
  for (const f of out) {
    const key = `${f.check}|${f.message}|${f.where}`;
    if (folded.has(key)) folded.get(key).scopes.push(f.scope);
    else folded.set(key, { ...f, scopes: [f.scope] });
  }
  return [...folded.values()].sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
}

export async function writeReport(dir) {
  const { run, modules } = JSON.parse(await fs.readFile(path.join(dir, 'results.json'), 'utf8'));
  const rows = modules.map(m => ({ m, findings: collectFindings(m) }));
  const count = sev =>
    rows.reduce((n, r) => n + r.findings.filter(f => f.severity === sev).length, 0);
  const totals = { error: count('error'), warn: count('warn'), info: count('info') };
  const clean = rows.filter(r => !r.findings.some(f => f.severity !== 'info')).length;

  const shot = (src, label) =>
    src
      ? `<a class="shot" href="${esc(src)}" target="_blank"><img loading="lazy" src="${esc(src)}" alt="${esc(label)}"><span>${esc(label)}</span></a>`
      : `<div class="shot missing"><span>${esc(label)}: not captured</span></div>`;

  const moduleHtml = rows
    .map(({ m, findings }) => {
      const worst = findings[0]?.severity || 'clean';
      const cards = [];
      for (const kind of ['desktop', 'mobile']) {
        for (const theme of run.themes) {
          const res = m.card?.[kind]?.[theme];
          if (res) cards.push(shot(res.shot, `${kind} · ${theme}`));
        }
      }
      const editors = [];
      for (const theme of run.themes) {
        for (const tab of m.editor?.[theme]?.tabs || [])
          editors.push(shot(tab.shot, `${tab.name} · ${theme}`));
      }
      const fRows = findings
        .map(
          f => `<tr class="sev-${f.severity}" data-sev="${f.severity}" data-check="${esc(f.check)}">
            <td><span class="pill ${f.severity}">${f.severity}</span></td>
            <td>${esc(f.check)}</td>
            <td>${esc(f.message)}${f.where ? `<div class="where">${esc(f.where)}</div>` : ''}</td>
            <td class="scope">${esc([...new Set(f.scopes)].join(', '))}</td></tr>`
        )
        .join('');
      const clicks = (m.interactions || [])
        .map(
          i =>
            `<tr class="${i.dead ? 'dead' : ''}"><td>${esc(i.label || '—')}</td><td>${esc(i.result)}</td><td class="where">${esc(i.where)}</td></tr>`
        )
        .join('');
      const counts = ['error', 'warn', 'info']
        .map(s => {
          const n = findings.filter(f => f.severity === s).length;
          return n ? `<span class="pill ${s}">${n} ${s}</span>` : '';
        })
        .join('');
      return `<section class="module" id="m-${esc(m.type)}" data-worst="${worst}" data-name="${esc((m.title + ' ' + m.type).toLowerCase())}">
        <header><h2>${esc(m.title)} <code>${esc(m.type)}</code>${m.pro ? ' <span class="pro">PRO</span>' : ''}</h2>
          <div class="counts">${counts || '<span class="pill ok">clean</span>'}</div></header>
        <div class="shots">${cards.join('')}</div>
        ${editors.length ? `<h3>Editor</h3><div class="shots editor">${editors.join('')}</div>` : ''}
        ${fRows ? `<h3>Findings</h3><table class="findings"><tbody>${fRows}</tbody></table>` : ''}
        ${clicks ? `<details><summary>Clicks (${(m.interactions || []).length})</summary><table class="clicks"><tbody>${clicks}</tbody></table></details>` : ''}
        <details><summary>Config used</summary><pre>${esc(JSON.stringify(m.config, null, 2))}</pre></details>
      </section>`;
    })
    .join('\n');

  const nav = rows
    .map(({ m, findings }) => {
      const worst = findings.find(f => f.severity !== 'info')?.severity || 'ok';
      return `<a href="#m-${esc(m.type)}" class="nav-${worst}" data-worst="${findings[0]?.severity || 'clean'}" data-name="${esc((m.title + ' ' + m.type).toLowerCase())}">${esc(m.title)}</a>`;
    })
    .join('');

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ultra Card UI harness</title>
<style>
:root{--bg:#f6f7f9;--panel:#fff;--text:#1d2128;--muted:#5d6673;--line:#e1e4e8;--err:#c62828;--warn:#b26a00;--info:#3b6ea8;--ok:#2e7d32}
@media (prefers-color-scheme:dark){:root{--bg:#111418;--panel:#1a1e24;--text:#e6e8eb;--muted:#9aa3ad;--line:#2b313a;--err:#ff6b6b;--warn:#ffb74d;--info:#82b1ff;--ok:#66bb6a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.top{position:sticky;top:0;z-index:5;background:var(--panel);border-bottom:1px solid var(--line);padding:12px 16px;display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.top h1{font-size:16px;margin:0 12px 0 0}.top .meta{color:var(--muted);font-size:12px}
.top input{padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--text);min-width:180px}
.top label{font-size:13px;color:var(--muted);display:flex;gap:4px;align-items:center}
.wrap{display:grid;grid-template-columns:220px 1fr;gap:16px;padding:16px}
nav{position:sticky;top:64px;align-self:start;max-height:calc(100vh - 80px);overflow:auto;display:flex;flex-direction:column;font-size:13px}
nav a{color:var(--text);text-decoration:none;padding:3px 8px;border-left:3px solid transparent}
nav a.nav-error{border-color:var(--err)}nav a.nav-warn{border-color:var(--warn)}nav a.nav-ok{border-color:var(--ok)}
.module{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:16px}
.module header{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center}
.module h2{font-size:17px;margin:0}.module h2 code{font-size:12px;color:var(--muted);font-weight:400}
.module h3{font-size:13px;margin:16px 0 8px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.pro{font-size:10px;background:#7b1fa2;color:#fff;border-radius:4px;padding:1px 5px;vertical-align:middle}
.shots{display:flex;gap:10px;overflow-x:auto;padding:8px 0}
.shot{flex:0 0 auto;display:flex;flex-direction:column;gap:4px;text-decoration:none;color:var(--muted);font-size:11px}
.shot img{max-height:280px;max-width:300px;border:1px solid var(--line);border-radius:8px;background:repeating-conic-gradient(#8881 0 25%,transparent 0 50%) 0 0/16px 16px}
.shots.editor .shot img{max-height:360px}
.shot.missing{width:160px;height:90px;border:1px dashed var(--line);border-radius:8px;align-items:center;justify-content:center}
table{width:100%;border-collapse:collapse;font-size:13px}td{border-top:1px solid var(--line);padding:6px 8px;vertical-align:top}
.where{color:var(--muted);font-size:11px;font-family:ui-monospace,Menlo,monospace;word-break:break-all}
.scope{color:var(--muted);font-size:12px;width:28%}
.pill{display:inline-block;font-size:11px;border-radius:99px;padding:1px 8px;border:1px solid currentColor;margin-left:4px}
.pill.error{color:var(--err)}.pill.warn{color:var(--warn)}.pill.info{color:var(--info)}.pill.ok{color:var(--ok)}
tr.dead td{color:var(--warn)}details{margin-top:10px}summary{cursor:pointer;color:var(--muted);font-size:13px}
pre{background:var(--bg);padding:10px;border-radius:8px;overflow:auto;font-size:12px;max-height:320px}
.hide-info tr[data-sev=info]{display:none}
@media (max-width:760px){.wrap{grid-template-columns:1fr}nav{display:none}}
</style></head><body>
<div class="top"><h1>Ultra Card UI harness</h1>
<span class="meta">v${esc(run.ultraCardVersion)} · HA ${esc(run.haVersion)} · ${esc(run.startedAt.slice(0, 16).replace('T', ' '))} UTC · ${esc(run.minutes)} min ·
${rows.length} modules · ${clean} clean · ${totals.error} errors · ${totals.warn} warnings · ${totals.info} notes</span>
<input id="q" placeholder="Filter modules…">
<label><input type="checkbox" id="onlyBad"> only modules with problems</label>
<label><input type="checkbox" id="showInfo"> show notes</label></div>
<div class="wrap"><nav>${nav}</nav><main class="hide-info">${moduleHtml}</main></div>
<script>
const q=document.getElementById('q'),bad=document.getElementById('onlyBad'),info=document.getElementById('showInfo');
function apply(){const t=q.value.trim().toLowerCase();
document.querySelectorAll('section.module, nav a').forEach(el=>{const w=el.dataset.worst;
const hit=(!t||el.dataset.name.includes(t))&&(!bad.checked||w==='error'||w==='warn');el.style.display=hit?'':'none'});
document.querySelector('main').classList.toggle('hide-info',!info.checked)}
[q,bad,info].forEach(el=>el.addEventListener('input',apply));
</script></body></html>`;

  await fs.writeFile(path.join(dir, 'index.html'), html);
  return `${rows.length} modules · ${clean} clean · ${totals.error} errors · ${totals.warn} warnings`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('usage: node scripts/ui-harness/report.mjs <run dir>');
    process.exit(1);
  }
  writeReport(path.resolve(dir)).then(s => console.log(s));
}
