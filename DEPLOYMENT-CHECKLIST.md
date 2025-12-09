# 🚀 Netlify Deployment Checklist

Use this checklist to ensure a smooth deployment to Netlify.

---

## ✅ Pre-Deployment

### 1. Repository Setup
- [ ] Code is pushed to GitHub
- [ ] `.env` files are NOT committed (in `.gitignore`)
- [ ] All dependencies are in `package.json` files
- [ ] `netlify.toml` is configured correctly

### 2. Environment Files
- [ ] `frontend/.env.production` exists
- [ ] `frontend/.env.local` exists (for local dev)
- [ ] `.env.example` is up to date

### 3. Code Quality
- [ ] Frontend builds successfully (`cd frontend && npm run build`)
- [ ] No TypeScript errors
- [ ] No missing dependencies

---

## 🌐 Netlify Setup

### 1. Create Account
- [ ] Sign up at [Netlify](https://app.netlify.com/signup)
- [ ] Connect GitHub account

### 2. Deploy Site
- [ ] Click "New site from Git"
- [ ] Select your repository
- [ ] Build settings:
  - **Base directory**: `frontend`
  - **Build command**: `npm run build`
  - **Publish directory**: `frontend/dist`
  - **Functions directory**: `netlify/functions`

### 3. Configure Environment Variables (Optional)
Go to **Site settings** → **Environment variables**:

#### Recommended
- [ ] `COINGECKO_API_KEY` - Get from [CoinGecko](https://www.coingecko.com/en/api/pricing)
- [ ] `ETHEREUM_RPC_URL` - From [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)

### 4. Deploy Settings
- [ ] Node version set to 18+ (in `netlify.toml`)
- [ ] Functions enabled
- [ ] CORS headers configured

---

## 🧪 Post-Deployment Testing

### 1. Basic Functionality
- [ ] Site loads without errors
- [ ] Landing page displays correctly
- [ ] Navigation works

### 2. Wallet Connection
- [ ] MetaMask detected
- [ ] Wallet connection works
- [ ] Balance displays correctly
- [ ] Network is Ethereum Mainnet (Chain ID: 1)

### 3. System Functions
- [ ] "Start System" button works
- [ ] Scanner status updates
- [ ] Opportunities appear (may take time)
- [ ] Settings modal opens and saves

### 4. API Endpoints
Test these in browser or Postman:

- [ ] `GET /.netlify/functions/api-status` - Returns system status
- [ ] `GET /.netlify/functions/api-agents` - Returns agent statuses
- [ ] `GET /.netlify/functions/api-opportunities` - Returns opportunities
- [ ] `POST /.netlify/functions/api-status` with `{"action": "start"}` - Starts system

### 5. Performance
- [ ] Page load time < 3 seconds
- [ ] API responses < 1 second
- [ ] No console errors
- [ ] Mobile responsive

---

## 🔧 Troubleshooting

### Build Fails
**Check:**
1. Netlify build logs (in dashboard)
2. Node.js version (must be 18+)
3. All dependencies installed
4. `netlify.toml` paths correct

**Fix:**
```bash
# Test build locally
cd frontend
npm install
npm run build

# If successful, push to GitHub
git push
```

### Functions Not Working
**Check:**
1. Functions directory: `netlify/functions`
2. Function exports: `export { handler }`
3. CORS headers in function responses
4. Netlify function logs

**Fix:**
```bash
# Test functions locally
npm install -g netlify-cli
netlify dev

# Access at http://localhost:8888
```

### MetaMask Connection Issues
**Check:**
1. MetaMask installed
2. On Ethereum Mainnet
3. Browser console for errors

**Fix:**
1. Refresh page
2. Disconnect/reconnect wallet
3. Clear browser cache

### No Opportunities Appearing
**Normal behavior** - Arbitrage is rare on mainnet.

**To test:**
1. Lower min profit threshold in settings
2. Check API rate limits (CoinGecko/DexScreener)
3. Verify price fetcher in function logs
4. Wait longer (opportunities come and go)

---

## 📊 Monitoring

### Netlify Dashboard
- **Analytics** → View traffic and performance
- **Functions** → Check invocations and errors
- **Deploys** → View build history
- **Logs** → Real-time function logs

### What to Monitor
- [ ] Function invocation count (stay under 125K/month free tier)
- [ ] Build minutes used (300/month free)
- [ ] Bandwidth (100 GB/month free)
- [ ] Error rates

---

## 🎯 Success Criteria

### Essential ✅
- [ ] Site is live and accessible
- [ ] MetaMask connection works
- [ ] System can be started/stopped
- [ ] Settings can be configured
- [ ] No critical errors

### Nice to Have 🌟
- [ ] Opportunities detected within 10 minutes
- [ ] Page loads in < 2 seconds
- [ ] Mobile experience is smooth
- [ ] Custom domain configured

---

## 📈 Next Steps

### Immediate
1. Test all features thoroughly
2. Share site with friends/team
3. Monitor for errors

### Short Term (1-7 days)
1. Add CoinGecko API key if hitting rate limits
2. Setup custom domain (optional)
3. Configure Alchemy/Infura RPC
4. Optimize profit thresholds

### Long Term (1+ weeks)
1. Consider Netlify Pro for better performance
2. Implement actual trade execution
3. Add more token pairs
4. Build analytics dashboard

---

## 🔐 Security Reminders

- [ ] ⚠️ Never commit `.env` files
- [ ] ⚠️ Never commit private keys
- [ ] ⚠️ Use MetaMask for all signing
- [ ] ⚠️ Start with small amounts on mainnet
- [ ] ⚠️ Enable manual approval mode
- [ ] ⚠️ Monitor gas prices before executing

---

## 📞 Support

If you encounter issues:

1. Check [Troubleshooting Guide](./NETLIFY-DEPLOYMENT.md#-troubleshooting)
2. Review [Quick Start](./QUICKSTART-ETHEREUM.md)
3. Check Netlify function logs
4. Review browser console errors

---

## ✨ Deployment Complete!

Once all items are checked, your NebulaArb instance is ready for Ethereum Mainnet! 🎉

**Remember**: 
- Arbitrage opportunities are rare
- Always test with small amounts
- Monitor gas costs carefully
- Keep manual approval enabled

Happy trading! 🚀
