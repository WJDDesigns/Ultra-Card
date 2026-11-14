# Helping translate Ultra Card

Thank you for helping make Ultra Card work in your language! You don't need to install anything or know how to code. A free GitHub account is all it takes.

## Start here: what still needs translating

**[TRANSLATIONS.md](TRANSLATIONS.md)** shows every language, how far along it is, and a to-do list for each one. Each to-do list shows the text that is still in English, grouped by module (for example _Drawer_, _Flip card_, _Calendar_), biggest sections first.

These pages update themselves automatically every time something changes, so they are always current. New text added to the card shows up on your language's list on its own.

## Supported languages

| Language                | File         |
| ----------------------- | ------------ |
| Catalan                 | `ca.json`    |
| Chinese (Simplified)    | `zh.json`    |
| Czech                   | `cs.json`    |
| Danish                  | `da.json`    |
| Dutch                   | `nl.json`    |
| English (base language) | `en.json`    |
| British English         | `en-GB.json` |
| French                  | `fr.json`    |
| German                  | `de.json`    |
| Italian                 | `it.json`    |
| Norwegian               | `no.json`    |
| Norwegian Bokmål        | `nb.json`    |
| Norwegian Nynorsk       | `nn.json`    |
| Polish                  | `pl.json`    |
| Spanish                 | `es.json`    |
| Swedish                 | `sv.json`    |

All files live in [`src/translations/`](https://github.com/WJDDesigns/Ultra-Card/tree/main/src/translations).

## How to translate (in your browser)

1. Open your language's to-do list from [TRANSLATIONS.md](TRANSLATIONS.md) and pick a section.
2. Click the link at the top of that page to edit your language file on GitHub. The first time, GitHub asks you to fork the project. That's automatic, just accept.
3. Press <kbd>Ctrl</kbd>+<kbd>F</kbd> (<kbd>⌘</kbd>+<kbd>F</kbd> on a Mac) and search for the **English text** from the list. Untranslated entries contain exactly the English text, so the search finds them.
4. Replace the English text between the quotes with your translation.
5. Click **Commit changes…**, then **Propose changes** and **Create pull request**.

That's it. When your change is merged, the status page updates by itself and your translations ship in the next release.

Small contributions are very welcome. Translating one module is a great start.

### Example

The to-do list shows:

| English text | Key                         |
| ------------ | --------------------------- |
| Drawer Panel | `editor.drawer.panel.title` |

In `de.json` you search for `Drawer Panel` and change

```json
"title": "Drawer Panel"
```

to

```json
"title": "Schubladen-Panel"
```

## Rules of thumb

**Do**

- Change only the text on the **right** side of the colon.
- Keep anything in `{curly braces}` exactly as it is, for example `{count}` or `{value}`. The card fills those in.
- Keep HTML tags like `<br/>` or `<strong>` as they are.
- Use the words Home Assistant uses in your language, so Ultra Card feels like part of it.
- Keep product and technical names in English: _Ultra Card_, _FreeSpace_, _Home Assistant_, _YAML_, _Jinja2_ and so on.

**Don't**

- Change the key on the left of the colon.
- Add or remove entries. If something is missing from your file, the maintainer adds it automatically.
- Worry about quotes and commas. If something breaks, an automatic check points to the line, and we'll help fix it.

If the English word really is correct in your language (a brand name, or a word you also use), leave it as it is. It will stay on the to-do list, and that's fine.

Some older entries were translated by machine. If you spot one that reads oddly, please improve it. Those are just as valuable as new translations.

## Adding a new language

1. Copy `src/translations/en.json` to `src/translations/<code>.json`, using the two-letter ISO 639-1 code (`pt` for Portuguese, `ja` for Japanese and so on). Home Assistant reports Simplified Chinese as `zh-Hans`, and Ultra Card maps it to `zh.json`, so use the short code where one exists.
2. Translate as much as you like. Untranslated entries simply show in English.
3. Open a pull request titled `Translation: Add <Language> support`.

The maintainer registers the new language in the card and on the status page.

## For people working locally

```bash
npm install
npm run validate:translations   # every language has every key
npm run translations:status     # regenerate TRANSLATIONS.md and docs/translations/
npm run translations:extract    # list editor text used in code but missing from en.json
```

Developers adding editor text: always write it as `localize('editor.module.key', lang, 'English text')`. On every push to `main`, a GitHub Action adds any such key that's missing from `en.json`, copies it into every language file, and refreshes the status pages.

## Questions

Ask in the [Ultra Card Discord](https://discord.gg/6xVgHxzzBV) or [open an issue](https://github.com/WJDDesigns/Ultra-Card/issues) with the `translation` label.

Only edit files in `src/translations/`. The maintainer takes care of building the card.
