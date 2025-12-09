# 🚀 CLI Deployment Guide - Deploy Everything via Command Line

This guide shows you how to deploy NebulaArb to Netlify entirely from the command line.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- Netlify account (sign up at https://netlify.com)
- Terminal/PowerShell access

---

## 🔧 Step 1: Install Netlify CLI

```powershell
# Install Netlify CLI globally
npm install -g netlify-cli

# Verify installation
netlify --version
```

---

## 🔐 Step 2: Login to Netlify

```powershell
# Login to your Netlify account
netlify login
```

This will open a browser window to authorize the CLI.

---

## 📦 Step 3: Install Dependencies

```powershell
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install Netlify functions dependencies
cd netlify
npm install
cd ..
```

---

## ⚙️ Step 4: Configure Environment (Optional)

Create `.env` file in root (optional, for API keys):

```powershell
# Create .env file
Copy-Item .env.example .env

# Edit with your API keys (optional)
notepad .env
```

Add your API keys:
```env
COINGECKO_API_KEY=your_key_here
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
```

---

## 🎯 Step 5: Initialize Netlify Site

### Option A: Create New Site

```powershell
# Initialize new Netlify site
netlify init
```

Follow the prompts:
1. Choose "Create & configure a new site"
2. Select your team
3. Enter site name (or leave blank for random)
4. Build command: `cd frontend && npm run build`
5. Directory to deploy: `frontend/dist`
6. Netlify functions folder: `netlify/functions`

### Option B: Link to Existing Site

```powershell
# If you already created a site on Netlify dashboard
netlify link
```

---

## 🏗️ Step 6: Build Frontend

```powershell
# Build the frontend
cd frontend
npm run build
cd ..
```

This creates the `frontend/dist` folder with your production build.

---

## 🚀 Step 7: Deploy to Netlify

### Deploy with Draft URL (Testing)

```powershell
# Deploy to a draft URL first
netlify deploy

# Or specify paths explicitly
netlify deploy --dir=frontend/dist --functions=netlify/functions
```

This gives you a draft URL to test before going live.

### Deploy to Production

```powershell
# Deploy to production (live site)
netlify deploy --prod

# Or with explicit paths
netlify deploy --prod --dir=frontend/dist --functions=netlify/functions
```

---

## 🔑 Step 8: Set Environment Variables (Optional)

```powershell
# Set environment variables via CLI
netlify env:set COINGECKO_API_KEY "your_api_key_here"
netlify env:set ETHEREUM_RPC_URL "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"

# List all environment variables
netlify env:list

# Import from .env file (if you created one)
netlify env:import .env
```

---

## 🧪 Step 9: Test Your Deployment

```powershell
# Open your site in browser
netlify open:site

# View site details
netlify status

# Check recent deploys
netlify deploy:list
```

---

## 🔄 Quick Redeploy Script

Create `deploy.ps1` in root:

```powershell
# deploy.ps1 - Quick deployment script

Write-Host "🏗️  Building frontend..." -ForegroundColor Cyan
cd frontend
npm run build
cd ..

Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Cyan
netlify deploy --prod --dir=frontend/dist --functions=netlify/functions

Write-Host "✅ Deployment complete!" -ForegroundColor Green
netlify open:site
```

Then deploy with:
```powershell
.\deploy.ps1
```

---

## 💻 Local Development via CLI

### Start Dev Server with Functions

```powershell
# Start Netlify Dev (includes functions)
netlify dev
```

This will:
- Start frontend dev server (Vite)
- Start Netlify Functions locally
- Proxy API requests
- Open browser at http://localhost:8888

### Test Functions Locally

```powershell
# Test a specific function
netlify functions:invoke api-status

# With payload
netlify functions:invoke api-status --payload '{"action":"start"}'

# List all functions
netlify functions:list
```

---

## 📊 Monitoring via CLI

```powershell
# View site logs
netlify logs

# Watch logs in real-time
netlify logs --stream

# View function logs
netlify functions:log api-status

# View build logs
netlify build:log
```

---

## 🔧 Advanced CLI Commands

### Site Management

```powershell
# View site info
netlify status

# Open Netlify dashboard
netlify open

# Open site admin panel
netlify open:admin

# Unlink from site
netlify unlink
```

### Function Management

```powershell
# List all functions
netlify functions:list

# Create new function
netlify functions:create api-test

# Invoke function locally
netlify functions:invoke api-status --port 8888
```

### Deploy Management

```powershell
# List recent deploys
netlify deploy:list

# View specific deploy
netlify deploy:get DEPLOY_ID

# Roll back to previous deploy
netlify rollback
```

### Domain Management

```powershell
# Add custom domain
netlify domains:create yourdomain.com

# List domains
netlify domains:list
```

---

## 🎨 Complete Workflow Example

```powershell
# 1. Clone/navigate to project
cd d:\Defi\multi-agent

# 2. Install dependencies
npm install
cd frontend && npm install && cd ..
cd netlify && npm install && cd ..

# 3. Login to Netlify
netlify login

# 4. Initialize site
netlify init

# 5. Set environment variables (optional)
netlify env:set COINGECKO_API_KEY "your_key"

# 6. Test locally
netlify dev
# Open http://localhost:8888 and test

# 7. Build frontend
cd frontend
npm run build
cd ..

# 8. Deploy to production
netlify deploy --prod --dir=frontend/dist --functions=netlify/functions

# 9. Open site
netlify open:site
```

---

## 🐛 Troubleshooting CLI Issues

### CLI Not Found
```powershell
# Reinstall Netlify CLI
npm uninstall -g netlify-cli
npm install -g netlify-cli

# Check installation
where.exe netlify
```

### Build Fails
```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force frontend\dist
Remove-Item -Recurse -Force frontend\node_modules\.vite
cd frontend
npm run build
cd ..
```

### Function Errors
```powershell
# Test function locally
netlify dev

# Check function logs
netlify functions:log api-status

# Rebuild functions
cd netlify
npm install
cd ..
```

### Authentication Issues
```powershell
# Logout and login again
netlify logout
netlify login

# Check status
netlify status
```

---

## 📝 Useful CLI Shortcuts

```powershell
# Quick commands
netlify dev          # Start dev server
netlify deploy       # Deploy draft
netlify deploy --prod # Deploy production
netlify open:site    # Open site in browser
netlify status       # Check site status
netlify logs         # View logs

# Aliases
ntl dev             # Same as netlify dev
ntl deploy --prod   # Same as netlify deploy --prod
```

---

## 🔐 CI/CD with CLI (Optional)

Create `.github/workflows/deploy.yml` for automatic deploys:

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd frontend && npm install && cd ..
          cd netlify && npm install && cd ..
      
      - name: Build frontend
        run: cd frontend && npm run build && cd ..
      
      - name: Deploy to Netlify
        run: netlify deploy --prod --dir=frontend/dist --functions=netlify/functions
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

Get tokens:
```powershell
# Get auth token
netlify status | Select-String "Admin URL"

# Get site ID
netlify api listSites | ConvertFrom-Json | Select-Object -ExpandProperty id
```

---

## 📦 Package.json Scripts

Add these to root `package.json` for quick access:

```json
{
  "scripts": {
    "netlify:login": "netlify login",
    "netlify:init": "netlify init",
    "netlify:dev": "netlify dev",
    "netlify:build": "cd frontend && npm run build && cd ..",
    "netlify:deploy": "netlify deploy --dir=frontend/dist --functions=netlify/functions",
    "netlify:deploy:prod": "netlify deploy --prod --dir=frontend/dist --functions=netlify/functions",
    "netlify:open": "netlify open:site",
    "netlify:status": "netlify status",
    "deploy:full": "cd frontend && npm run build && cd .. && netlify deploy --prod --dir=frontend/dist --functions=netlify/functions"
  }
}
```

Then use:
```powershell
npm run netlify:dev           # Start dev server
npm run deploy:full           # Build and deploy
npm run netlify:open          # Open site
```

---

## ✅ Deployment Complete!

Your site is now live! Check it with:

```powershell
netlify open:site
```

---

## 📞 Support

Need help?
```powershell
# Get help
netlify help

# Get help for specific command
netlify deploy --help
netlify dev --help
```

Or visit: https://docs.netlify.com/cli/get-started/
