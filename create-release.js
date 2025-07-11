#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get version from command line argument
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Usage: node create-release.js <version>');
  console.error('Example: node create-release.js 1.0.0-alpha2');
  console.error('Example: node create-release.js 1.0.0-beta1');
  console.error('Example: node create-release.js 1.0.0');
  process.exit(1);
}

// Validate version format
const versionRegex = /^\d+\.\d+\.\d+(-\w+\d*)?$/;
if (!versionRegex.test(newVersion)) {
  console.error('Invalid version format. Use semantic versioning (e.g., 1.0.0, 1.0.0-alpha1)');
  process.exit(1);
}

console.log(`🚀 Creating release for version: ${newVersion}`);

try {
  // Update version.ts
  const versionTsPath = path.join(__dirname, 'src', 'version.ts');
  const versionTsContent = `/**
 * Ultra Card Version
 * This is the single source of truth for version information
 */
export const VERSION = '${newVersion}';
`;
  fs.writeFileSync(versionTsPath, versionTsContent);
  console.log('✅ Updated src/version.ts');

  // Update package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated package.json');

  // Run prebuild to update other files
  console.log('🔧 Running prebuild...');
  execSync('npm run prebuild', { stdio: 'inherit' });

  // Stage changes
  console.log('📝 Staging changes...');
  execSync('git add -A', { stdio: 'inherit' });

  // Commit changes
  console.log('💾 Committing changes...');
  execSync(`git commit -m "🔖 Release v${newVersion}"`, { stdio: 'inherit' });

  // Create tag
  console.log('🏷️ Creating tag...');
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });

  console.log(`\n🎉 Release v${newVersion} is ready!`);
  console.log('\nNext steps:');
  console.log('1. Push changes: git push origin main');
  console.log(`2. Push tag: git push origin v${newVersion}`);
  console.log('3. The GitHub Action will automatically create the release');
} catch (error) {
  console.error('❌ Error creating release:', error.message);
  process.exit(1);
}
