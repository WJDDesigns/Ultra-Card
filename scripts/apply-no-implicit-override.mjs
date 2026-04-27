/**
 * One-shot helper: reads `tsc --noImplicitOverride` diagnostics (TS4114) and inserts `override`
 * at the reported lines. Re-run until exit 0, then enable `noImplicitOverride` in tsconfig.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function fixLine(line) {
  if (/\boverride\b/.test(line)) return line;
  const trimmed = line.trimStart();
  const ws = line.slice(0, line.length - trimmed.length);

  if (/^handlesOwnDesignStyles\s*=/.test(trimmed)) {
    return ws + `override ${trimmed}`;
  }

  if (/^static\s+get\s+\w+/.test(trimmed)) {
    return ws + trimmed.replace(/^static\s+get\s+/, 'static override get ');
  }
  if (/^static\s+styles\b/.test(trimmed)) {
    return ws + trimmed.replace(/^static\s+/, 'static override ');
  }
  if (/^static\s+properties\b/.test(trimmed)) {
    return ws + trimmed.replace(/^static\s+/, 'static override ');
  }
  if (/^static\s+shadowRootOptions\b/.test(trimmed)) {
    return ws + trimmed.replace(/^static\s+/, 'static override ');
  }
  if (/^static\s+elementStyles\b/.test(trimmed)) {
    return ws + trimmed.replace(/^static\s+/, 'static override ');
  }

  const m1 = trimmed.match(/^(public|protected|private)\s+(async\s+)?(\w+)/);
  if (m1) {
    const [, acc, asyncPart, name] = m1;
    if (name === 'override') return line;
    const rest = trimmed.slice(m1[0].length);
    return ws + `${acc} override ${asyncPart || ''}${name}${rest}`;
  }

  const m2 = trimmed.match(/^async\s+(\w+)/);
  if (m2) {
    return ws + `async override ${m2[1]}` + trimmed.slice(m2[0].length);
  }

  const m3 = trimmed.match(/^(\w+)\s*[\(:]/);
  if (m3) {
    const kw = new Set([
      'if',
      'for',
      'while',
      'switch',
      'catch',
      'try',
      'return',
      'throw',
      'function',
      'class',
      'const',
      'let',
      'var',
      'new',
      'case',
      'default',
    ]);
    const id = m3[1];
    if (!kw.has(id)) {
      return ws + `override ${trimmed}`;
    }
  }

  return null;
}

function main() {
  const r = spawnSync('npx', ['tsc', '--noEmit', '--noImplicitOverride'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  const out = (r.stdout || '') + (r.stderr || '');

  const re = /^(src\/[^\s(]+)\((\d+),\d+\): error TS4114:/gm;
  const matches = [...out.matchAll(re)];
  if (matches.length === 0) {
    console.log('No TS4114 errors found.');
    process.exit(0);
  }

  /** @type {Map<string, Set<number>>} */
  const byFile = new Map();
  for (const m of matches) {
    const file = m[1];
    const line = parseInt(m[2], 10);
    if (!byFile.has(file)) byFile.set(file, new Set());
    byFile.get(file).add(line);
  }

  let changed = 0;
  let failed = 0;

  for (const [rel, lines] of byFile) {
    const abs = path.join(root, rel);
    const content = fs.readFileSync(abs, 'utf8');
    const arr = content.split(/\r?\n/);
    const sorted = [...lines].sort((a, b) => b - a);
    for (const lineNo of sorted) {
      const idx = lineNo - 1;
      const original = arr[idx];
      const next = fixLine(original);
      if (next == null || next === original) {
        console.error(`Could not fix ${rel}:${lineNo}: ${JSON.stringify(original)}`);
        failed++;
        continue;
      }
      arr[idx] = next;
      changed++;
    }
    fs.writeFileSync(abs, arr.join('\n'));
  }

  console.log(`Patched ${changed} lines across ${byFile.size} files. Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
