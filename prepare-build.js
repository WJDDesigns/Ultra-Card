#!/usr/bin/env node

/**
 * Pre-build script for Ultra Card
 * Syncs translation files to ensure all language files have the same keys as en.json
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Running pre-build checks...\n');

/**
 * Function to sync version from version.ts to package.json
 * version.ts is the single source of truth for the version
 */
function syncVersion() {
  console.log('📦 Syncing version from version.ts...');
  const versionTsPath = path.resolve(__dirname, 'src/version.ts');
  const packageJsonPath = path.resolve(__dirname, 'package.json');

  try {
    const versionTsContent = fs.readFileSync(versionTsPath, 'utf8');
    const versionMatch = versionTsContent.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);

    if (!versionMatch) {
      console.error('❌ Could not extract version from version.ts');
      return;
    }

    const version = versionMatch[1];
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (packageJson.version !== version) {
      packageJson.version = version;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`   ✅ Updated package.json version to ${version}`);
    } else {
      console.log(`   ✅ package.json version already at ${version}`);
    }
  } catch (error) {
    console.error('❌ Error syncing version:', error);
  }
}

/**
 * Function to synchronize translation files
 * This ensures all keys present in the English file exist in all other language files
 */
function syncTranslationFiles() {
  console.log('📝 Syncing translation files...');
  const translationsDir = path.resolve(__dirname, 'src/translations');
  const enFilePath = path.resolve(translationsDir, 'en.json');

  // Ensure the translations directory exists
  if (!fs.existsSync(translationsDir)) {
    console.error('❌ Translations directory not found!');
    return;
  }

  // Read the English file as the source of truth
  let enTranslations;
  try {
    enTranslations = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading English translations file:', error);
    return;
  }

  // Get all translation files (exclude glossary and per-locale meta sidecars)
  const translationFiles = fs.readdirSync(translationsDir).filter(file => {
    if (!file.endsWith('.json')) return false;
    if (file === 'en.json') return false;
    if (file.startsWith('_')) return false;
    if (file.endsWith('.meta.json')) return false;
    return true;
  });

  if (translationFiles.length === 0) {
    console.log('   No additional translation files found.');
    return;
  }

  /**
   * Ensure all keys from source exist in target; record each added path (English fallback).
   * @param {Record<string, unknown>} sourceObj
   * @param {Record<string, unknown>} targetObj
   * @param {string} pathPrefix
   * @param {string[]} backfilled
   * @returns {boolean}
   */
  function ensureKeysExist(sourceObj, targetObj, pathPrefix = '', backfilled = []) {
    let modified = false;

    for (const key of Object.keys(sourceObj)) {
      const newPath = pathPrefix ? `${pathPrefix}.${key}` : key;

      if (!(key in targetObj)) {
        targetObj[key] = sourceObj[key];
        backfilled.push(newPath);
        modified = true;
        continue;
      }

      if (
        typeof sourceObj[key] === 'object' &&
        sourceObj[key] !== null &&
        typeof targetObj[key] === 'object' &&
        targetObj[key] !== null
      ) {
        const subModified = ensureKeysExist(
          /** @type {Record<string, unknown>} */ (sourceObj[key]),
          /** @type {Record<string, unknown>} */ (targetObj[key]),
          newPath,
          backfilled
        );
        if (subModified) modified = true;
      }
    }

    return modified;
  }

  let totalModified = 0;
  for (const file of translationFiles) {
    const filePath = path.resolve(translationsDir, file);
    try {
      let translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const backfilled = [];
      const modified = ensureKeysExist(enTranslations, translations, '', backfilled);

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
        totalModified++;
      }

      if (backfilled.length > 0) {
        console.log(
          `   [translations] ${file}: backfilled ${backfilled.length} missing key(s) from en.json (English until translated).`
        );
        if (process.env.TRANSLATIONS_VERBOSE === '1') {
          backfilled.slice(0, 40).forEach(p => console.log(`      + ${p}`));
          if (backfilled.length > 40) {
            console.log(`      ... and ${backfilled.length - 40} more (set TRANSLATIONS_VERBOSE=1 already on)`);
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ Error processing translation file ${file}:`, error);
    }
  }

  if (totalModified > 0) {
    console.log(`   ✅ Updated ${totalModified} translation file(s)`);
  } else {
    console.log('   ✅ All translation files are in sync');
  }
}

// Run the synchronization
syncVersion();
syncTranslationFiles();
console.log('\n✨ Pre-build checks complete!\n');
