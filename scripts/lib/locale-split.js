/**
 * Decide which translation keys only the editor needs (issue #281).
 *
 * Every dashboard used to download the whole locale file, although about 90%
 * of it is editor text. The build now ships two chunks per language: a
 * runtime chunk every card loads, and an editor chunk loaded with the visual
 * editor and the Hub panel. This module decides which keys go in the editor
 * chunk. Getting it wrong in one direction only costs bytes (an editor key in
 * the runtime chunk); in the other it shows the English fallback on a
 * dashboard, so every rule leans towards "runtime".
 *
 * A key is editor-only when every place it is written as a string literal is
 * editor code:
 *   - anything under src/editor/, src/tabs/ or src/panels/ (whole files), or
 *   - a function that is reachable only from a module's editor tab renderers
 *     (renderGeneralTab, renderActionsTab, ...), following `this.x()` and
 *     plain `x()` calls inside the same file. A function that is also reachable
 *     from anything else in the file (renderPreview, render, event handlers,
 *     exported helpers) counts as runtime.
 * Keys never written as a literal are built dynamically. Those under `editor.`
 * go to the editor chunk (dynamic editor labels); everything else stays runtime.
 *
 * @module scripts/lib/locale-split
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { flatten } = require('./translation-flat');

const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'src');
const EN_PATH = path.join(SRC, 'translations', 'en.json');

/** Whole directories whose code only runs in the editor or the Hub panel. */
const EDITOR_DIRS = ['editor', 'tabs', 'panels'].map(d => path.join(SRC, d) + path.sep);

/** Module methods that only render editor tabs. */
const EDITOR_ROOT = /^render(General|Actions|Other|Design|Logic|Yaml|Settings|Layout|Advanced)Tab(Content)?$/;

const KEY_LITERAL = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

function listSourceFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'translations' || name === '__tests__' || name === 'website-demo') continue;
      listSourceFiles(p, out);
    } else if (/\.ts$/.test(name) && !/\.(test|spec)\.ts$/.test(name) && !/\.d\.ts$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

/** Name of a function-like node, or undefined for anonymous ones. */
function fnName(node) {
  if (
    (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isGetAccessor(node) || ts.isSetAccessor(node)) &&
    node.name
  ) {
    return node.name.getText();
  }
  if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && node.parent) {
    const p = node.parent;
    if ((ts.isPropertyDeclaration(p) || ts.isVariableDeclaration(p) || ts.isPropertyAssignment(p)) && p.name) {
      return p.name.getText();
    }
  }
  return undefined;
}

/**
 * Per file: which key literals each named function holds, which named
 * functions it calls, and literals outside any named function.
 */
function analyseFile(file, keySet) {
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  /** @type {Map<string, {keys:Set<string>, calls:Set<string>}>} */
  const fns = new Map();
  const topKeys = new Set();
  const externalRefs = new Set();
  const fn = name => {
    if (!fns.has(name)) fns.set(name, { keys: new Set(), calls: new Set() });
    return fns.get(name);
  };

  const visit = (node, owner) => {
    const name = fnName(node);
    // Only top-level named functions own their body; nested named arrows are
    // attributed to the outer owner so callbacks inside renderPreview count
    // as renderPreview.
    if (name && !owner) owner = name;

    if (ts.isStringLiteralLike(node) && KEY_LITERAL.test(node.text) && keySet.has(node.text)) {
      if (owner) fn(owner).keys.add(node.text);
      else topKeys.add(node.text);
    }
    if (ts.isPropertyAccessExpression(node) && node.expression.kind !== ts.SyntaxKind.ThisKeyword) {
      externalRefs.add(node.name.getText());
    }
    if (owner && ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isPropertyAccessExpression(callee) && callee.expression.kind === ts.SyntaxKind.ThisKeyword) {
        fn(owner).calls.add(callee.name.getText());
      } else if (ts.isIdentifier(callee)) {
        fn(owner).calls.add(callee.getText());
      }
    }
    // `this.foo` passed as a callback (e.g. @click=${this._onX}) is a reference, not a call;
    // record it too so handlers stay attached to their owner.
    if (owner && ts.isPropertyAccessExpression(node) && node.expression.kind === ts.SyntaxKind.ThisKeyword) {
      fn(owner).calls.add(node.name.getText());
    }
    ts.forEachChild(node, child => visit(child, owner));
  };
  visit(sf, undefined);
  return { fns, topKeys, externalRefs };
}

function reach(roots, fns) {
  const seen = new Set();
  const stack = [...roots];
  while (stack.length) {
    const n = stack.pop();
    if (seen.has(n) || !fns.has(n)) continue;
    seen.add(n);
    for (const c of fns.get(n).calls) stack.push(c);
  }
  return seen;
}

/**
 * @returns {{ editorKeys: Set<string>, runtimeKeys: Set<string>, allKeys: string[] }}
 */
function computeLocaleSplit() {
  const en = flatten(JSON.parse(fs.readFileSync(EN_PATH, 'utf8')));
  const allKeys = Object.keys(en);
  const keySet = new Set(allKeys);
  const usedInRuntime = new Set();
  const usedInEditor = new Set();

  const analysed = listSourceFiles(SRC).map(file => ({
    file,
    editorFile: EDITOR_DIRS.some(d => file.startsWith(d)),
    ...analyseFile(file, keySet),
  }));
  // Method names that runtime code in any file reaches through another object
  // (`moduleHandler.getAlignmentOptions()`). Such a method may run on a
  // dashboard even when, inside its own file, only an editor tab calls it.
  const calledFromElsewhere = new Set();
  for (const a of analysed) if (!a.editorFile) for (const n of a.externalRefs) calledFromElsewhere.add(n);

  for (const { editorFile, fns, topKeys } of analysed) {
    if (editorFile) {
      for (const k of topKeys) usedInEditor.add(k);
      for (const f of fns.values()) for (const k of f.keys) usedInEditor.add(k);
      continue;
    }
    for (const k of topKeys) usedInRuntime.add(k);

    const editorRoots = [...fns.keys()].filter(n => EDITOR_ROOT.test(n));
    const editorReach = reach(editorRoots, fns);
    const otherRoots = [...fns.keys()].filter(
      n => !editorReach.has(n) || (calledFromElsewhere.has(n) && !EDITOR_ROOT.test(n))
    );
    const runtimeReach = reach(otherRoots, fns);
    for (const [name, f] of fns) {
      const editorOnly = editorReach.has(name) && !runtimeReach.has(name);
      for (const k of f.keys) (editorOnly ? usedInEditor : usedInRuntime).add(k);
    }
  }

  const editorKeys = new Set();
  const runtimeKeys = new Set();
  for (const k of allKeys) {
    if (usedInRuntime.has(k)) runtimeKeys.add(k);
    else if (usedInEditor.has(k)) editorKeys.add(k);
    else if (k.startsWith('editor.')) editorKeys.add(k);
    else runtimeKeys.add(k);
  }
  return { editorKeys, runtimeKeys, allKeys };
}

let cached;
/** Memoized for one build process. */
function getLocaleSplit() {
  if (!cached) cached = computeLocaleSplit();
  return cached;
}

/**
 * Keep only one part of a nested locale object.
 * @param {Record<string, unknown>} dict
 * @param {'runtime'|'editor'} part
 */
function pickPart(dict, part) {
  const { editorKeys } = getLocaleSplit();
  const wantEditor = part === 'editor';
  const walk = (obj, prefix) => {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const sub = walk(v, key);
        if (Object.keys(sub).length) out[k] = sub;
      } else if (editorKeys.has(key) === wantEditor) {
        out[k] = v;
      }
    }
    return out;
  };
  return walk(dict, '');
}

module.exports = { computeLocaleSplit, getLocaleSplit, pickPart, SRC };
