---
description: Always repackage and version-bump the WordPress plugin zip after editing plugin files
globs: ultra-card-integration/**,ultra-card-integration.php,includes/**,templates/**
alwaysApply: false
---

# WordPress Plugin Packaging

After **any** change to the plugin, run:

```bash
npm run plugin:zip
```

It bumps the patch version, mirrors the copy at the repo root, rebuilds
`ultra-card-integration.zip`, and verifies the result (PHP syntax, version,
archive matches source). Wayne uploads that zip directly, so a plugin edit is
not finished until the zip is rebuilt — never leave the zip a version behind
the source.

Do not hand-edit the version or run `zip` manually. Use the flags instead:

```bash
npm run plugin:zip -- --version 1.4.0   # explicit version
npm run plugin:zip -- --no-bump         # repackage without bumping
```

## Constraints the script protects

- **Always bump the version.** Two installs with the same version are
  indistinguishable in WordPress, so a fix can't be confirmed as applied. The
  version lives in both the `* Version:` header and the
  `ULTRA_CARD_INTEGRATION_VERSION` define; they must never disagree.
- **Never rename the zip.** The archive is intentionally flat (`includes/`,
  `templates/` and the main file at the root, no wrapping folder). WordPress
  derives the install directory from the *filename* for such archives, so only
  `ultra-card-integration.zip` lands in `plugins/ultra-card-integration/`.
- **Commit the zip with the change.** `.gitignore` ignores `*.php` repo-wide,
  so the plugin source has no git history — the committed zip is the only
  record of previous versions.

## Where to edit

`ultra-card-integration/` is canonical. The `includes/`, `templates/` and
`ultra-card-integration.php` copies at the repo root are a mirror that the
script refreshes; edits made only there will be overwritten.

Templates render live pages, so also remember that `/presets/` is served by
`templates/archive-ultra_preset.php` — the standalone
`website/presets-page-embed.html` is a separate surface pasted into WPBakery.
