/**
 * Finds every `localize('key', lang, 'English fallback')` call in src/ using the
 * TypeScript parser, so translation scripts can tell which keys the code uses.
 * @module scripts/lib/localize-calls
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const LOCALIZE_FNS = new Set(['localize', 'localizeWithLogging']);

/** @param {string} dir @param {string[]} out */
function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.ts$/.test(entry.name) && !/\.(test|spec|d)\.ts$/.test(entry.name)) out.push(p);
  }
  return out;
}

/** @param {import('typescript').Node} node */
function literalText(node) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return undefined;
}

/**
 * @param {string} srcDir absolute path to src/
 * @returns {{ key: string; fallback?: string; file: string; line: number }[]}
 */
function findLocalizeCalls(srcDir) {
  const root = path.dirname(srcDir);
  /** @type {{ key: string; fallback?: string; file: string; line: number }[]} */
  const calls = [];
  for (const file of walk(srcDir, [])) {
    const text = fs.readFileSync(file, 'utf8');
    if (!text.includes('localize')) continue;
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    /** @param {import('typescript').Node} node */
    const visit = node => {
      if (ts.isCallExpression(node)) {
        const callee = node.expression;
        const name = ts.isIdentifier(callee)
          ? callee.text
          : ts.isPropertyAccessExpression(callee)
            ? callee.name.text
            : '';
        if (LOCALIZE_FNS.has(name) && node.arguments.length >= 1) {
          const key = literalText(node.arguments[0]);
          if (key) {
            calls.push({
              key,
              fallback: literalText(node.arguments[2]),
              file: path.relative(root, file).split(path.sep).join('/'),
              line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1,
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return calls;
}

module.exports = { findLocalizeCalls };
