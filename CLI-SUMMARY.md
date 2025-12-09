# 🎯 CLI Deployment Summary

## ✅ What's Been Created

Complete CLI-based deployment system for NebulaArb on Netlify.

---

## 📁 New Files

### PowerShell Scripts
1. **`setup.ps1`** - Automated one-time setup
   - Checks Node.js version
   - Installs Netlify CLI
   - Installs all dependencies
   - Logs into Netlify
   - Creates/links site
   - Sets environment variables

2. **`deploy.ps1`** - Quick deployment script
   - Builds frontend
   - Deploys to Netlify
   - Supports draft/production modes
   - Opens site in browser

### Documentation
1. **`CLI-QUICK-START.md`** - Quick reference guide
2. **`CLI-DEPLOYMENT.md`** - Complete CLI documentation
3. Updated **`README.md`** - Added CLI instructions

### Package.json Scripts
Added convenient npm scripts for CLI operations.

---

## 🚀 How to Use

### First Time Setup (Run Once)

```powershell
# Navigate to project
cd d:\Defi\multi-agent

# Run setup script
.\setup.ps1
```

**What it does:**
1. ✅ Installs Netlify CLI globally
2. ✅ Installs all project dependencies
3. ✅ Logs you into Netlify
4. ✅ Creates or links site
5. ✅ Optionally sets API keys
6. ✅ Optionally tests locally

### Deploy to Production

```powershell
# Quick deploy
.\deploy.ps1

# Or step-by-step
npm install
cd frontend && npm run build && cd ..
netlify deploy --prod --dir=frontend/dist --functions=netlify/functions
```

### Test Locally

```powershell
# Using script
.\deploy.ps1 -Dev

# Using npm
npm run netlify:dev

# Direct CLI
netlify dev
```

---

## 📦 NPM Scripts Available

```powershell
# Development
npm run netlify:dev              # Start local dev server

# Build
npm run netlify:build            # Build frontend

# Deploy
npm run netlify:deploy           # Deploy draft
npm run netlify:deploy:prod      # Deploy production
npm run deploy:full              # Build + deploy production

# Monitoring
npm run netlify:status           # Check status
npm run netlify:open             # Open site
npm run netlify:logs             # View logs
npm run netlify:functions        # List functions
```

---

## 🔧 CLI Commands Quick Reference

### Setup & Authentication
```powershell
netlify login                    # Login to Netlify
netlify logout                   # Logout
netlify init                     # Create new site
netlify link                     # Link existing site
netlify unlink                   # Unlink site
```

### Development
```powershell
netlify dev                      # Start dev server
netlify dev --port 9000          # Custom port
```

### Deployment
```powershell
netlify deploy                   # Deploy draft
netlify deploy --prod            # Deploy production
netlify deploy --prod --dir=frontend/dist --functions=netlify/functions
```

### Monitoring
```powershell
netlify status                   # Site status
netlify open:site                # Open site
netlify open:admin               # Open dashboard
netlify logs                     # View logs
netlify logs --stream            # Real-time logs
```

### Environment Variables
```powershell
netlify env:set KEY "value"      # Set variable
netlify env:list                 # List variables
netlify env:import .env          # Import from file
netlify env:get KEY              # Get specific variable
```

### Functions
```powershell
netlify functions:list           # List all functions
netlify functions:invoke NAME    # Test function
netlify functions:log NAME       # View function logs
```

### Site Management
```powershell
netlify sites:list               # List all sites
netlify deploy:list              # List deploys
netlify rollback                 # Rollback deploy
```

---

## 🎬 Complete Workflows

### Workflow 1: New User (First Time)

```powershell
# Step 1: Run setup
.\setup.ps1

# Step 2: Test locally (optional)
.\deploy.ps1 -Dev
# Open http://localhost:8888 and test

# Step 3: Deploy to production
.\deploy.ps1

# Step 4: Open site
netlify open:site
```

### Workflow 2: Daily Development

```powershell
# Make code changes...

# Test locally
.\deploy.ps1 -Dev

# Deploy when ready
.\deploy.ps1
```

### Workflow 3: Manual Control

```powershell
# Build
cd frontend
npm run build
cd ..

# Deploy
netlify deploy --prod --dir=frontend/dist --functions=netlify/functions

# Monitor
netlify logs --stream
```

---

## 🔐 Environment Variables Setup

### Method 1: Interactive (During Setup)
```powershell
.\setup.ps1
# Follow prompts to add API keys
```

### Method 2: CLI Commands
```powershell
netlify env:set COINGECKO_API_KEY "your_key_here"
netlify env:set ETHEREUM_RPC_URL "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
```

### Method 3: Import from File
```powershell
# Edit .env file
notepad .env

# Import to Netlify
netlify env:import .env
```

### Method 4: Netlify Dashboard
1. Open `netlify open:admin`
2. Go to Site settings → Environment variables
3. Add variables manually

---

## 📊 Monitoring & Debugging

### View Site Status
```powershell
netlify status
```

### View Logs
```powershell
# All logs
netlify logs

# Real-time logs
netlify logs --stream

# Function-specific logs
netlify functions:log api-status
```

### Test Functions Locally
```powershell
# Start dev server
netlify dev

# Test function endpoint
# Open: http://localhost:8888/.netlify/functions/api-status
```

### Check Recent Deploys
```powershell
netlify deploy:list
```

### Open Site/Dashboard
```powershell
netlify open:site        # Open live site
netlify open:admin       # Open Netlify dashboard
```

---

## 🐛 Troubleshooting

### Problem: Netlify CLI not found
```powershell
# Reinstall CLI
npm install -g netlify-cli

# Verify
netlify --version
```

### Problem: Site not linked
```powershell
# Check status
netlify status

# Link site
netlify link

# Or create new site
netlify init
```

### Problem: Build fails
```powershell
# Clear cache
Remove-Item -Recurse -Force frontend\dist
Remove-Item -Recurse -Force frontend\node_modules\.vite

# Reinstall and rebuild
cd frontend
npm install
npm run build
cd ..
```

### Problem: Function errors
```powershell
# Check function logs
netlify functions:log api-status

# Test locally
netlify dev

# Reinstall dependencies
cd netlify
npm install
cd ..
```

### Problem: Authentication issues
```powershell
# Logout and login again
netlify logout
netlify login
```

---

## 📈 Deployment Options

### Option 1: PowerShell Scripts (Easiest)
```powershell
.\setup.ps1          # One-time setup
.\deploy.ps1         # Deploy
.\deploy.ps1 -Dev    # Test locally
.\deploy.ps1 -Draft  # Deploy draft
```

### Option 2: NPM Scripts (Convenient)
```powershell
npm run netlify:dev           # Local dev
npm run deploy:full           # Build + deploy
npm run netlify:open          # Open site
```

### Option 3: Direct CLI (Full Control)
```powershell
netlify login
netlify init
netlify dev
netlify deploy --prod --dir=frontend/dist --functions=netlify/functions
```

---

## 🎯 Recommended Workflow

**For beginners:**
1. Run `.\setup.ps1` (one time)
2. Use `.\deploy.ps1` for all deployments
3. Use `.\deploy.ps1 -Dev` for local testing

**For experienced users:**
1. Use npm scripts: `npm run netlify:dev`, `npm run deploy:full`
2. Or direct CLI commands for full control

**For CI/CD:**
1. Use GitHub Actions (see CLI-DEPLOYMENT.md)
2. Or Netlify's automatic Git deploys

---

## ✅ Success Checklist

After running setup and deploy:

- [ ] Netlify CLI installed (`netlify --version` works)
- [ ] Logged into Netlify (`netlify status` shows site info)
- [ ] Dependencies installed (no npm errors)
- [ ] Frontend builds successfully
- [ ] Site deployed to Netlify
- [ ] Site opens in browser (`netlify open:site`)
- [ ] MetaMask connects to site
- [ ] All functions working (check `netlify functions:list`)

---

## 🎉 You're All Set!

Your CLI deployment system is ready. Choose your preferred method:

- **Quick & Easy**: Use PowerShell scripts
- **Flexible**: Use npm scripts  
- **Full Control**: Use Netlify CLI directly

All methods work perfectly! 🚀

---

## 📚 Documentation Files

1. **CLI-QUICK-START.md** - Quick reference (start here!)
2. **CLI-DEPLOYMENT.md** - Complete CLI guide
3. **setup.ps1** - Setup script
4. **deploy.ps1** - Deployment script
5. **README.md** - Updated with CLI instructions

---

## 🆘 Need Help?

```powershell
# Get help for any command
netlify help
netlify deploy --help

# Check status
netlify status

# View logs
netlify logs
```

Or check the documentation files listed above!
