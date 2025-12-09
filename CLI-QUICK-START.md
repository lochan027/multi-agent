# 🎯 CLI Deployment - Quick Reference

## 🚀 One-Time Setup (Run First)

```powershell
# Run the automated setup script
.\setup.ps1
```

This will:
- ✅ Check Node.js version
- ✅ Install Netlify CLI
- ✅ Install all dependencies
- ✅ Login to Netlify
- ✅ Create or link site
- ✅ Set environment variables (optional)

---

## 📦 Quick Commands

### Deploy to Production
```powershell
.\deploy.ps1
```

### Test Locally
```powershell
.\deploy.ps1 -Dev
# Opens http://localhost:8888
```

### Deploy Draft (Testing)
```powershell
.\deploy.ps1 -Draft
# Gets a preview URL
```

### Create New Site
```powershell
.\deploy.ps1 -Init
```

---

## 📋 NPM Scripts (Alternative)

```powershell
# Local development
npm run netlify:dev

# Build frontend
npm run netlify:build

# Deploy to production
npm run deploy:full

# Or deploy manually
npm run netlify:build
npm run netlify:deploy:prod

# Check status
npm run netlify:status

# Open site
npm run netlify:open

# View logs
npm run netlify:logs
```

---

## 🔧 Manual CLI Commands

```powershell
# Login
netlify login

# Initialize new site
netlify init

# Link existing site
netlify link

# Start dev server
netlify dev

# Deploy production
netlify deploy --prod --dir=frontend/dist --functions=netlify/functions

# Open site
netlify open:site

# Check status
netlify status

# View logs
netlify logs
```

---

## 🎬 Complete Workflow

### First Time Setup
```powershell
# 1. Run setup script
.\setup.ps1

# 2. Test locally
.\deploy.ps1 -Dev

# 3. Deploy to production
.\deploy.ps1
```

### Daily Development
```powershell
# Make changes to code...

# Test locally
.\deploy.ps1 -Dev

# Deploy when ready
.\deploy.ps1
```

---

## 🐛 Troubleshooting

### Reset Everything
```powershell
# Unlink site
netlify unlink

# Logout
netlify logout

# Run setup again
.\setup.ps1
```

### Clean Build
```powershell
# Remove build artifacts
Remove-Item -Recurse -Force frontend\dist
Remove-Item -Recurse -Force frontend\node_modules\.vite

# Rebuild
npm run netlify:build
```

### Reinstall Dependencies
```powershell
npm install
cd frontend && npm install && cd ..
cd netlify && npm install && cd ..
```

---

## 🎯 Environment Variables via CLI

```powershell
# Set variables
netlify env:set COINGECKO_API_KEY "your_key"
netlify env:set ETHEREUM_RPC_URL "your_rpc_url"

# List variables
netlify env:list

# Import from .env file
netlify env:import .env
```

---

## 📊 Monitoring via CLI

```powershell
# View real-time logs
netlify logs --stream

# View function logs
netlify functions:log api-status

# Check recent deploys
netlify deploy:list

# Open admin dashboard
netlify open:admin
```

---

## ✅ You're Ready!

Choose your workflow:
- **PowerShell Scripts**: Use `.\setup.ps1` and `.\deploy.ps1`
- **NPM Scripts**: Use `npm run netlify:*` commands
- **Direct CLI**: Use `netlify` commands directly

All methods work - pick what you prefer! 🚀
