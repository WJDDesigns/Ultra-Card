/* eslint-disable no-console */
/**
 * Writes the translation status pages that community translators read:
 *
 *   TRANSLATIONS.md                 one table: every language and how far along it is
 *   docs/translations/<lang>.md     every entry still in English for that language,
 *                                   grouped by module / editor area
 *
 * Runs on every push to main (.github/workflows/translation-status.yml).
 * Locally: npm run translations:status
 *
 * The output has no timestamps, so it only changes when the translations do.
 */
const fs = require('fs');
const path = require('path');
const { flatten } = require('./lib/translation-flat');
const { findMissingKeys } = require('./extract-translation-keys');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'src', 'translations');
const outDir = path.join(root, 'docs', 'translations');
const REPO = 'https://github.com/WJDDesigns/Ultra-Card';

/** @type {Record<string, { name: string; flag: string }>} */
const LANGUAGES = {
  ca: { name: 'Catalan', flag: '🌐' },
  cs: { name: 'Czech', flag: '🇨🇿' },
  da: { name: 'Danish', flag: '🇩🇰' },
  de: { name: 'German', flag: '🇩🇪' },
  'en-GB': { name: 'British English', flag: '🇬🇧' },
  es: { name: 'Spanish', flag: '🇪🇸' },
  fr: { name: 'French', flag: '🇫🇷' },
  it: { name: 'Italian', flag: '🇮🇹' },
  nb: { name: 'Norwegian Bokmål', flag: '🇳🇴' },
  nl: { name: 'Dutch', flag: '🇳🇱' },
  nn: { name: 'Norwegian Nynorsk', flag: '🇳🇴' },
  no: { name: 'Norwegian', flag: '🇳🇴' },
  pl: { name: 'Polish', flag: '🇵🇱' },
  sv: { name: 'Swedish', flag: '🇸🇪' },
  zh: { name: 'Chinese (Simplified)', flag: '🇨🇳' },
};

/** British English matches US English almost everywhere, so it gets no to-do list. */
const SAME_AS_ENGLISH_BY_DESIGN = new Set(['en-GB']);

/** Friendlier names for the top-level areas of en.json. */
const AREA_NAMES = {
  common: 'Common words',
  card: 'Card',
  editor: 'Editor',
  panel: 'Ultra Card Hub',
  hub: 'Ultra Card Hub',
  modules: 'Modules',
};

function listLocales() {
  return fs
    .readdirSync(dir)
    .filter(
      f => f.endsWith('.json') && !f.startsWith('_') && !f.endsWith('.meta.json') && f !== 'en.json'
    )
    .map(f => f.replace(/\.json$/, ''))
    .sort();
}

function loadGlossary() {
  try {
    const g = JSON.parse(fs.readFileSync(path.join(dir, '_glossary.json'), 'utf8'));
    return new Set((g.never_translate || []).map(s => String(s).toLowerCase()));
  } catch {
    return new Set();
  }
}

/**
 * Text that reads the same in every language: numbers, symbols, placeholders,
 * and product or technical names from the glossary.
 * @param {string} value
 * @param {Set<string>} glossary
 */
function isUniversal(value, glossary) {
  const stripped = value
    .replace(/\{[^}]*\}/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
  if (!/\p{L}/u.test(stripped)) return true;
  return glossary.has(stripped.toLowerCase());
}

/**
 * "editor.drawer.panel.title" -> group "editor.drawer", label "Drawer".
 * @param {string} key
 */
function groupOf(key) {
  const parts = key.split('.');
  if (parts.length <= 2) {
    return { id: parts[0], label: AREA_NAMES[parts[0]] || titleCase(parts[0]) };
  }
  const area = AREA_NAMES[parts[0]] || titleCase(parts[0]);
  return { id: `${parts[0]}.${parts[1]}`, label: `${titleCase(parts[1])} (${area.toLowerCase()})` };
}

/** @param {string} s */
function titleCase(s) {
  const t = s.replace(/[_-]+/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** @param {string} s */
function cell(s) {
  let t = String(s).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').replace(/</g, '&lt;');
  if (t.length > 220) t = t.slice(0, 217) + '…';
  return t;
}

/** @param {number} pct */
function bar(pct) {
  const filled = Math.round(pct / 10);
  return '🟩'.repeat(filled) + '⬜'.repeat(10 - filled);
}

/** @param {number} n */
function fmt(n) {
  return n.toLocaleString('en-US');
}

function main() {
  const enFlat = flatten(JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8')));
  const glossary = loadGlossary();
  const translatable = Object.keys(enFlat).filter(k => !isUniversal(enFlat[k], glossary));
  const total = translatable.length;

  const rows = [];
  fs.mkdirSync(outDir, { recursive: true });
  const written = new Set();

  for (const lang of listLocales()) {
    const info = LANGUAGES[lang] || { name: lang, flag: '🏳️' };
    const flat = flatten(JSON.parse(fs.readFileSync(path.join(dir, `${lang}.json`), 'utf8')));
    const todo = translatable.filter(k => !(k in flat) || flat[k] === enFlat[k]);
    const done = total - todo.length;
    const pct = total ? Math.floor((done / total) * 1000) / 10 : 100;
    rows.push({ lang, info, done, todo: todo.length, pct });

    if (SAME_AS_ENGLISH_BY_DESIGN.has(lang)) continue;

    /** @type {Map<string, { label: string; keys: string[] }>} */
    const groups = new Map();
    for (const k of todo) {
      const g = groupOf(k);
      if (!groups.has(g.id)) groups.set(g.id, { label: g.label, keys: [] });
      groups.get(g.id).keys.push(k);
    }
    const sorted = [...groups.values()].sort(
      (a, b) => b.keys.length - a.keys.length || a.label.localeCompare(b.label)
    );

    const editUrl = `${REPO}/edit/main/src/translations/${lang}.json`;
    const lines = [];
    lines.push(`# ${info.flag} ${info.name} translation status`);
    lines.push('');
    lines.push(
      "> This page is generated automatically from the translation files. Don't edit it by hand;"
    );
    lines.push('> it refreshes itself after every change to the `main` branch.');
    lines.push('');
    lines.push(
      `**${pct}% translated** — ${fmt(done)} of ${fmt(total)} entries. **${fmt(todo.length)} still in English.**`
    );
    lines.push('');
    lines.push(bar(pct));
    lines.push('');
    lines.push('## How to translate these');
    lines.push('');
    lines.push(
      `1. Open [\`src/translations/${lang}.json\`](${editUrl}) on GitHub (you\'ll be asked to sign in and fork the project the first time; that\'s automatic).`
    );
    lines.push('2. Pick a section below. Every entry in it is still in English in your file.');
    lines.push(
      "3. Press <kbd>Ctrl</kbd>+<kbd>F</kbd> (<kbd>⌘</kbd>+<kbd>F</kbd> on a Mac) and search for the **English text**. Because the entry hasn't been translated yet, the English text is exactly what's in your file."
    );
    lines.push(
      '4. Replace the English text between the quotes with your translation. Leave the part before the colon, and anything in `{curly braces}`, as it is.'
    );
    lines.push(
      "5. Click **Commit changes…** and then **Propose changes** / **Create pull request**. That's it, the maintainer takes it from there."
    );
    lines.push('');
    lines.push(
      `More help: [translation guide](../../CONTRIBUTING_TRANSLATIONS.md) · [all languages](../../TRANSLATIONS.md)`
    );
    lines.push('');
    lines.push(
      "If the English word really is right in your language (a brand name, or a word you also use), just leave it. It will stay on this list, and that's fine."
    );
    lines.push('');

    if (todo.length === 0) {
      lines.push('## 🎉 Everything is translated');
      lines.push('');
      lines.push('Thank you! New text shows up here as soon as it is added to the card.');
    } else {
      lines.push(`## Still in English (${fmt(todo.length)})`);
      lines.push('');
      lines.push('Biggest sections first. Click a section to open it.');
      lines.push('');
      for (const g of sorted) {
        lines.push('<details>');
        lines.push(
          `<summary><strong>${cell(g.label)}</strong> — ${fmt(g.keys.length)} left</summary>`
        );
        lines.push('');
        lines.push('| English text | Key |');
        lines.push('| --- | --- |');
        for (const k of g.keys) lines.push(`| ${cell(enFlat[k])} | \`${k}\` |`);
        lines.push('');
        lines.push('</details>');
        lines.push('');
      }
    }
    const file = path.join(outDir, `${lang}.md`);
    fs.writeFileSync(file, lines.join('\n').replace(/\n+$/, '') + '\n');
    written.add(`${lang}.md`);
  }

  // Remove pages for languages that no longer exist.
  for (const f of fs.readdirSync(outDir)) {
    if (f.endsWith('.md') && f !== 'README.md' && !written.has(f))
      fs.unlinkSync(path.join(outDir, f));
  }

  rows.sort(
    (a, b) =>
      Number(SAME_AS_ENGLISH_BY_DESIGN.has(a.lang)) -
        Number(SAME_AS_ENGLISH_BY_DESIGN.has(b.lang)) ||
      b.pct - a.pct ||
      a.info.name.localeCompare(b.info.name)
  );
  const missing = findMissingKeys();

  const md = [];
  md.push('# Ultra Card translations');
  md.push('');
  md.push('Ultra Card is translated by people who use it. Thank you to everyone who helps! 💙');
  md.push('');
  md.push('This page shows how far along each language is and links to a to-do list for each one.');
  md.push('It updates itself automatically every time something changes, so it is always current.');
  md.push('');
  md.push(`There are **${fmt(total)}** pieces of text to translate.`);
  md.push('');
  md.push('| Language | Progress | Translated | Still in English | To-do list |');
  md.push('| --- | --- | ---: | ---: | --- |');
  for (const r of rows) {
    const name = `${r.info.flag} ${r.info.name} (\`${r.lang}\`)`;
    if (SAME_AS_ENGLISH_BY_DESIGN.has(r.lang)) {
      md.push(`| ${name} | _Matches US English except for spelling_ | ${fmt(r.done)} | — | — |`);
      continue;
    }
    md.push(
      `| ${name} | ${bar(r.pct)} ${r.pct}% | ${fmt(r.done)} | ${fmt(r.todo)} | [${r.lang}.md](docs/translations/${r.lang}.md) |`
    );
  }
  md.push('');
  md.push('## How to help');
  md.push('');
  md.push(
    "You don't need to install anything or know how to code. A free GitHub account is all it takes."
  );
  md.push('');
  md.push(
    "1. Click your language's **to-do list** above. It lists every piece of text that is still in English, grouped by module."
  );
  md.push(
    '2. Follow the short steps at the top of that page to edit your language file right here on GitHub.'
  );
  md.push(
    "3. Submit your change. When it's merged, this page updates on its own and the text shows up translated in the next release."
  );
  md.push('');
  md.push('Small contributions are very welcome. Translating one module is a great start.');
  md.push('');
  md.push(
    "Your language isn't listed? See [Adding a new language](CONTRIBUTING_TRANSLATIONS.md#adding-a-new-language)."
  );
  md.push(
    'Questions? Ask in the [Ultra Card Discord](https://discord.gg/6xVgHxzzBV) or [open an issue](' +
      REPO +
      '/issues).'
  );
  md.push('');
  md.push('## Notes');
  md.push('');
  md.push(
    '- **"Still in English"** means the entry in that language file is identical to the English one. Most of these were added after the language was last updated.'
  );
  md.push(
    '- Numbers, symbols and names that are never translated (like *Home Assistant*, *YAML* or *Ultra Card*) are not counted.'
  );
  md.push(
    '- British English is a copy of US English with spelling changes only, so it has no to-do list.'
  );
  if (missing.length) {
    md.push(
      `- For developers: ${fmt(missing.length)} piece(s) of editor text are in the code but not yet in \`en.json\`, so they can't be translated. Run \`node scripts/extract-translation-keys.js --write && npm run sync:translations\`.`
    );
  }
  md.push('');
  md.push("_Generated by `npm run translations:status`. Don't edit this file by hand._");

  fs.writeFileSync(path.join(root, 'TRANSLATIONS.md'), md.join('\n') + '\n');
  console.log(`Wrote TRANSLATIONS.md and ${written.size} page(s) in docs/translations/.`);
  for (const r of rows)
    console.log(`  ${r.lang.padEnd(6)} ${String(r.pct).padStart(5)}%  ${r.todo} left`);
}

main();
