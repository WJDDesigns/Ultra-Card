/**
 * Ultra Card Branch Deploy Script
 * Deploys a specific branch to a test directory in Home Assistant
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Your Home Assistant path (network mounted volume) - test directory
  targetPath: '/Volumes/config/www/community/Ultra-Card-Test',
  // Source build directory
  sourceDir: path.join(__dirname, 'dist'),
  // GitHub repo
  repo: 'https://github.com/WJDDesigns/Ultra-Card.git',
  // Temp directory for cloning
  tempDir: path.join(__dirname, 'temp-branch-deploy'),
};

// Get branch name from command line argument
const branchName = process.argv[2];
if (!branchName) {
  console.error('❌ Please specify a branch name');
  console.error('Usage: node deploy-branch.js <branch-name>');
  console.error('Example: node deploy-branch.js Background-Agent');
  process.exit(1);
}

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
      console.log('📁 Creating test target directory...');
      fs.mkdirSync(CONFIG.targetPath, { recursive: true });
    }

    return true;
  } catch (error) {
    console.error('❌ Cannot access target path:', error.message);
    return false;
  }
}

// Function to clean up temp directory
function cleanup() {
  try {
    if (fs.existsSync(CONFIG.tempDir)) {
      console.log('🧹 Cleaning up temp directory...');
      fs.rmSync(CONFIG.tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.warn('⚠️  Warning: Could not clean up temp directory:', error.message);
  }
}

// Function to clone and build branch
function cloneAndBuild() {
  try {
    // Clean up any existing temp directory
    cleanup();

    console.log(`📥 Cloning branch: ${branchName}...`);
    execSync(`git clone -b ${branchName} ${CONFIG.repo} ${CONFIG.tempDir}`, { stdio: 'inherit' });

    // Change to temp directory and build
    process.chdir(CONFIG.tempDir);

    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    console.log('🔨 Building branch...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('✅ Branch built successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error cloning/building branch:', error.message);
    return false;
  }
}

// Function to copy files
function copyFiles() {
  try {
    console.log('📋 Copying files from branch build...');

    const sourcePath = path.join(CONFIG.tempDir, 'dist');

    // Use rsync for better file copying with exclusions
    execSync(
      `rsync -av --delete --exclude='.DS_Store' --exclude='._*' --exclude='.Spotlight-V100' --exclude='.Trashes' "${sourcePath}/" "${CONFIG.targetPath}/"`,
      { stdio: 'inherit' }
    );

    console.log('✅ Files copied successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error copying files:', error.message);
    return false;
  }
}

// Main deploy function
function deploy() {
  const originalDir = process.cwd();

  try {
    console.log('🚀 Ultra Card Branch Deploy');
    console.log('============================');
    console.log(`🌿 Branch: ${branchName}`);
    console.log(`📍 Target: ${CONFIG.targetPath}`);
    console.log('');

    // Step 1: Check target path
    if (!checkTargetPath()) {
      process.exit(1);
    }

    // Step 2: Clone and build branch
    if (!cloneAndBuild()) {
      process.exit(1);
    }

    // Step 3: Copy files
    if (!copyFiles()) {
      process.exit(1);
    }

    console.log('\n🎉 Branch deployment successful!');
    console.log(`📍 Deployed to: ${CONFIG.targetPath}`);
    console.log(`🌿 Branch: ${branchName}`);
    console.log('\nNext steps:');
    console.log('1. Update your Lovelace card to point to Ultra-Card-Test');
    console.log('2. Clear browser cache (Cmd+Shift+R)');
    console.log('3. Refresh Home Assistant frontend');
    console.log('\nTo switch back to main version:');
    console.log('   Change your card back to Ultra-Card in Lovelace');
  } finally {
    // Always return to original directory and cleanup
    process.chdir(originalDir);
    cleanup();
  }
}

// Run deployment
deploy();
