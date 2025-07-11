# Ultra Card - GitHub Setup and Release Guide

## 🚀 Getting Your Project on GitHub

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click "New repository" (green button)
3. Set repository name: `Ultra-Card`
4. Set description: `Ultra Card - A modular card builder for Home Assistant`
5. Make it **Public** (required for HACS)
6. **Don't** initialize with README (we already have one)
7. Click "Create repository"

### Step 2: Connect Local Project to GitHub

Open terminal in your Ultra Card directory and run:

```bash
# Initialize git if not already done
git init

# Add all files
git add -A

# Create initial commit
git commit -m "🎉 Initial commit - Ultra Card v1.0.0-alpha1"

# Add your GitHub repository as origin
git remote add origin https://github.com/YourUsername/Ultra-Card.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YourUsername` with your actual GitHub username!**

## 🔖 Creating Your Alpha Release

### Option 1: Using the Release Script (Recommended)

```bash
# Create and push the alpha release
npm run release 1.0.0-alpha1

# Push the changes and tag
git push origin main
git push origin v1.0.0-alpha1
```

### Option 2: Manual Release Creation

If you prefer to do it manually:

```bash
# Make sure everything is committed
git add -A
git commit -m "🔖 Release v1.0.0-alpha1"

# Create and push tag
git tag v1.0.0-alpha1
git push origin main
git push origin v1.0.0-alpha1
```

## 🤖 GitHub Actions Will Handle the Rest

Once you push the tag, GitHub Actions will automatically:

1. ✅ Build the project
2. ✅ Create a release with proper assets
3. ✅ Mark it as a prerelease (because it contains "alpha")
4. ✅ Generate release notes
5. ✅ Create downloadable zip file

## 📦 HACS Integration

After your repository is public with a release:

### For Users to Add Your Card:

1. In Home Assistant, go to HACS
2. Click "Frontend"
3. Click the menu (⋮) and select "Custom repositories"
4. Add: `https://github.com/YourUsername/Ultra-Card`
5. Category: "Lovelace"
6. Click "Add"

### For HACS Default Store (Optional - For Later):

To get added to HACS default store, you'll need:

1. At least one stable release (not alpha/beta)
2. Submit a PR to [HACS Default](https://github.com/hacs/default)

## 🔄 Future Releases

### For Next Alpha Version:

```bash
npm run release 1.0.0-alpha2
git push origin main
git push origin v1.0.0-alpha2
```

### For Beta Release:

```bash
npm run release 1.0.0-beta1
git push origin main
git push origin v1.0.0-beta1
```

### For Stable Release:

```bash
npm run release 1.0.0
git push origin main
git push origin v1.0.0
```

## 🎯 Repository Settings

### Recommended Settings:

1. **General**:

   - Enable "Issues" for bug reports
   - Enable "Wiki" for documentation
   - Enable "Discussions" for community

2. **Security**:

   - Enable "Dependency graph"
   - Enable "Dependabot security updates"

3. **Pages** (Optional):
   - Enable GitHub Pages for documentation site

## 📋 Post-Release Checklist

After your first release:

- [ ] ✅ Repository is public
- [ ] ✅ Release v1.0.0-alpha1 is created
- [ ] ✅ ultra-card.js is attached to release
- [ ] ✅ ZIP file is created
- [ ] ✅ Release is marked as prerelease
- [ ] ✅ Test installation via HACS
- [ ] ✅ Update social media/forums about release
- [ ] ✅ Consider creating demo/screenshots

## 🛠️ Troubleshooting

### "Permission denied" when pushing:

```bash
# Use personal access token instead of password
# Or set up SSH keys
```

### "Tag already exists":

```bash
# Delete local tag and recreate
git tag -d v1.0.0-alpha1
git tag v1.0.0-alpha1
git push origin v1.0.0-alpha1
```

### GitHub Action fails:

- Check the Actions tab in your repository
- Most common issues are missing Node.js dependencies
- The workflow is already configured correctly

## 🎉 Success!

Once everything is set up, your Ultra Card will be:

- ✅ Available on GitHub
- ✅ Installable via HACS
- ✅ Automatically building releases
- ✅ Ready for community use

---

**Need help?** Create an issue in your repository or reach out to the community!
