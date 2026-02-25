# Release steps – Ultra Card (beta) & Ultra Card Pro Cloud (stable)

Do these when you’re ready to publish. You need: `git` and GitHub CLI `gh` installed and logged in (`gh auth status`).

---

## 1. Ultra Card – **beta** (3.0.0-beta1)

**Repo:** `Ultra Card`  
**Version:** 3.0.0-beta1 (already set in `src/version.ts`)  
**Changelog:** Entries are in `release-entries-3.0.0-beta1.txt`.

1. **Commit any uncommitted changes** (hub blurbs, deploy script, release script, version, release entries):
   ```bash
   cd "/Users/wayne/Ultra Card"
   git status
   git add -A
   git commit -m "Prepare 3.0.0-beta1: new sidebar for all settings, Pro integration for non-Pro users"
   ```

2. **Run the release script (beta)** using the changelog file so it doesn’t prompt for entries:
   ```bash
   node scripts/release.js --prerelease --changelog-file release-entries-3.0.0-beta1.txt
   ```
   - Script will: build, update RELEASE_NOTES.md, commit “Release 3.0.0-beta1”, tag `v3.0.0-beta1`, push, and create a **GitHub pre-release** with the generated changelog.
   - When it asks “Does this look correct? (yes/no/edit):” type **yes**.

3. **Confirm on GitHub:**  
   Open the repo → Releases → the new pre-release and confirm the notes and assets.

---

## 2. Ultra Card Pro Cloud – **stable** (1.0.6)

**Repo:** `Ultra Card Pro Cloud`  
**Version:** 1.0.6 (already set in `version.py` and `custom_components/ultra_card_pro_cloud/manifest.json`)  
**Changelog:** Already added in `CHANGELOG.md` under `[1.0.6]`. Release notes for GitHub are in `release-notes-1.0.6.md`.

1. **Commit and tag:**
   ```bash
   cd "/Users/wayne/Ultra Card Pro Cloud"
   git add -A
   git status
   git commit -m "Release 1.0.6: new Ultra Card sidebar, Pro update / non-Pro install instructions"
   git tag -a v1.0.6 -m "Release 1.0.6"
   git push origin HEAD
   git push origin v1.0.6
   ```

2. **Create the GitHub release (stable):**
   ```bash
   cd "/Users/wayne/Ultra Card Pro Cloud"
   gh release create v1.0.6 --title "Release 1.0.6" --notes-file release-notes-1.0.6.md
   ```
   (`release-notes-1.0.6.md` contains only the 1.0.6 section.)

3. **Confirm on GitHub:**  
   Repo → Releases → new v1.0.6 release (stable, not pre-release).

---

## Summary

| Project              | Version     | Type   | What users see |
|----------------------|------------|--------|----------------|
| Ultra Card           | 3.0.0-beta1 | Beta   | New sidebar with all settings; non-Pro need Pro integration to see it |
| Ultra Card Pro Cloud | 1.0.6      | Stable | New sidebar; Pro users update integration, non-Pro install to access sidebar |

When both releases are done, users can update and will see the new sidebar: Pro members by updating the integration, non-Pro by installing the Ultra Card Pro Cloud integration.

If anything fails (e.g. `gh` not found or push rejected), fix the issue and re-run the relevant step; the scripts and version bumps are already in place.
