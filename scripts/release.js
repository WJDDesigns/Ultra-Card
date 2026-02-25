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
 * Description expansions for professional changelog entries
 * Maps keywords to expanded, user-friendly descriptions
 */
const descriptionExpansions = {
  // Module-related
  module: 'Enhanced module functionality for better user experience',
  popup: 'Improved popup behavior and display reliability',
  slider: 'Better slider control and smoother interaction',
  dropdown: 'Enhanced dropdown functionality and responsiveness',
  gauge: 'Improved gauge display accuracy and visual appeal',
  graph: 'Enhanced graph visualization and data rendering',
  camera: 'Improved camera feed handling and reliability',
  icon: 'Enhanced icon display and customization options',
  text: 'Improved text rendering and styling capabilities',
  button: 'Enhanced button interaction and visual feedback',
  toggle: 'Improved toggle state handling and reliability',
  bar: 'Enhanced bar visualization and progress display',
  calendar: 'Improved calendar display and event handling',
  climate: 'Enhanced climate control interface and usability',
  light: 'Improved light control functionality and color handling',
  media: 'Enhanced media player controls and playback',
  weather: 'Improved weather visualization and data display',
  vacuum: 'Enhanced vacuum control interface and status display',
  grid: 'Improved grid layout system and flexibility',
  separator: 'Enhanced separator styling and spacing options',
  spinbox: 'Improved spinbox controls and value handling',
  markdown: 'Enhanced markdown rendering and formatting',
  image: 'Improved image handling and display options',
  video: 'Enhanced video playback and background support',
  accordion: 'Improved accordion behavior and styling',
  tabs: 'Enhanced tab navigation and content display',

  // Feature-related
  breakpoint: 'Create unique designs for different screen sizes with responsive breakpoint system',
  responsive: 'Better adaptation to different screen sizes and devices',
  preview: 'Test your changes directly in the editor preview',
  'live preview': 'Test your responsive designs directly in the editor preview',
  template: 'Enhanced template processing and dynamic content evaluation',
  animation: 'Smoother animations and visual transitions',
  color: 'Enhanced color handling and customization options',
  gradient: 'Improved gradient rendering and color transitions',
  layout: 'Better layout handling and organization',
  design: 'Enhanced design customization options',
  style: 'Improved styling and visual appearance',
  action: 'Enhanced action handling and user interaction response',
  entity: 'Better entity state handling and real-time display',
  state: 'Improved state tracking and automatic updates',
  variable: 'Enhanced variable handling and value evaluation',
  preset: 'Improved preset loading and management',
  backup: 'Enhanced backup and restore functionality',
  sync: 'Improved synchronization across devices and sessions',
  mobile: 'Better mobile device support and touch interaction handling',
  performance: 'Improved performance and responsiveness',
  size: 'More granular control over sizing options',
  spacing: 'Better spacing and margin control',
  border: 'Enhanced border customization options',
  shadow: 'Improved shadow effects and visual depth',
  font: 'Enhanced typography and font options',
  'z-index': 'Fixed layering and element overlap issues',
  overflow: 'Resolved content overflow and clipping issues',
  scroll: 'Improved scrolling behavior and smoothness',
  touch: 'Better touch handling on mobile devices',
  click: 'Improved click and tap interaction handling',
  hover: 'Enhanced hover effects and visual feedback',
  focus: 'Improved focus handling and keyboard navigation',
  tracking: 'Resolved state tracking and synchronization issues',
  favorites: 'Improved favorites functionality and storage',
  window: 'Better multi-window support and handling',
  operator: 'Fixed comparison operator handling in conditions',
  column: 'Improved column layout and responsive behavior',
  row: 'Enhanced row layout and organization',
  viewport: 'Better viewport detection and responsive layouts',
  'pro user': 'Enhanced Pro user features and customization options',
  'default module': 'Better control over default module behavior',
};

/**
 * Find the best description expansion for the entry
 */
function findDescriptionExpansion(entry) {
  const lowerEntry = entry.toLowerCase();

  // Find matching keywords, preferring longer/more specific matches
  let bestMatch = null;
  let bestLength = 0;

  for (const [keyword, description] of Object.entries(descriptionExpansions)) {
    if (lowerEntry.includes(keyword) && keyword.length > bestLength) {
      bestMatch = description;
      bestLength = keyword.length;
    }
  }

  return bestMatch;
}

/**
 * Generate a professional description based on the entry and category
 */
function generateDescription(entry, category) {
  const lowerEntry = entry.toLowerCase();

  // First try to find a specific expansion from our dictionary
  const expansion = findDescriptionExpansion(entry);
  if (expansion) {
    return expansion;
  }

  // Generic descriptions based on category
  if (category.includes('New Features')) {
    if (lowerEntry.includes('support')) return 'Expanded compatibility and configuration options';
    if (lowerEntry.includes('option')) return 'More flexibility and customization choices';
    if (lowerEntry.includes('control')) return 'Enhanced user control and interaction options';
    return 'New capability for improved dashboard customization';
  }

  if (category.includes('Bug Fixes')) {
    if (lowerEntry.includes('issue')) return 'Resolved reported problems for better reliability';
    if (lowerEntry.includes('not working')) return 'Restored proper functionality';
    if (lowerEntry.includes('crash')) return 'Improved stability and error handling';
    return 'Corrected behavior for more reliable operation';
  }

  if (category.includes('Improvements')) {
    if (lowerEntry.includes('better')) return 'Enhanced for improved user experience';
    if (lowerEntry.includes('faster')) return 'Optimized for better performance';
    if (lowerEntry.includes('cleaner')) return 'Refined interface and code quality';
    return 'Refined functionality for smoother operation';
  }

  if (category.includes('Warning')) {
    return '';
  }

  return 'Enhanced functionality and reliability';
}

/**
 * Categorize a changelog entry based on keywords
 */
function categorizeEntry(entry) {
  const lowerEntry = entry.toLowerCase();
  let category;

  // Feature keywords
  if (lowerEntry.match(/^(add|new|implement|create|introduce|support)/)) {
    category = '🚀 New Features';
  }
  // Bug fix keywords
  else if (lowerEntry.match(/^(fix|resolve|correct|repair|patch|bug)/)) {
    category = '🐛 Bug Fixes';
  }
  // Improvement keywords
  else if (lowerEntry.match(/^(improve|enhance|update|optimize|refactor|clean|upgrade)/)) {
    category = '🔧 Improvements';
  }
  // Breaking change keywords
  else if (lowerEntry.match(/^(break|remove|deprecate|drop)/)) {
    category = '⚠️ Breaking Changes';
  }
  // Documentation keywords
  else if (lowerEntry.match(/^(doc|readme|comment)/)) {
    category = '📝 Documentation';
  }
  // Warning keywords
  else if (lowerEntry.match(/^(warn|caution|note|important|probably)/)) {
    category = '⚠️ Warning';
  }
  // Default to improvement
  else {
    category = '🔧 Improvements';
  }

  return { category, entry: enhanceEntry(entry, category) };
}

/**
 * Normalize action words to past tense with proper capitalization
 */
function normalizeAction(action) {
  const normalized = {
    add: 'Added',
    added: 'Added',
    fix: 'Fixed',
    fixed: 'Fixed',
    improve: 'Improved',
    improved: 'Improved',
    update: 'Updated',
    updated: 'Updated',
    remove: 'Removed',
    removed: 'Removed',
    change: 'Changed',
    changed: 'Changed',
    enhance: 'Enhanced',
    enhanced: 'Enhanced',
    implement: 'Implemented',
    implemented: 'Implemented',
    create: 'Created',
    created: 'Created',
    resolve: 'Resolved',
    resolved: 'Resolved',
    new: 'Added new',
    support: 'Added support for',
    supports: 'Added support for',
    supported: 'Added support for',
  };

  return normalized[action.toLowerCase()] || capitalizeFirst(action);
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Expand common abbreviations
 */
function expandAbbreviations(text) {
  const expansions = {
    ui: 'UI',
    ux: 'UX',
    css: 'CSS',
    html: 'HTML',
    api: 'API',
    ha: 'Home Assistant',
    hass: 'Home Assistant',
    uc: 'Ultra Card',
  };

  let expanded = text;
  for (const [abbr, full] of Object.entries(expansions)) {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    expanded = expanded.replace(regex, full);
  }

  return expanded;
}

/**
 * Enhance a single changelog entry to be professional and descriptive
 */
function enhanceEntry(entry, category) {
  // Clean up the entry
  let cleaned = entry.trim();

  // Remove leading dash or bullet if present
  cleaned = cleaned.replace(/^[-•*]\s*/, '');

  // Handle warning category specially - just return the text as-is
  if (category.includes('Warning')) {
    return capitalizeFirst(cleaned);
  }

  // Check if user already provided a description with a separator
  const separatorMatch = cleaned.match(/^(.+?)\s*[-–—:]\s+(.{15,})$/);
  if (separatorMatch) {
    // User provided their own description, format it nicely
    const title = expandAbbreviations(capitalizeFirst(separatorMatch[1].trim()));
    const desc = capitalizeFirst(separatorMatch[2].trim());
    return `**${title}** - ${desc}`;
  }

  // Extract the action word and subject
  const actionMatch = cleaned.match(
    /^(added?|fixed?|improved?|updated?|removed?|changed?|enhanced?|implemented?|created?|resolved?|new|support(?:ed|s)?)\s+/i
  );

  let action = '';
  let subject = cleaned;

  if (actionMatch) {
    action = normalizeAction(actionMatch[1]);
    subject = cleaned.slice(actionMatch[0].length);
  }

  // Expand abbreviations and clean up the subject
  subject = expandAbbreviations(subject);
  subject = capitalizeFirst(subject);

  // Build the title
  const title = action ? `${action} ${subject}` : subject;

  // Generate a professional description
  const description = generateDescription(cleaned, category);

  // If no description could be generated, return just the title
  if (!description) {
    return capitalizeFirst(cleaned);
  }

  return `**${title}** - ${description}`;
}

/**
 * Read changelog entries from a file (one per line; empty lines and "done" are skipped)
 */
function readChangelogEntriesFromFile(filePath) {
  const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(path.dirname(__dirname), filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Changelog file not found: ${resolved}`);
  }
  const content = fs.readFileSync(resolved, 'utf8');
  const entries = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && line.toLowerCase() !== 'done');
  if (entries.length === 0) {
    throw new Error(`No entries in changelog file: ${resolved}`);
  }
  log.success(`Loaded ${entries.length} changelog entries from ${path.basename(resolved)}`);
  return entries;
}

/**
 * Collect changelog entries from user (interactive) or from --changelog-file
 */
async function collectChangelogEntries(args) {
  const changelogFileIdx = args.indexOf('--changelog-file');
  if (changelogFileIdx !== -1 && args[changelogFileIdx + 1]) {
    return readChangelogEntriesFromFile(args[changelogFileIdx + 1]);
  }

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

  // Order: Features, Improvements, Bug Fixes, Breaking Changes, Documentation, Warning
  const order = [
    '🚀 New Features',
    '🔧 Improvements',
    '🐛 Bug Fixes',
    '⚠️ Breaking Changes',
    '📝 Documentation',
    '⚠️ Warning',
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
 * Check if tag already exists locally
 */
function tagExistsLocally(tag) {
  try {
    const result = run(`git tag -l "${tag}"`, { silent: true });
    return result.trim() === tag;
  } catch {
    return false;
  }
}

/**
 * Check if tag already exists on remote
 */
function tagExistsOnRemote(tag) {
  try {
    const result = run(`git ls-remote --tags origin "refs/tags/${tag}"`, { silent: true });
    return result.trim().length > 0;
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

  const existsLocally = tagExistsLocally(tag);
  const existsOnRemote = tagExistsOnRemote(tag);

  if (existsLocally && existsOnRemote) {
    log.warn(`Tag ${tag} already exists locally and on remote`);
    return { tag, alreadyOnRemote: true };
  }

  if (existsOnRemote && !existsLocally) {
    log.warn(`Tag ${tag} exists on remote but not locally - fetching it`);
    run(`git fetch origin tag ${tag}`, { silent: true });
    return { tag, alreadyOnRemote: true };
  }

  if (existsLocally && !existsOnRemote) {
    log.info(`Tag ${tag} exists locally but not on remote - will push it`);
    return { tag, alreadyOnRemote: false };
  }

  log.step(`Creating git tag: ${tag}`);
  run(`git tag -a ${tag} -m "Release ${version}"`);
  log.success(`Created tag: ${tag}`);

  return { tag, alreadyOnRemote: false };
}

/**
 * Push to GitHub
 */
function pushToGitHub(tag, alreadyOnRemote = false) {
  log.step('Pushing to GitHub...');

  try {
    run('git push origin HEAD');

    if (!alreadyOnRemote) {
      run(`git push origin ${tag}`);
      log.success('Pushed commits and tag to GitHub');
    } else {
      log.success('Pushed commits to GitHub (tag already exists on remote)');
    }
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

  // Collect changelog entries (from file if --changelog-file provided)
  log.step('Collecting changelog entries...');
  let entries = await collectChangelogEntries(args);

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
  const { tag, alreadyOnRemote } = createGitTag(version);

  // Push to GitHub
  if (!skipPush) {
    pushToGitHub(tag, alreadyOnRemote);

    // Create GitHub release (only if tag wasn't already on remote, or force it)
    // Extract just the changelog content for the release (without the header)
    const releaseChangelog = changelog.replace(/^## Version .+\n\n/, '');

    if (alreadyOnRemote) {
      log.warn(`Tag ${tag} already exists on remote - checking if release exists...`);
      // Check if release already exists
      try {
        run(`gh release view ${tag}`, { silent: true });
        log.warn(`Release ${tag} already exists on GitHub - skipping release creation`);
        log.info(`To update the release, delete it first: gh release delete ${tag}`);
      } catch {
        // Release doesn't exist, create it
        log.info('Release does not exist yet - creating it...');
        createGitHubRelease(version, releaseChangelog, isPrerelease);
      }
    } else {
      createGitHubRelease(version, releaseChangelog, isPrerelease);
    }
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
