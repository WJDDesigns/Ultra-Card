#!/usr/bin/env node

/**
 * Ultra Card Release Script
 *
 * Automates the release process:
 * - Reads version from version.ts
 * - Builds the project
 * - Prompts for changelog entries
 * - Enhances and categorizes changelog
 * - Updates RELEASE_NOTES.md
 * - Creates git tag and pushes
 * - Creates GitHub release with changelog
 *
 * Usage:
 *   npm run build:release      - Creates a stable release
 *   npm run build:prerelease   - Creates a pre-release (beta/alpha/rc)
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const readline = require('readline');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: msg => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: msg => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: msg =>
    console.log(
      `\n${colors.cyan}${colors.bright}▶${colors.reset} ${colors.bright}${msg}${colors.reset}`
    ),
  header: msg =>
    console.log(
      `\n${colors.magenta}${colors.bright}${'═'.repeat(50)}${colors.reset}\n${colors.magenta}${colors.bright}  ${msg}${colors.reset}\n${colors.magenta}${colors.bright}${'═'.repeat(50)}${colors.reset}\n`
    ),
};

// Configuration
const CONFIG = {
  versionFile: path.resolve(__dirname, '../src/version.ts'),
  releaseNotesFile: path.resolve(__dirname, '../RELEASE_NOTES.md'),
  packageJsonFile: path.resolve(__dirname, '../package.json'),
  repoUrl: 'https://github.com/WJDDesigns/Ultra-Card',
};

/**
 * Extract version from version.ts
 */
function getVersion() {
  try {
    const content = fs.readFileSync(CONFIG.versionFile, 'utf8');
    const match = content.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
    if (!match) {
      throw new Error('Could not find VERSION in version.ts');
    }
    return match[1];
  } catch (error) {
    log.error(`Failed to read version: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Check if version is a pre-release (beta, alpha, rc)
 */
function isPreRelease(version) {
  return /-(alpha|beta|rc)/i.test(version);
}

/**
 * Create readline interface for user input
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Ask a question and wait for answer
 */
function ask(rl, question) {
  return new Promise(resolve => {
    rl.question(`${colors.yellow}?${colors.reset} ${question} `, resolve);
  });
}

/**
 * Categorize and enhance a changelog entry
 */
function categorizeEntry(entry) {
  const lowerEntry = entry.toLowerCase();

  // Feature keywords
  if (lowerEntry.match(/^(add|new|implement|create|introduce|support)/)) {
    return { category: '🚀 New Features', entry: enhanceEntry(entry) };
  }

  // Bug fix keywords
  if (lowerEntry.match(/^(fix|resolve|correct|repair|patch|bug)/)) {
    return { category: '🐛 Bug Fixes', entry: enhanceEntry(entry) };
  }

  // Improvement keywords
  if (lowerEntry.match(/^(improve|enhance|update|optimize|refactor|clean|upgrade)/)) {
    return { category: '🔧 Improvements', entry: enhanceEntry(entry) };
  }

  // Breaking change keywords
  if (lowerEntry.match(/^(break|remove|deprecate|drop)/)) {
    return { category: '⚠️ Breaking Changes', entry: enhanceEntry(entry) };
  }

  // Documentation keywords
  if (lowerEntry.match(/^(doc|readme|comment)/)) {
    return { category: '📝 Documentation', entry: enhanceEntry(entry) };
  }

  // Default to improvement
  return { category: '🔧 Improvements', entry: enhanceEntry(entry) };
}

/**
 * Enhance a single changelog entry
 */
function enhanceEntry(entry) {
  // Clean up the entry
  let enhanced = entry.trim();

  // Remove leading dash or bullet if present
  enhanced = enhanced.replace(/^[-•*]\s*/, '');

  // Capitalize first letter
  enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

  // Extract the main action and description
  const actionMatch = enhanced.match(
    /^(Added?|Fixed?|Improved?|Updated?|Removed?|Changed?|Enhanced?|Implemented?|Created?|Resolved?)\s+/i
  );

  if (actionMatch) {
    const action = actionMatch[1];
    const rest = enhanced.slice(actionMatch[0].length);

    // Format as "**Action description** - Additional details"
    // Try to find a natural break point
    const breakMatch = rest.match(/^([^.!?-]+)(?:\s*[-–—]\s*|\.\s*|:\s*)(.+)?$/);

    if (breakMatch && breakMatch[2]) {
      return `**${action} ${breakMatch[1].trim()}** - ${breakMatch[2].trim()}`;
    } else {
      return `**${action} ${rest.trim()}**`;
    }
  }

  // If no action word found, just bold the whole thing
  return `**${enhanced}**`;
}

/**
 * Collect changelog entries from user
 */
async function collectChangelogEntries() {
  const rl = createReadlineInterface();
  const entries = [];

  console.log(`\n${colors.cyan}Enter your changelog entries (one per line).${colors.reset}`);
  console.log(`${colors.dim}Tips:${colors.reset}`);
  console.log(
    `${colors.dim}  - Start with: Added, Fixed, Improved, Updated, Removed${colors.reset}`
  );
  console.log(`${colors.dim}  - Be specific about what changed${colors.reset}`);
  console.log(`${colors.dim}  - Type 'done' when finished${colors.reset}\n`);

  let entryNumber = 1;

  while (true) {
    const entry = await ask(rl, `Entry ${entryNumber}:`);

    if (entry.toLowerCase() === 'done' || entry === '') {
      if (entries.length === 0) {
        log.warn('No entries provided. Please enter at least one changelog entry.');
        continue;
      }
      break;
    }

    entries.push(entry);
    entryNumber++;
  }

  rl.close();
  return entries;
}

/**
 * Generate formatted changelog content
 */
function generateChangelog(version, entries) {
  // Categorize all entries
  const categories = {};

  for (const entry of entries) {
    const { category, entry: enhanced } = categorizeEntry(entry);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(enhanced);
  }

  // Build the changelog markdown
  let changelog = `## Version ${version}\n\n`;

  // Order: Features, Improvements, Bug Fixes, Breaking Changes, Documentation
  const order = [
    '🚀 New Features',
    '🔧 Improvements',
    '🐛 Bug Fixes',
    '⚠️ Breaking Changes',
    '📝 Documentation',
  ];

  for (const category of order) {
    if (categories[category] && categories[category].length > 0) {
      changelog += `### ${category}\n\n`;
      for (const entry of categories[category]) {
        changelog += `- ${entry}\n`;
      }
      changelog += '\n';
    }
  }

  changelog += '---\n\n';

  return changelog;
}

/**
 * Update RELEASE_NOTES.md file
 */
function updateReleaseNotes(version, newChangelog) {
  let content = '';

  if (fs.existsSync(CONFIG.releaseNotesFile)) {
    content = fs.readFileSync(CONFIG.releaseNotesFile, 'utf8');

    // Find the position after the header (first line that starts with "## Version")
    const headerMatch = content.match(/^# .+\n\n/);

    if (headerMatch) {
      // Insert new changelog after header
      const insertPos = headerMatch[0].length;
      content = content.slice(0, insertPos) + newChangelog + content.slice(insertPos);
    } else {
      // No header found, prepend everything
      content = `# 🎉 Ultra Card - The Ultimate Home Assistant Card Experience\n\n${newChangelog}${content}`;
    }
  } else {
    // Create new file
    content = `# 🎉 Ultra Card - The Ultimate Home Assistant Card Experience\n\n${newChangelog}`;
  }

  fs.writeFileSync(CONFIG.releaseNotesFile, content);
  log.success('Updated RELEASE_NOTES.md');
}

/**
 * Run a shell command and return output
 */
function run(command, options = {}) {
  const { silent = false, ignoreError = false } = options;

  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
    return result;
  } catch (error) {
    if (!ignoreError) {
      throw error;
    }
    return error.stdout || '';
  }
}

/**
 * Check if working directory is clean
 */
function checkGitStatus() {
  const status = run('git status --porcelain', { silent: true });
  return status.trim() === '';
}

/**
 * Check if tag already exists
 */
function tagExists(tag) {
  try {
    run(`git rev-parse ${tag}`, { silent: true, ignoreError: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Build the project
 */
function buildProject() {
  log.step('Building project...');

  try {
    run('npm run prebuild');
    run('npm run build');
    log.success('Build completed successfully');
  } catch (error) {
    log.error('Build failed');
    throw error;
  }
}

/**
 * Create git tag
 */
function createGitTag(version) {
  const tag = `v${version}`;

  if (tagExists(tag)) {
    log.warn(`Tag ${tag} already exists`);
    return tag;
  }

  log.step(`Creating git tag: ${tag}`);
  run(`git tag -a ${tag} -m "Release ${version}"`);
  log.success(`Created tag: ${tag}`);

  return tag;
}

/**
 * Push to GitHub
 */
function pushToGitHub(tag) {
  log.step('Pushing to GitHub...');

  try {
    run('git push origin HEAD');
    run(`git push origin ${tag}`);
    log.success('Pushed to GitHub');
  } catch (error) {
    log.error('Failed to push to GitHub');
    throw error;
  }
}

/**
 * Create GitHub release
 */
function createGitHubRelease(version, changelog, isPrerelease) {
  const tag = `v${version}`;
  const title = `What's New in ${version}`;

  log.step(`Creating GitHub ${isPrerelease ? 'pre-release' : 'release'}...`);

  // Write changelog to temp file to handle special characters
  const tempFile = path.resolve(__dirname, '../.release-notes-temp.md');
  fs.writeFileSync(tempFile, changelog);

  try {
    const prereleaseFlag = isPrerelease ? '--prerelease' : '';

    // Create the release using gh CLI
    const command = `gh release create ${tag} --title "${title}" --notes-file "${tempFile}" ${prereleaseFlag}`;
    run(command);

    log.success(`Created GitHub ${isPrerelease ? 'pre-release' : 'release'}: ${tag}`);
    log.info(`View at: ${CONFIG.repoUrl}/releases/tag/${tag}`);
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

/**
 * Preview the changelog before confirming
 */
async function previewAndConfirm(version, changelog, isPrerelease) {
  const rl = createReadlineInterface();

  console.log(`\n${colors.cyan}${colors.bright}Preview of release:${colors.reset}\n`);
  console.log(`${colors.dim}${'─'.repeat(50)}${colors.reset}`);
  console.log(`${colors.bright}Version:${colors.reset} ${version}`);
  console.log(
    `${colors.bright}Type:${colors.reset} ${isPrerelease ? 'Pre-release (beta/alpha/rc)' : 'Stable Release'}`
  );
  console.log(`${colors.bright}Tag:${colors.reset} v${version}`);
  console.log(`${colors.dim}${'─'.repeat(50)}${colors.reset}`);
  console.log(`\n${colors.bright}Changelog:${colors.reset}\n`);
  console.log(changelog);
  console.log(`${colors.dim}${'─'.repeat(50)}${colors.reset}\n`);

  const answer = await ask(rl, 'Does this look correct? (yes/no/edit):');
  rl.close();

  return answer.toLowerCase();
}

/**
 * Sync package.json version with version.ts
 */
function syncPackageVersion(version) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(CONFIG.packageJsonFile, 'utf8'));
    if (packageJson.version !== version) {
      packageJson.version = version;
      fs.writeFileSync(CONFIG.packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n');
      log.info(`Synced package.json version to ${version}`);
      return true;
    }
    return false;
  } catch (error) {
    log.warn(`Could not sync package.json: ${error.message}`);
    return false;
  }
}

/**
 * Main release process
 */
async function main() {
  const args = process.argv.slice(2);
  const forcePrerelease = args.includes('--prerelease');
  const skipBuild = args.includes('--skip-build');
  const skipPush = args.includes('--skip-push');

  log.header('Ultra Card Release Script');

  // Get version
  const version = getVersion();
  const isPrerelease = forcePrerelease || isPreRelease(version);

  log.info(`Version: ${colors.bright}${version}${colors.reset}`);
  log.info(
    `Release type: ${colors.bright}${isPrerelease ? 'Pre-release' : 'Stable'}${colors.reset}`
  );

  // Check git status
  log.step('Checking git status...');

  // Sync package.json version
  const versionSynced = syncPackageVersion(version);

  // Collect changelog entries
  log.step('Collecting changelog entries...');
  let entries = await collectChangelogEntries();

  // Generate changelog
  let changelog = generateChangelog(version, entries);

  // Preview and confirm
  let confirmed = false;
  while (!confirmed) {
    const response = await previewAndConfirm(version, changelog, isPrerelease);

    if (response === 'yes' || response === 'y') {
      confirmed = true;
    } else if (response === 'edit' || response === 'e') {
      log.info('Re-entering changelog entries...');
      entries = await collectChangelogEntries();
      changelog = generateChangelog(version, entries);
    } else {
      log.warn('Release cancelled by user');
      process.exit(0);
    }
  }

  // Build project
  if (!skipBuild) {
    buildProject();
  } else {
    log.warn('Skipping build (--skip-build flag)');
  }

  // Update RELEASE_NOTES.md
  log.step('Updating RELEASE_NOTES.md...');
  updateReleaseNotes(version, changelog);

  // Commit changes
  log.step('Committing changes...');
  run('git add -A');

  const commitMessage = `Release ${version}`;
  try {
    run(`git commit -m "${commitMessage}"`, { silent: true });
    log.success('Changes committed');
  } catch (error) {
    // If nothing to commit, that's okay
    if (error.message.includes('nothing to commit')) {
      log.info('No changes to commit');
    } else {
      throw error;
    }
  }

  // Create git tag
  const tag = createGitTag(version);

  // Push to GitHub
  if (!skipPush) {
    pushToGitHub(tag);

    // Create GitHub release
    // Extract just the changelog content for the release (without the header)
    const releaseChangelog = changelog.replace(/^## Version .+\n\n/, '');
    createGitHubRelease(version, releaseChangelog, isPrerelease);
  } else {
    log.warn('Skipping push (--skip-push flag)');
    log.info(`To push manually:\n  git push origin HEAD\n  git push origin ${tag}`);
  }

  // Done!
  log.header('Release Complete!');
  log.success(`Version ${version} has been released!`);
  log.info(`Release URL: ${CONFIG.repoUrl}/releases/tag/${tag}`);

  console.log(`\n${colors.dim}Next steps:${colors.reset}`);
  console.log(`${colors.dim}  1. Verify the release on GitHub${colors.reset}`);
  console.log(`${colors.dim}  2. Update HACS if needed${colors.reset}`);
  console.log(`${colors.dim}  3. Announce on Discord${colors.reset}\n`);
}

// Run the script
main().catch(error => {
  log.error(`Release failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
