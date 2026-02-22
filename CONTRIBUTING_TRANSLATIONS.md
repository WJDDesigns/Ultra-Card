# Contributing Translations to Ultra Card

Help make Ultra Card accessible to users worldwide! We welcome translation contributions from the community.

## 🌍 Currently Supported Languages

- 🇪🇺 Catalan (`ca.json`)
- 🇨🇿 Czech (`cs.json`)
- 🇩🇰 Danish (`da.json`)
- 🇩🇪 German (`de.json`)
- 🇬🇧 British English (`en-GB.json`)
- 🇺🇸 English (`en.json`) - Base language
- 🇪🇸 Spanish (`es.json`)
- 🇫🇷 French (`fr.json`)
- 🇮🇹 Italian (`it.json`)
- 🇳🇴 Norwegian Bokmål (`nb.json`)
- 🇳🇱 Dutch (`nl.json`)
- 🇳🇴 Norwegian Nynorsk (`nn.json`)
- 🇳🇴 Norwegian (`no.json`)
- 🇵🇱 Polish (`pl.json`)
- 🇸🇪 Swedish (`sv.json`)

## 🚀 How to Contribute

### Option 1: GitHub Web Interface (Easiest)

1. **Navigate to translations**: Go to [`src/translations/`](https://github.com/WJDDesigns/Ultra-Card/tree/main/src/translations) on GitHub
2. **Choose your language**: Click on your language file (e.g., `de.json` for German)
3. **Edit directly**: Click the pencil icon (✏️) to edit
4. **Make changes**: Update the translation values (right side of colons only)
5. **Commit changes**: Scroll down, add a commit message like "Update German translations"
6. **Create Pull Request**: GitHub will automatically prompt you to create a PR

### Option 2: Fork & Clone (Advanced)

1. **Fork this repository** to your GitHub account
2. **Clone your fork**: `git clone https://github.com/YOUR-USERNAME/Ultra-Card.git`
3. **Edit translation files** in `src/translations/`
4. **Test locally** (optional): Run `npm run validate:translations`
5. **Commit and push**:
   ```bash
   git add src/translations/
   git commit -m "Translation: Update [Language] translations"
   git push origin main
   ```
6. **Create Pull Request** from your fork to the main repository

## 📝 Translation Guidelines

### ✅ DO:

- **Translate values only**: Only change text on the right side of colons
- **Keep JSON structure**: Maintain exact same hierarchy and keys
- **Use appropriate tone**: Match Home Assistant's UI language style
- **Preserve placeholders**: Keep `{count}`, `{value}`, `{ratio}` unchanged
- **Test your JSON**: Ensure valid JSON syntax (use online validator if needed)
- **Use proper terminology**: Use established Home Assistant terms in your language

### ❌ DON'T:

- **Change JSON keys**: Never modify the left side of colons
- **Translate technical terms**: Keep "Home Assistant", "Jinja2", "YAML" as-is
- **Remove placeholders**: Keep `{count}`, `{value}`, etc. in place
- **Modify HTML tags**: Keep `<br/>`, `<strong>`, etc. unchanged
- **Change file structure**: Don't add/remove sections

## 🔍 Example

**English (en.json):**

```json
{
  "editor": {
    "modules": {
      "icons_configured": "{count} icons configured"
    }
  }
}
```

**German translation (de.json):**

```json
{
  "editor": {
    "modules": {
      "icons_configured": "{count} Symbole konfiguriert"
    }
  }
}
```

## 🆕 Adding a New Language

1. **Copy base file**: Copy `src/translations/en.json` to `src/translations/[language-code].json`
2. **Use ISO 639-1 codes**: `de` (German), `fr` (French), `pt` (Portuguese), etc.
3. **Translate all values**: Go through each section systematically
4. **Submit PR**: Create pull request with title "Translation: Add [Language] support"

## 🧪 Testing Your Translation

### Online JSON Validator

Use [JSONLint](https://jsonlint.com/) to validate your JSON syntax.

### Local Testing (Optional)

If you have Node.js installed:

```bash
npm install
npm run validate:translations
```

## 📋 Translation Checklist

Before submitting your PR:

- [ ] JSON syntax is valid (no trailing commas, proper quotes)
- [ ] All placeholders preserved (`{count}`, `{value}`, `{ratio}`)
- [ ] No keys were modified (left side of colons)
- [ ] Appropriate tone and terminology used
- [ ] Tested in a JSON validator

## 🏷️ PR Guidelines

### Title Format:

- **New language**: `Translation: Add [Language] support`
- **Updates**: `Translation: Update [Language] translations`
- **Fixes**: `Translation: Fix [Language] translation errors`

### Description Template:

```markdown
## Translation Contribution

**Language**: [Language Name] (`[code].json`)
**Type**: [New language / Update / Fix]

### Changes Made:

- [Describe your changes]

### Testing:

- [ ] JSON syntax validated
- [ ] Placeholders preserved
- [ ] Appropriate terminology used

### Notes:

[Any additional context or questions]
```

## 🤝 Community & Support

- **Questions?** Open an issue with the `translation` label
- **Join Discord**: [Link to Discord server]
- **Discussions**: Use GitHub Discussions for translation coordination

## 🙏 Recognition

All contributors will be credited in our release notes and README. Thank you for helping make Ultra Card accessible worldwide! 🌍

---

**Need help?** Don't hesitate to ask questions in the issues or discussions section. We're here to help!

⚠️ **Important**: Only edit files in `src/translations/`, not `dist/`. The maintainer will handle the build process.
