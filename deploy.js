/**
 * Ultra Card Simple Deploy Script
 * Builds and deploys to Home Assistant via network share
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Your Home Assistant path (network mounted volume)
  targetPath: '/Volumes/config/www/community/Ultra-Card',
  // Source build directory
  sourceDir: path.join(__dirname, 'dist'),
};

// Function to check if target directory is accessible
function checkTargetPath() {
  try {
    // Check if the network volume is mounted
    if (!fs.existsSync('/Volumes/config')) {
      console.error('❌ Home Assistant network volume not mounted at /Volumes/config');
      console.error('Please mount your Home Assistant share first');
      return false;
    }

    // Create target directory if it doesn't exist
    if (!fs.existsSync(CONFIG.targetPath)) {
      console.log('📁 Creating target directory...');
      fs.mkdirSync(CONFIG.targetPath, { recursive: true });
    }

    return true;
  } catch (error) {
    console.error('❌ Cannot access target path:', error.message);
    return false;
  }
}

// Function to copy files
function copyFiles() {
  try {
    console.log('📋 Copying files...');

    // Use rsync for better file copying with exclusions
    // This automatically excludes .DS_Store files and other system files
    execSync(
      `rsync -av --delete --exclude='.DS_Store' --exclude='._*' --exclude='.Spotlight-V100' --exclude='.Trashes' "${CONFIG.sourceDir}/" "${CONFIG.targetPath}/"`,
      { stdio: 'inherit' }
    );

    console.log('✅ Files copied successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error copying files:', error.message);
    return false;
  }
}

// Function to build the project
function build() {
  try {
    console.log('🔨 Building Ultra Card...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed!');
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

// Main deploy function
function deploy() {
  console.log('🚀 Ultra Card Build & Deploy');
  console.log('=============================');

  // Step 1: Build
  if (!build()) {
    process.exit(1);
  }

  // Step 2: Check target path
  if (!checkTargetPath()) {
    process.exit(1);
  }

  // Step 3: Copy files
  if (!copyFiles()) {
    process.exit(1);
  }

  console.log('\n🎉 Deployment successful!');
  console.log(`📍 Deployed to: ${CONFIG.targetPath}`);
  console.log('\nNext steps:');
  console.log('1. Clear browser cache (Cmd+Shift+R)');
  console.log('2. Refresh Home Assistant frontend');
}

// Run deployment
deploy();
