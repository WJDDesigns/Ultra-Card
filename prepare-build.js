/**
 * Script to ensure version files are in place before building
 * and provides utility to update the version
 */
const fs = require('fs');
const path = require('path');

// Check if an argument was provided for setting a new version
const args = process.argv.slice(2);
if (args.length > 0 && args[0] === '--set-version' && args[1]) {
  updateVersion(args[1]);
} else if (args.length > 0 && args[0] === '--sync-translations') {
  syncTranslationFiles();
} else {
  prepareVersionFiles();
  // Also sync translations during normal build process
  syncTranslationFiles();
}

// Function to update the version in the single source of truth file
function updateVersion(newVersion) {
  const versionTsPath = path.resolve(__dirname, 'src/version.ts');

  // Create the file if it doesn't exist
  if (!fs.existsSync(versionTsPath)) {
    const content = `/**
 * Ultra Vehicle Card Version
 * This is the single source of truth for version information
 */

export const VERSION = '${newVersion}';`;
    fs.writeFileSync(versionTsPath, content);
    console.log(`Created version.ts with version ${newVersion}`);
  } else {
    // Update the existing file
    let content = fs.readFileSync(versionTsPath, 'utf8');
    content = content.replace(/VERSION\s*=\s*['"]([^'"]+)['"]/, `VERSION = '${newVersion}'`);
    fs.writeFileSync(versionTsPath, content);
    console.log(`Updated version.ts to version ${newVersion}`);
  }
}

// Function to prepare version files before build
function prepareVersionFiles() {
  // Make sure the dist directory exists
  if (!fs.existsSync(path.resolve(__dirname, 'dist'))) {
    fs.mkdirSync(path.resolve(__dirname, 'dist'));
    console.log('Created dist directory');
  }

  // Make sure the src/version.ts file exists
  const versionTsPath = path.resolve(__dirname, 'src/version.ts');
  if (!fs.existsSync(versionTsPath)) {
    const content = `/**
 * Ultra Vehicle Card Version
 * This is the single source of truth for version information
 */

export const VERSION = '2.0-Beta8';`;
    fs.writeFileSync(versionTsPath, content);
    console.log('Created default version.ts in src');
  }

  // Extract the version from version.ts
  const versionContent = fs.readFileSync(versionTsPath, 'utf8');
  const versionMatch = versionContent.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
  const version = versionMatch && versionMatch[1] ? versionMatch[1] : '2.0-Beta8';

  // Generate the version.js file
  const versionJsPath = path.resolve(__dirname, 'dist/version.js');
  const distVersionContent = `/**
 * Ultra Vehicle Card Version
 * v${version}
 * 
 * This file is auto-generated from src/version.ts
 * DO NOT MODIFY DIRECTLY
 */

let version = "undefined";

function setVersion(value) {
  version = value;
}

// Set default version (will be overridden by card)
setVersion('${version}');

export { version, setVersion };`;

  fs.writeFileSync(versionJsPath, distVersionContent);
  console.log(`Generated version.js with version ${version}`);
  console.log('Version files are ready. Continuing with build...');

  // Enforce Actions UI layout invariants to prevent regressions
  try {
    const actionsTabPath = path.resolve(__dirname, 'src/tabs/global-actions-tab.ts');
    const actionsTabContent = fs.readFileSync(actionsTabPath, 'utf8');

    // Must use HA ui_action selector
    const hasUiAction = /ui_action\s*:\s*\{/.test(actionsTabContent);
    if (!hasUiAction) {
      throw new Error(
        "[Guard] Actions UI regression: src/tabs/global-actions-tab.ts must use Home Assistant's ui_action selector."
      );
    }

    // Must NOT reintroduce UltraLinkComponent for actions UI
    const mentionsUltraLink = /UltraLinkComponent/.test(actionsTabContent);
    if (mentionsUltraLink) {
      throw new Error(
        '[Guard] Actions UI regression: src/tabs/global-actions-tab.ts should not import or reference UltraLinkComponent for action selection.'
      );
    }

    // Ensure all three action slots are present
    const requires = ['tap_action', 'hold_action', 'double_tap_action'];
    for (const key of requires) {
      if (!actionsTabContent.includes(key)) {
        throw new Error(
          `[Guard] Actions UI regression: Missing required action key: ${key} in src/tabs/global-actions-tab.ts`
        );
      }
    }

    console.log('Actions UI guard passed.');
  } catch (err) {
    console.error(String(err));
    process.exit(1);
  }
}

/**
 * Function to synchronize translation files
 * This ensures all keys present in the English file exist in all other language files
 */
function syncTranslationFiles() {
  console.log('Syncing translation files...');
  const translationsDir = path.resolve(__dirname, 'src/translations');
  const enFilePath = path.resolve(translationsDir, 'en.json');

  // Ensure the translations directory exists
  if (!fs.existsSync(translationsDir)) {
    console.error('Translations directory not found!');
    return;
  }

  // Read the English file as the source of truth
  let enTranslations;
  try {
    enTranslations = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
  } catch (error) {
    console.error('Error reading English translations file:', error);
    return;
  }

  // Get all translation files
  const translationFiles = fs
    .readdirSync(translationsDir)
    .filter(file => file.endsWith('.json') && file !== 'en.json');

  // Create a recursive function to ensure all keys from source exist in target
  function ensureKeysExist(sourceObj, targetObj, path = '') {
    let modified = false;

    // Process all keys in the source object
    for (const key of Object.keys(sourceObj)) {
      const newPath = path ? `${path}.${key}` : key;

      // If the key doesn't exist in the target, add it
      if (!(key in targetObj)) {
        targetObj[key] = sourceObj[key];
        console.log(`Added missing key: ${newPath}`);
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
  for (const file of translationFiles) {
    const filePath = path.resolve(translationsDir, file);
    try {
      console.log(`Processing translation file: ${file}`);
      let translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Ensure all keys from English translation exist
      const modified = ensureKeysExist(enTranslations, translations);

      // Save the file if it was modified
      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
        console.log(`Updated translation file: ${file}`);
      } else {
        console.log(`No changes needed for: ${file}`);
      }
    } catch (error) {
      console.error(`Error processing translation file ${file}:`, error);
    }
  }

  console.log('Translation synchronization complete.');
}

/**
 * Ultra Vehicle Card Version Updater
 *
 * Usage:
 * 1. To prepare for build: node prepare-build.js
 * 2. To update version: node prepare-build.js --set-version 2.0-Beta9
 * 3. To sync translations: node prepare-build.js --sync-translations
 */
