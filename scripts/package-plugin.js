#!/usr/bin/env node
/**
 * Packages the WordPress plugin into ultra-card-integration.zip.
 *
 * Run this after every plugin edit so the zip is always uploadable as-is:
 *
 *   npm run plugin:zip                 bump the patch version and repackage
 *   npm run plugin:zip -- --version 1.4.0
 *   npm run plugin:zip -- --no-bump    repackage at the current version
 *
 * Two things here are load-bearing and easy to break:
 *
 * 1. The archive must stay flat (includes/, templates/ and the main file at the
 *    root, with no wrapping folder). WordPress derives the install directory
 *    from the zip *filename* when an archive has multiple root entries, so
 *    `ultra-card-integration.zip` is what lands it in plugins/ultra-card-integration/.
 *    Renaming the zip silently installs the plugin to the wrong directory.
 *
 * 2. `*.php` is gitignored repo-wide, so the plugin source has no git history.
 *    The committed zip is the only record of previous versions — commit it
 *    alongside the change it packages.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PLUGIN_DIR = path.join(ROOT, 'ultra-card-integration');
const MAIN_FILE = 'ultra-card-integration.php';
const ZIP_NAME = 'ultra-card-integration.zip';
const ZIP_PATH = path.join(ROOT, ZIP_NAME);

const HEADER_RE = /^(\s*\*\s*Version:\s*)(\d+\.\d+\.\d+)\s*$/m;
const CONSTANT_RE = /(define\('ULTRA_CARD_INTEGRATION_VERSION',\s*')(\d+\.\d+\.\d+)('\))/;

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { bump: true, version: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--no-bump') args.bump = false;
    else if (argv[i] === '--version') {
      args.version = argv[++i];
      if (!/^\d+\.\d+\.\d+$/.test(args.version || '')) fail('--version expects x.y.z');
    }
  }
  return args;
}

/** Writes `version` into both the plugin header and the version constant. */
function setVersion(mainPath, version) {
  const before = fs.readFileSync(mainPath, 'utf8');
  if (!HEADER_RE.test(before)) fail(`no "* Version:" header found in ${MAIN_FILE}`);
  if (!CONSTANT_RE.test(before)) fail(`no ULTRA_CARD_INTEGRATION_VERSION define found in ${MAIN_FILE}`);
  const after = before
    .replace(HEADER_RE, `$1${version}`)
    .replace(CONSTANT_RE, `$1${version}$3`);
  if (after !== before) fs.writeFileSync(mainPath, after);
}

function readVersion(mainPath) {
  const src = fs.readFileSync(mainPath, 'utf8');
  const header = src.match(HEADER_RE);
  const constant = src.match(CONSTANT_RE);
  if (!header || !constant) fail(`could not read the version from ${MAIN_FILE}`);
  if (header[2] !== constant[2]) {
    fail(`version mismatch in ${MAIN_FILE}: header ${header[2]} vs constant ${constant[2]}`);
  }
  return header[2];
}

/**
 * The repo keeps a second copy of the plugin at its root. Refresh it so the two
 * never drift, but only for files that already exist there — this should mirror,
 * not create a new tree.
 */
function syncRootMirror(entries) {
  const synced = [];
  for (const entry of entries) {
    const target = path.join(ROOT, entry);
    if (!fs.existsSync(target)) continue;
    fs.rmSync(target, { recursive: true, force: true });
    fs.cpSync(path.join(PLUGIN_DIR, entry), target, { recursive: true });
    synced.push(entry);
  }
  return synced;
}

function verifyArchive(version) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uc-plugin-'));
  try {
    execFileSync('unzip', ['-q', ZIP_PATH, '-d', tmp]);

    // Catches a stale archive: rebuilt from scratch, so this also proves no
    // deleted file lingered and no edit was left out.
    try {
      execFileSync('diff', ['-r', tmp, PLUGIN_DIR]);
    } catch {
      fail('archive contents differ from ultra-card-integration/ — packaging is stale');
    }

    if (readVersion(path.join(tmp, MAIN_FILE)) !== version) {
      fail(`archive reports the wrong version (expected ${version})`);
    }

    let linted = 0;
    const phpFiles = [];
    const walk = dir => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith('.php')) phpFiles.push(p);
      }
    };
    walk(tmp);
    for (const file of phpFiles) {
      try {
        execFileSync('php', ['-l', file], { stdio: 'pipe' });
        linted++;
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.warn('  ! php not found on PATH — skipped syntax checks');
          break;
        }
        fail(`syntax error in ${path.relative(tmp, file)}\n${err.stdout || ''}`);
      }
    }
    return { fileCount: phpFiles.length, linted };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(PLUGIN_DIR)) fail(`missing plugin directory: ${PLUGIN_DIR}`);

  const mainPath = path.join(PLUGIN_DIR, MAIN_FILE);
  const current = readVersion(mainPath);

  let version = current;
  if (args.version) {
    version = args.version;
  } else if (args.bump) {
    const [major, minor, patch] = current.split('.').map(Number);
    version = `${major}.${minor}.${patch + 1}`;
  }
  setVersion(mainPath, version);

  const entries = fs.readdirSync(PLUGIN_DIR).sort();
  const synced = syncRootMirror(entries);

  // Rebuilt from scratch: `zip` only adds and updates, so refreshing an
  // existing archive would keep files that have since been deleted.
  fs.rmSync(ZIP_PATH, { force: true });
  execFileSync('zip', ['-q', '-r', '-X', ZIP_PATH, ...entries], { cwd: PLUGIN_DIR });

  const { fileCount, linted } = verifyArchive(version);
  const kb = Math.round(fs.statSync(ZIP_PATH).size / 1024);

  console.log(`\n✓ ${ZIP_NAME} — v${version}${version === current ? '' : ` (was ${current})`}`);
  console.log(`  ${kb} KB, flat layout, matches ultra-card-integration/`);
  console.log(`  ${linted}/${fileCount} PHP files pass syntax checks`);
  if (synced.length) console.log(`  root mirror synced: ${synced.join(', ')}`);
  console.log(`\n  Upload via Plugins → Add New → Upload Plugin ("Replace current with uploaded").`);
  console.log(`  Commit the zip — it is the only version history for the gitignored PHP.\n`);
}

main();
