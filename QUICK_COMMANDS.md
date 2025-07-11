# Quick Commands for GitHub Setup and Release

## 🏗️ Initial GitHub Setup
1. Create repository on GitHub: Ultra-Card (public)
2. Run these commands:

git init
git add -A
git commit -m "�� Initial commit - Ultra Card v1.0.0-alpha1"
git remote add origin https://github.com/YourUsername/Ultra-Card.git
git branch -M main
git push -u origin main

## 🚀 Create Alpha Release
npm run release 1.0.0-alpha1
git push origin main
git push origin v1.0.0-alpha1

## ✅ That's it! GitHub Actions will create the release automatically.

---
📖 Full guide: See RELEASE_GUIDE.md
🔧 Your release workflow is ready at: .github/workflows/release.yml
🎯 Version files synced: package.json and src/version.ts

