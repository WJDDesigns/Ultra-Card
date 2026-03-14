#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
  sourceFiles: [
    'dist/ultra-card.js',
    'dist/ultra-card.js.LICENSE.txt',
    'dist/ultra-card-panel.js',
    'dist/ultra-card-panel.js.LICENSE.txt',
  ],
  // The integration serves the panel from its own www/ directory.
  // These extra copies ensure the sidebar panel is always up to date.
  integrationPanelCopies: [
    '/Volumes/config/custom_components/ultra_card_pro_cloud/www/ultra-card-panel.js',
    '/Volumes/config/custom_components/ultra_card_pro_cloud/www/ultra-card-panel.js.LICENSE.txt',
  ],
};

function getChunkFiles() {
  const distDir = path.resolve(__dirname, 'dist');
  if (!fs.existsSync(distDir)) return [];
  return fs
    .readdirSync(distDir)
    .filter(file => file.startsWith('uc-') && (file.endsWith('.js') || file.endsWith('.js.LICENSE.txt')))
    .map(file => `dist/${file}`);
}

console.log('🚀 Ultra Card Deployment Script\n');

// Check if volume is mounted
function isVolumeMounted() {
  try {
    return fs.existsSync('/Volumes/config');
  } catch (error) {
    return false;
  }
}

// Check if HA instance is reachable
function checkInstance(url) {
  try {
    execSync(`curl -s --connect-timeout 2 "${url}" > /dev/null 2>&1`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Count files in directory
function countFiles(dir) {
  let count = 0;
  try {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        count += countFiles(fullPath);
      } else {
        count++;
      }
    });
  } catch (error) {
    // Directory doesn't exist or is inaccessible
    return 0;
  }

  return count;
}

// Deploy files to target path
function deployFiles(targetPath) {
  try {
    // Check if source files exist and get their sizes
    console.log(`  🔍 Verifying source files...`);
    let sourceFilesValid = true;
    [...CONFIG.sourceFiles, ...getChunkFiles()].forEach(file => {
      const sourcePath = path.resolve(__dirname, file);
      if (fs.existsSync(sourcePath)) {
        const stats = fs.statSync(sourcePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`  ✓ Found: ${path.basename(file)} (${sizeMB} MB)`);
      } else {
        console.log(`  ✗ Missing: ${file}`);
        sourceFilesValid = false;
      }
    });

    if (!sourceFilesValid) {
      console.log(`  ⚠️  Some source files are missing. Run 'npm run build' first!`);
      return false;
    }

    // Remove old version if exists (ensures clean deployment)
    if (fs.existsSync(targetPath)) {
      console.log(`  🗑️  Removing old version...`);
      try {
        // Try Node.js method first
        fs.rmSync(targetPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      } catch (error) {
        // Fallback to system rm command for stubborn files
        console.log(`  🔧 Using system rm command...`);
        execSync(`rm -rf "${targetPath}"`, { stdio: 'ignore' });
      }
      // Small delay to ensure filesystem sync
      execSync('sleep 0.5');
    }

    // Create target directory
    console.log(`  📁 Creating directory: ${targetPath}`);
    fs.mkdirSync(targetPath, { recursive: true });

    // Copy files
    console.log(`  📦 Copying files...`);
    let copiedCount = 0;
    [...CONFIG.sourceFiles, ...getChunkFiles()].forEach(file => {
      const sourcePath = path.resolve(__dirname, file);
      const targetFile = path.join(targetPath, path.basename(file));

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetFile);
        const stats = fs.statSync(targetFile);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`  ✅ Copied: ${path.basename(file)} (${sizeMB} MB)`);
        copiedCount++;
      } else {
        console.log(`  ⚠️  Not found: ${file}`);
      }
    });

    // Verify deployment by checking file sizes
    console.log(`  🔍 Verifying deployment...`);
    let allFilesValid = true;
    [...CONFIG.sourceFiles, ...getChunkFiles()].forEach(file => {
      const targetFile = path.join(targetPath, path.basename(file));
      if (fs.existsSync(targetFile)) {
        const stats = fs.statSync(targetFile);
        if (stats.size === 0) {
          console.log(`  ⚠️  Warning: ${path.basename(file)} is empty!`);
          allFilesValid = false;
        }
      } else {
        console.log(`  ⚠️  Warning: ${path.basename(file)} not found in target!`);
        allFilesValid = false;
      }
    });

    if (!allFilesValid) {
      console.log(`  ⚠️  Deployment verification failed!`);
      return false;
    }

    const fileCount = countFiles(targetPath);
    console.log(`  ✅ Deployed ${fileCount} file(s)`);

    return copiedCount > 0;
  } catch (error) {
    console.error(`  ❌ Deployment failed: ${error.message}`);
    return false;
  }
}

// Main deployment process
async function deploy() {
  // Check if volume is mounted
  if (!isVolumeMounted()) {
    console.log('❌ Config volume not mounted at /Volumes/config');
    console.log('   Please mount your Home Assistant config volume first.\n');
    process.exit(1);
  }

  console.log('✅ Config volume is mounted\n');

  // Check which instances are available
  console.log('🔍 Checking Home Assistant instances...\n');

  let deployed = false;
  for (const instance of CONFIG.instances) {
    console.log(`📡 ${instance.name} (${instance.url})`);

    const isReachable = checkInstance(instance.url);
    if (isReachable) {
      console.log('  ✅ Instance is reachable');
      console.log('  📦 Deploying files...');

      if (deployFiles(instance.path)) {
        console.log('  🎉 Deployment successful!\n');
        deployed = true;
      } else {
        console.log('  ❌ Deployment failed\n');
      }
    } else {
      console.log('  ⚠️  Instance not reachable (skipping)\n');
    }
  }

  if (deployed) {
    console.log('✨ Deployment complete!\n');
    console.log('🔄 To see changes in Home Assistant:');
    console.log('   1. Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+F5 on Windows)');
    console.log('   2. Or open DevTools → Application → Clear Storage → Clear site data');
    console.log('   3. Refresh your Home Assistant dashboard\n');
  } else {
    console.log('⚠️  No instances were successfully deployed to.\n');
    process.exit(1);
  }

  // Copy panel JS to integration www/ directories so the sidebar panel is served correctly.
  const panelSrc = path.resolve(__dirname, 'dist/ultra-card-panel.js');
  if (fs.existsSync(panelSrc) && CONFIG.integrationPanelCopies?.length) {
    console.log('🔌 Updating integration panel copies...');
    const chunkFiles = getChunkFiles().map(file => path.resolve(__dirname, file));
    for (const dest of CONFIG.integrationPanelCopies) {
      const destDir = path.dirname(dest);
      if (fs.existsSync(destDir)) {
        try {
          const sourcePath = path.resolve(__dirname, 'dist', path.basename(dest));
          if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, dest);
            const sizeMB = (fs.statSync(dest).size / (1024 * 1024)).toFixed(2);
            console.log(`  ✅ Copied panel asset → ${dest} (${sizeMB} MB)`);
          }
          chunkFiles.forEach(chunkPath => {
            fs.copyFileSync(chunkPath, path.join(destDir, path.basename(chunkPath)));
          });
        } catch (err) {
          console.warn(`  ⚠️  Could not copy to ${dest}: ${err.message}`);
        }
      } else {
        console.log(`  ℹ️  Integration path not found, skipping: ${dest}`);
      }
    }
    console.log('');
  }
}

// Run deployment
deploy().catch(error => {
  console.error('💥 Deployment error:', error.message);
  process.exit(1);
});
