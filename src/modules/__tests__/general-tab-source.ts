import * as fs from 'node:fs';
import * as path from 'node:path';

/** Body of a brace-balanced block starting at the first `{` at or after `from`. */
function braceBody(src: string, from: number): string | null {
  const open = src.indexOf('{', from);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return src.slice(open + 1, i);
    }
  }
  return null;
}

/** Body of the class method `name` (its definition, not the first mention in a comment). */
export function methodBody(src: string, name: string): string | null {
  const re = new RegExp(
    `^\\s*(?:(?:public|private|protected|override|async|static)\\s+)*${name}\\s*(?:<[^>]*>)?\\s*\\(`,
    'm'
  );
  const m = re.exec(src);
  if (!m) return null;
  // Skip the parameter list (it can contain braces in object types).
  let i = m.index + m[0].length;
  let depth = 1;
  for (; i < src.length && depth > 0; i++) {
    if (src[i] === '(') depth++;
    else if (src[i] === ')') depth--;
  }
  return braceBody(src, i);
}

/**
 * Everything that renders a module's General tab: the `renderGeneralTab` body,
 * every same-file method it calls through `this.` (followed transitively), and any
 * `./settings/*-module-settings` file it lazy-loads. The old check read only the
 * first text match of `renderGeneralTab`, which in some modules was a JSDoc comment,
 * and never looked into helpers or settings files.
 */
export function generalTabSource(modulePath: string): string | null {
  const src = fs.readFileSync(modulePath, 'utf8');
  const root = methodBody(src, 'renderGeneralTab');
  if (root === null) return null;

  const parts = [root];
  const seen = new Set<string>(['renderGeneralTab']);
  const queue = [root];
  while (queue.length) {
    const body = queue.shift()!;
    for (const m of body.matchAll(/this\.(\w+)\s*\(/g)) {
      const name = m[1]!;
      if (seen.has(name)) continue;
      seen.add(name);
      const helper = methodBody(src, name);
      if (helper !== null) {
        parts.push(helper);
        queue.push(helper);
      }
    }
  }

  for (const m of src.matchAll(/['"]\.\/settings\/([\w-]+-module-settings)['"]/g)) {
    const settingsPath = path.join(path.dirname(modulePath), 'settings', `${m[1]}.ts`);
    if (fs.existsSync(settingsPath)) parts.push(fs.readFileSync(settingsPath, 'utf8'));
  }
  return parts.join('\n');
}
