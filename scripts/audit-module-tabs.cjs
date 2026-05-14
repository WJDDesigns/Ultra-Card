/**
 * Static audit: each module's render*Tab overrides should invoke the updateModule
 * callback (direct call or pass-through to super / helper).
 *
 * Run: node scripts/audit-module-tabs.cjs
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const MODULES_DIR = path.join(ROOT, 'src', 'modules');

const TAB_METHODS = [
  'renderGeneralTab',
  'renderActionsTab',
  'renderOtherTab',
  'renderDesignTab',
  'renderYamlTab',
];

const SKIP_FILES = new Set([
  '_module-template.ts',
  'module-registry-load-error.test.ts',
]);

function listModuleFiles() {
  return fs
    .readdirSync(MODULES_DIR)
    .filter(
      f =>
        f.endsWith('-module.ts') &&
        !f.endsWith('.backup') &&
        !f.endsWith('.bak') &&
        !SKIP_FILES.has(f)
    )
    .map(f => path.join(MODULES_DIR, f));
}

function bodyIsOnlyReturnNull(body) {
  if (!body?.statements || body.statements.length !== 1) return false;
  const s = body.statements[0];
  if (!ts.isReturnStatement(s) || !s.expression) return false;
  return s.expression.kind === ts.SyntaxKind.NullKeyword;
}

/** Detect `paramName(...)` or `...(..., paramName, ...)` in body (name-based, no typechecker). */
function paramNameUsedInCalls(body, paramName) {
  let found = false;
  function visit(n) {
    if (found) return;
    if (ts.isIdentifier(n) && n.text === paramName) {
      const p = n.parent;
      if (ts.isCallExpression(p)) {
        if (p.expression === n) {
          found = true;
          return;
        }
        if (p.arguments && p.arguments.some(a => a === n)) {
          found = true;
          return;
        }
      }
    }
    ts.forEachChild(n, visit);
  }
  visit(body);
  return found;
}

function auditFile(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const rel = path.relative(ROOT, filePath);
  const results = [];

  function visitNode(n) {
    if (ts.isClassDeclaration(n) && n.name) {
      for (const member of n.members) {
        if (!ts.isMethodDeclaration(member) || !member.body) continue;
        const name = member.name && ts.isIdentifier(member.name) ? member.name.text : null;
        if (!name || !TAB_METHODS.includes(name)) continue;

        const params = member.parameters;
        if (params.length < 4) {
          results.push({
            method: name,
            line: sf.getLineAndCharacterOfPosition(member.getStart(sf)).line + 1,
            status: 'warn',
            detail: `expected at least 4 parameters, got ${params.length}`,
          });
          continue;
        }
        const pName = params[3].name;
        const paramName = ts.isIdentifier(pName) ? pName.text : null;
        if (!paramName) {
          results.push({
            method: name,
            line: sf.getLineAndCharacterOfPosition(member.getStart(sf)).line + 1,
            status: 'error',
            detail: '4th parameter is not a simple identifier (destructuring?)',
          });
          continue;
        }
        if (bodyIsOnlyReturnNull(member.body)) {
          results.push({
            method: name,
            line: sf.getLineAndCharacterOfPosition(member.getStart(sf)).line + 1,
            status: 'na',
            param: paramName,
            detail: 'returns null only (tab hidden / not applicable)',
          });
          continue;
        }

        const ok = paramNameUsedInCalls(member.body, paramName);
        if (!ok && name === 'renderGeneralTab') {
          results.push({
            method: name,
            line: sf.getLineAndCharacterOfPosition(member.getStart(sf)).line + 1,
            status: 'informational',
            param: paramName,
            detail: 'no updateModule call in body (static / info-only general tab)',
          });
          continue;
        }

        results.push({
          method: name,
          line: sf.getLineAndCharacterOfPosition(member.getStart(sf)).line + 1,
          status: ok ? 'pass' : 'fail',
          param: paramName,
          detail: ok ? '' : `no call / pass-through detected for "${paramName}"`,
        });
      }
    }
    ts.forEachChild(n, visitNode);
  }

  visitNode(sf);
  return { file: rel, results };
}

function main() {
  const rows = [];
  let failCount = 0;
  for (const file of listModuleFiles()) {
    const { file: rel, results } = auditFile(file);
    if (results.length === 0) continue;
    for (const r of results) {
      if (r.status === 'fail') failCount++;
      rows.push({ ...r, file: rel });
    }
  }

  console.log(JSON.stringify({ summary: { failCount, rowCount: rows.length }, rows }, null, 2));
  if (failCount > 0) {
    process.exitCode = 1;
  }
}

main();
