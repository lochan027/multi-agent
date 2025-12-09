# 🚀 Deploy NebulaArb in 2 Commands

## Step 1: Setup (One Time Only)
```powershell
.\setup.ps1
```

## Step 2: Deploy
```powershell
.\deploy.ps1
```

## That's It! 🎉

Your Ethereum arbitrage bot is now live on Netlify!

---

## 📖 What Just Happened?

### `setup.ps1` installed:
- ✅ Netlify CLI
- ✅ All dependencies (root, frontend, functions)
- ✅ Logged you into Netlify
- ✅ Created your site

### `deploy.ps1` did:
- ✅ Built your frontend
- ✅ Deployed to Netlify
- ✅ Opened your site

---

## 🔄 Daily Use

After the one-time setup, just run:

```powershell
# Test locally
.\deploy.ps1 -Dev

# Deploy to production
.\deploy.ps1
```

---

## 📚 More Help?

- **Quick Commands**: [CLI-CHEAT-SHEET.md](./CLI-CHEAT-SHEET.md)
- **Complete Guide**: [CLI-DEPLOYMENT.md](./CLI-DEPLOYMENT.md)
- **Troubleshooting**: [CLI-QUICK-START.md](./CLI-QUICK-START.md)

---

## 🎯 Alternative Methods

### Using NPM Scripts
```powershell
npm run netlify:dev        # Test locally
npm run deploy:full        # Deploy
```

### Using Direct CLI
```powershell
netlify dev               # Test locally
netlify deploy --prod     # Deploy
```

---

**Questions?** Run `netlify help` or check the docs above! 🚀
