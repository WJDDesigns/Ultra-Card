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
  sourceFiles: ['dist/ultra-card.js', 'dist/ultra-card.js.LICENSE.txt'],
};

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

// Deploy files to target path
function deployFiles(targetPath) {
  try {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetPath)) {
      console.log(`  📁 Creating directory: ${targetPath}`);
      fs.mkdirSync(targetPath, { recursive: true });
    }

    // Copy files
    CONFIG.sourceFiles.forEach(file => {
      const sourcePath = path.resolve(__dirname, file);
      const targetFile = path.join(targetPath, path.basename(file));

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetFile);
        console.log(`  ✅ Copied: ${path.basename(file)}`);
      } else {
        console.log(`  ⚠️  Not found: ${file}`);
      }
    });

    return true;
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
    console.log('✨ Deployment complete! Refresh your Home Assistant dashboard to see changes.\n');
  } else {
    console.log('⚠️  No instances were successfully deployed to.\n');
    process.exit(1);
  }
}

// Run deployment
deploy().catch(error => {
  console.error('💥 Deployment error:', error.message);
  process.exit(1);
});
