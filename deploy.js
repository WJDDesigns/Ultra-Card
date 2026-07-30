#!/usr/bin/env node
/**
 * Deploy Ultra Card build artifacts to mounted Home Assistant config volumes.
 *
 * Fast path:
 * - Prefer rsync (incremental; much faster on SMB)
 * - Otherwise overwrite in place + prune stale uc-* (never wipe the whole folder)
 * - Quiet logging (summary only)
 *
 * Also syncs the sibling Ultra Card Connect www/ (panel + chunks + panel-assets.json).
 */

const { execSync, spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, 'dist');

const CONFIG = {
  instances: [
    {
      name: 'HA Instance 1',
      url: 'http://192.168.4.244:8123/',
      path: '/Volumes/config/www/community/Ultra-Card',
    },
    {
      name: 'HA Instance 2',
      url: 'http://192.168.4.55:8123/',
      path: '/Volumes/config/www/community/Ultra-Card',
    },
  ],
  // Live HA integration www (sidebar Hub assets)
  integrationWwwPaths: [
    '/Volumes/config/custom_components/ultra_card_pro_cloud/www',
  ],
  // Sibling Connect git repo (for shipping); override with INTEGRATION_WWW_PATH
  connectRepoWww:
    process.env.INTEGRATION_WWW_PATH ||
    path.join(ROOT, '..', 'Ultra Card Pro Cloud', 'custom_components', 'ultra_card_pro_cloud', 'www'),
  // Sibling Connect repo integration source (Python + www) → deployed to live HA
  connectRepoIntegration: path.join(
    ROOT,
    '..',
    'Ultra Card Pro Cloud',
    'custom_components',
    'ultra_card_pro_cloud'
  ),
  // Live HA integration directory on the mounted config volume
  haIntegrationPath: '/Volumes/config/custom_components/ultra_card_pro_cloud',
};

const CORE_FILES = [
  'ultra-card.js',
  'ultra-card.js.LICENSE.txt',
  'ultra-card-panel.js',
  'ultra-card-panel.js.LICENSE.txt',
];

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function listDistAssets() {
  if (!fs.existsSync(DIST_DIR)) return { core: [], chunks: [], all: [] };
  const names = fs.readdirSync(DIST_DIR);
  const core = CORE_FILES.filter(f => fs.existsSync(path.join(DIST_DIR, f)));
  const chunks = names.filter(
    f => f.startsWith('uc-') && (f.endsWith('.js') || f.endsWith('.js.LICENSE.txt'))
  );
  return { core, chunks, all: [...core, ...chunks] };
}

function hasRsync() {
  try {
    execSync('command -v rsync', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isVolumeMounted() {
  return fs.existsSync('/Volumes/config');
}

function checkInstance(url) {
  try {
    execSync(`curl -s --connect-timeout 1 --max-time 1 "${url}" > /dev/null 2>&1`, {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Sync selected files from dist/ into destDir.
 * @param {'card'|'panel'} mode card = full Ultra Card assets; panel = panel + uc-* only
 */
function syncDistToDir(destDir, mode = 'card', { writeManifest = false } = {}) {
  const started = Date.now();
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error(`Missing dist/. Run npm run build first.`);
  }
  fs.mkdirSync(destDir, { recursive: true });

  const { core, chunks, all } = listDistAssets();
  const wanted =
    mode === 'panel'
      ? all.filter(f => f === 'ultra-card-panel.js' || f === 'ultra-card-panel.js.LICENSE.txt' || f.startsWith('uc-'))
      : all;

  if (!wanted.includes('ultra-card-panel.js') && mode === 'panel') {
    throw new Error('dist/ultra-card-panel.js missing');
  }
  if (mode === 'card' && !wanted.includes('ultra-card.js')) {
    throw new Error('dist/ultra-card.js missing');
  }

  let method = 'copy';
  if (hasRsync()) {
    // Incremental copy only — never --delete here (Connect www/ also holds docs/).
    const includes =
      mode === 'panel'
        ? [
            '--include=ultra-card-panel.js',
            '--include=ultra-card-panel.js.LICENSE.txt',
            '--include=uc-*.js',
            '--include=uc-*.js.LICENSE.txt',
            '--exclude=*',
          ]
        : [
            '--include=ultra-card.js',
            '--include=ultra-card.js.LICENSE.txt',
            '--include=ultra-card-panel.js',
            '--include=ultra-card-panel.js.LICENSE.txt',
            '--include=uc-*.js',
            '--include=uc-*.js.LICENSE.txt',
            '--exclude=*',
          ];
    const result = spawnSync(
      'rsync',
      ['-a', ...includes, `${DIST_DIR}/`, `${destDir}/`],
      { encoding: 'utf8' }
    );
    if (result.status === 0) {
      method = 'rsync';
      // Prune stale managed assets only (safe alongside docs/ and other files)
      pruneManaged(destDir, wanted);
    } else {
      method = 'copy-fallback';
      copyAndPrune(destDir, wanted);
    }
  } else {
    copyAndPrune(destDir, wanted);
  }

  if (writeManifest) {
    writePanelManifest(destDir, wanted.filter(f => f === 'ultra-card-panel.js' || f.startsWith('uc-')));
  }

  const ms = Date.now() - started;
  return { count: wanted.length, method, ms };
}

function pruneManaged(destDir, wantedNames) {
  const wanted = new Set(wantedNames);
  if (!fs.existsSync(destDir)) return;
  for (const name of fs.readdirSync(destDir)) {
    // HACS writes precompressed .gz siblings; HA serves those to any gzip-accepting
    // client (i.e. every browser) INSTEAD of our freshly deployed .js. Always remove
    // them, or browsers keep loading the stale HACS build no matter what we deploy.
    const staleGzip =
      name.endsWith('.js.gz') &&
      (name.startsWith('ultra-card') || name.startsWith('uc-'));
    const managed =
      name === 'ultra-card.js' ||
      name === 'ultra-card.js.LICENSE.txt' ||
      name === 'ultra-card-panel.js' ||
      name === 'ultra-card-panel.js.LICENSE.txt' ||
      name === 'panel-assets.json' ||
      (name.startsWith('uc-') && (name.endsWith('.js') || name.endsWith('.js.LICENSE.txt')));
    // Keep panel-assets.json; rewrite happens after sync when requested
    if (name === 'panel-assets.json') continue;
    if (staleGzip || (managed && !wanted.has(name))) {
      fs.unlinkSync(path.join(destDir, name));
    }
  }
}

function copyAndPrune(destDir, wantedNames) {
  for (const name of wantedNames) {
    fs.copyFileSync(path.join(DIST_DIR, name), path.join(destDir, name));
  }
  pruneManaged(destDir, wantedNames);
}

function writePanelManifest(destDir, assetNames) {
  const files = {};
  for (const name of [...assetNames].sort()) {
    const full = path.join(destDir, name);
    if (fs.existsSync(full)) files[name] = sha256File(full);
  }
  let ultraCardVersion = 'unknown';
  try {
    ultraCardVersion = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
  } catch {
    /* ignore */
  }
  let commit = null;
  try {
    commit = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    /* ignore */
  }
  fs.writeFileSync(
    path.join(destDir, 'panel-assets.json'),
    JSON.stringify(
      {
        synced_at: new Date().toISOString(),
        ultra_card_version: ultraCardVersion,
        ultra_card_commit: commit,
        files,
      },
      null,
      2
    ) + '\n'
  );
}

function syncConnectRepoWww() {
  // Prefer the dedicated sync script (prune + panel-assets.json) for the git repo.
  const syncScript = path.join(ROOT, 'scripts', 'sync-panel-to-integration.js');
  if (fs.existsSync(syncScript)) {
    const started = Date.now();
    const result = spawnSync(process.execPath, [syncScript], {
      cwd: ROOT,
      encoding: 'utf8',
      env: process.env,
    });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status !== 0) {
      console.warn('⚠️  sync:panel failed — Connect repo www may be stale');
      return null;
    }
    console.log(`✅ Connect repo panel sync finished (${Date.now() - started}ms)`);
    return { ms: Date.now() - started };
  }

  const dest = CONFIG.connectRepoWww;
  if (!fs.existsSync(path.dirname(dest))) {
    console.log(`ℹ️  Connect repo www not found, skipping git sync: ${dest}`);
    return null;
  }
  fs.mkdirSync(dest, { recursive: true });
  const result = syncDistToDir(dest, 'panel', { writeManifest: true });
  console.log(
    `✅ Synced Connect repo www (${result.count} files via ${result.method}, ${result.ms}ms)`
  );
  return result;
}

function readManifestVersion(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')).version || null;
  } catch {
    return null;
  }
}

function copyDirRecursive(src, dest, skip) {
  fs.mkdirSync(dest, { recursive: true });
  const srcEntries = fs.readdirSync(src, { withFileTypes: true });
  const srcNames = new Set(srcEntries.map(e => e.name));

  // Prune destination entries that no longer exist in source
  for (const entry of fs.readdirSync(dest, { withFileTypes: true })) {
    if (skip(entry.name)) continue;
    if (!srcNames.has(entry.name)) {
      fs.rmSync(path.join(dest, entry.name), { recursive: true, force: true });
    }
  }

  for (const entry of srcEntries) {
    if (skip(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(from, to, skip);
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

/**
 * Deploy the full Connect integration (Python + www) from the sibling repo
 * to the live HA custom_components directory. Returns info or null if skipped.
 */
function deployConnectIntegration() {
  const src = CONFIG.connectRepoIntegration;
  const dest = CONFIG.haIntegrationPath;
  const started = Date.now();

  if (!fs.existsSync(path.join(src, 'manifest.json'))) {
    console.log(`  ℹ️  Connect repo not found, skipping integration deploy: ${src}`);
    return null;
  }
  if (!fs.existsSync(path.dirname(dest))) {
    console.log(`  ℹ️  HA custom_components not available: ${path.dirname(dest)}`);
    return null;
  }

  const newVersion = readManifestVersion(src);
  const oldVersion = readManifestVersion(dest);
  let pythonChanged = oldVersion !== newVersion;

  if (hasRsync()) {
    const result = spawnSync(
      'rsync',
      [
        '-ai',
        '--inplace',
        '--delete',
        '--exclude',
        '__pycache__',
        '--exclude',
        '*.pyc',
        '--exclude',
        '.DS_Store',
        `${src}/`,
        `${dest}/`,
      ],
      { encoding: 'utf8' }
    );
    if (result.status !== 0) {
      throw new Error(`rsync failed: ${result.stderr || result.stdout}`);
    }
    const changed = (result.stdout || '')
      .split('\n')
      .filter(l => l.trim() && !l.startsWith('.d..t'));
    if (changed.some(l => l.includes('.py'))) pythonChanged = true;
  } else {
    copyDirRecursive(
      src,
      dest,
      name => name === '__pycache__' || name.endsWith('.pyc') || name === '.DS_Store'
    );
  }

  return {
    ms: Date.now() - started,
    oldVersion,
    newVersion,
    pythonChanged,
  };
}

function deploy() {
  const t0 = Date.now();
  console.log('🚀 Ultra Card Deployment\n');

  if (!fs.existsSync(path.join(DIST_DIR, 'ultra-card.js'))) {
    console.error('❌ Missing dist/ultra-card.js. Run npm run build first.');
    process.exit(1);
  }

  // Always refresh sibling Connect www + panel-assets.json (shipping source of truth)
  console.log('🔌 Syncing Ultra Card Connect www/…');
  syncConnectRepoWww();
  console.log('');

  if (!isVolumeMounted()) {
    console.log('⚠️  /Volumes/config not mounted — skipped live HA deploy.');
    console.log(`✨ Done in ${Date.now() - t0}ms (Connect repo sync only)\n`);
    return;
  }

  console.log('✅ Config volume mounted\n');

  // Deduplicate target paths (both instances may share the same SMB folder)
  const seenPaths = new Set();
  let deployed = false;

  for (const instance of CONFIG.instances) {
    if (seenPaths.has(instance.path)) {
      console.log(`📡 ${instance.name} — same path already deployed, skipping`);
      continue;
    }

    console.log(`📡 ${instance.name} (${instance.url})`);
    // If the path exists on the mount, deploy even if HTTP probe fails (HA can be slow)
    const pathReady = fs.existsSync(path.dirname(instance.path)) || fs.existsSync(instance.path);
    const reachable = checkInstance(instance.url);
    if (!pathReady && !reachable) {
      console.log('  ⚠️  Path missing and instance unreachable — skipping\n');
      continue;
    }
    if (!reachable) {
      console.log('  ⚠️  HTTP probe failed; deploying via mounted path anyway');
    }

    try {
      const result = syncDistToDir(instance.path, 'card', { writeManifest: false });
      seenPaths.add(instance.path);
      console.log(
        `  ✅ Deployed ${result.count} files via ${result.method} (${result.ms}ms)\n`
      );
      deployed = true;
    } catch (err) {
      console.error(`  ❌ ${err.message}\n`);
    }
  }

  // Deploy the full Connect integration (Python + www) from the sibling repo
  console.log('🔌 Deploying Ultra Card Connect integration to HA…');
  let connectResult = null;
  try {
    connectResult = deployConnectIntegration();
    if (connectResult) {
      const versionNote =
        connectResult.oldVersion && connectResult.oldVersion !== connectResult.newVersion
          ? ` (${connectResult.oldVersion} → ${connectResult.newVersion})`
          : ` (v${connectResult.newVersion})`;
      console.log(`  ✅ ${CONFIG.haIntegrationPath}${versionNote}, ${connectResult.ms}ms`);
      deployed = true;
    }
  } catch (err) {
    console.warn(`  ⚠️  Connect integration deploy failed: ${err.message}`);
  }

  // Fallback: refresh only the live integration www when the full deploy was skipped
  if (!connectResult) {
    console.log('🔌 Updating live integration www/ only…');
    for (const wwwPath of CONFIG.integrationWwwPaths) {
      if (!fs.existsSync(path.dirname(wwwPath)) && !fs.existsSync(wwwPath)) {
        console.log(`  ℹ️  Skipping missing path: ${wwwPath}`);
        continue;
      }
      try {
        const result = syncDistToDir(wwwPath, 'panel', { writeManifest: true });
        console.log(
          `  ✅ ${wwwPath} (${result.count} files via ${result.method}, ${result.ms}ms)`
        );
        deployed = true;
      } catch (err) {
        console.warn(`  ⚠️  ${wwwPath}: ${err.message}`);
      }
    }
  }

  console.log(`\n✨ Done in ${Date.now() - t0}ms`);
  if (deployed) {
    console.log('🔄 Hard-refresh HA (Cmd+Shift+R) to load the new assets.');
    if (connectResult && connectResult.pythonChanged) {
      console.log(
        '♻️  Connect Python changed — restart Home Assistant to load the new integration.'
      );
    }
    console.log('');
  } else {
    console.log('⚠️  No live HA targets were updated.\n');
    process.exitCode = 1;
  }
}

deploy();
