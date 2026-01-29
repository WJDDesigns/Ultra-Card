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

  // Get all translation files
  const translationFiles = fs
    .readdirSync(translationsDir)
    .filter(file => file.endsWith('.json') && file !== 'en.json');

  if (translationFiles.length === 0) {
    console.log('   No additional translation files found.');
    return;
  }

  // Create a recursive function to ensure all keys from source exist in target
  function ensureKeysExist(sourceObj, targetObj, path = '') {
    let modified = false;

    // Process all keys in the source object
    for (const key of Object.keys(sourceObj)) {
      const newPath = path ? `${path}.${key}` : key;

      // If the key doesn't exist in the target, add it
      if (!(key in targetObj)) {
        targetObj[key] = sourceObj[key];
        console.log(`   ➕ Added missing key: ${newPath}`);
        modified = true;
        continue;
      }

      // If both are objects, recursively ensure keys
      if (
        typeof sourceObj[key] === 'object' &&
        sourceObj[key] !== null &&
        typeof targetObj[key] === 'object' &&
        targetObj[key] !== null
      ) {
        const subModified = ensureKeysExist(sourceObj[key], targetObj[key], newPath);
        if (subModified) modified = true;
      }
    }

    return modified;
  }

  // Process each translation file
  let totalModified = 0;
  for (const file of translationFiles) {
    const filePath = path.resolve(translationsDir, file);
    try {
      let translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Ensure all keys from English translation exist
      const modified = ensureKeysExist(enTranslations, translations);

      // Save the file if it was modified
      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
        totalModified++;
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
