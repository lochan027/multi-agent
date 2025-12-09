# 🎯 CLI Commands Cheat Sheet

## 🚀 Quick Start (Copy & Paste)

### First Time Setup
```powershell
# Run this once
.\setup.ps1
```

### Deploy to Production
```powershell
# Run this every time you want to deploy
.\deploy.ps1
```

### Test Locally
```powershell
# Run this to test before deploying
.\deploy.ps1 -Dev
```

---

## 📦 All Available Commands

### Setup Commands (One-Time)
| Command | What It Does |
|---------|-------------|
| `.\setup.ps1` | Complete automated setup |
| `netlify login` | Login to Netlify account |
| `netlify init` | Create new site |
| `netlify link` | Link to existing site |

### Development Commands
| Command | What It Does |
|---------|-------------|
| `.\deploy.ps1 -Dev` | Start local dev server |
| `npm run netlify:dev` | Alternative dev server start |
| `netlify dev` | Direct CLI dev server |

### Deployment Commands
| Command | What It Does |
|---------|-------------|
| `.\deploy.ps1` | Deploy to production |
| `.\deploy.ps1 -Draft` | Deploy draft (test) version |
| `npm run deploy:full` | Build + deploy production |
| `netlify deploy --prod` | Direct CLI deploy |

### Monitoring Commands
| Command | What It Does |
|---------|-------------|
| `netlify open:site` | Open your live site |
| `netlify status` | Show site information |
| `netlify logs` | View site logs |
| `npm run netlify:open` | Open site (via npm) |

### Environment Commands
| Command | What It Does |
|---------|-------------|
| `netlify env:set KEY "value"` | Set environment variable |
| `netlify env:list` | List all variables |
| `netlify env:import .env` | Import from .env file |

---

## 🎬 Common Workflows

### Scenario 1: First Deployment
```powershell
# Step 1: Setup (once)
.\setup.ps1

# Step 2: Deploy
.\deploy.ps1

# Step 3: Open site
netlify open:site
```

### Scenario 2: Update Code
```powershell
# Edit your code...

# Test locally
.\deploy.ps1 -Dev

# Deploy when ready
.\deploy.ps1
```

### Scenario 3: Add API Keys
```powershell
# Method 1: Interactive
.\setup.ps1
# Choose to add environment variables

# Method 2: Direct
netlify env:set COINGECKO_API_KEY "your_key"
netlify env:set ETHEREUM_RPC_URL "your_rpc_url"
```

### Scenario 4: View Logs
```powershell
# Option 1: CLI
netlify logs

# Option 2: Real-time
netlify logs --stream

# Option 3: Dashboard
netlify open:admin
```

---

## 🔧 Troubleshooting Commands

### Problem: Build Fails
```powershell
# Clean and rebuild
Remove-Item -Recurse -Force frontend\dist
cd frontend && npm run build && cd ..
```

### Problem: Site Not Linked
```powershell
# Check if linked
netlify status

# Link to site
netlify link

# Or create new
netlify init
```

### Problem: CLI Not Working
```powershell
# Reinstall CLI
npm install -g netlify-cli

# Check version
netlify --version
```

### Problem: Need Fresh Start
```powershell
# Unlink and relink
netlify unlink
netlify link

# Or run setup again
.\setup.ps1
```

---

## 🎯 By Task

### I want to... | Run this command
|--------------|------------------|
| Set everything up | `.\setup.ps1` |
| Deploy my site | `.\deploy.ps1` |
| Test locally | `.\deploy.ps1 -Dev` |
| Open my site | `netlify open:site` |
| View logs | `netlify logs` |
| Add API key | `netlify env:set KEY "value"` |
| Check status | `netlify status` |
| Get help | `netlify help` |

---

## 💡 Pro Tips

### Tip 1: Use Aliases
Add to your PowerShell profile:
```powershell
Set-Alias nd "netlify dev"
Set-Alias ndp "netlify deploy --prod"
Set-Alias no "netlify open:site"
```

### Tip 2: Quick Redeploy
```powershell
# One-liner for quick updates
cd frontend; npm run build; cd ..; netlify deploy --prod --dir=frontend/dist --functions=netlify/functions
```

### Tip 3: Monitor Everything
```powershell
# Open multiple terminals:
# Terminal 1: Watch logs
netlify logs --stream

# Terminal 2: Run dev server
netlify dev
```

---

## 📱 Mobile-Friendly Quick Reference

**Setup**: `.\setup.ps1`  
**Deploy**: `.\deploy.ps1`  
**Test**: `.\deploy.ps1 -Dev`  
**Open**: `netlify open:site`  
**Status**: `netlify status`  
**Logs**: `netlify logs`

---

## 🎓 Learning Path

**Day 1: Setup**
- Run `.\setup.ps1`
- Test with `.\deploy.ps1 -Dev`
- Deploy with `.\deploy.ps1`

**Day 2: Customize**
- Add API keys with `netlify env:set`
- Monitor with `netlify logs`
- Check `netlify status`

**Day 3: Master**
- Use npm scripts
- Direct CLI commands
- Automate with PowerShell

---

## ✅ Quick Checklist

Before deploying:
- [ ] Node.js 18+ installed
- [ ] Netlify CLI installed
- [ ] Logged into Netlify
- [ ] Site created/linked
- [ ] Dependencies installed
- [ ] Frontend builds successfully

To deploy:
- [ ] Run `.\deploy.ps1`
- [ ] Wait for build
- [ ] Check `netlify status`
- [ ] Open `netlify open:site`
- [ ] Test all features

---

## 🆘 Emergency Commands

### Site is broken
```powershell
netlify rollback
```

### Need to start over
```powershell
netlify unlink
.\setup.ps1
```

### Lost connection
```powershell
netlify logout
netlify login
```

### Functions not working
```powershell
cd netlify
npm install
cd ..
.\deploy.ps1
```

---

## 📞 Get Help

```powershell
# General help
netlify help

# Command-specific help
netlify deploy --help
netlify dev --help

# Check documentation
Get-Content .\CLI-QUICK-START.md
```

---

**Remember**: When in doubt, run `.\setup.ps1` or check `netlify help`! 🚀
