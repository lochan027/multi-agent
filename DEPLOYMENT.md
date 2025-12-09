# NebulaArb - Production Deployment Guide

## 🚀 Quick Deploy

### Backend (Render - Free Tier)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/multi-agent-defi.git
   git push -u origin main
   ```

2. **Deploy to Render**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`
   - Click "Apply"
   - Set environment variables:
     - `COINGECKO_API_KEY`: Your CoinGecko Pro API key
     - `DEXSCREENER_API_KEY`: (optional)
   - Deploy!

3. **Copy Backend URL**
   - After deployment, copy your backend URL
   - Example: `https://multi-agent-defi-backend.onrender.com`

### Frontend (Netlify - Free Tier)

1. **Update Environment Variable**
   - Edit `frontend/.env.production`
   - Set `VITE_API_URL` to your Render backend URL
   - Example: `VITE_API_URL=https://multi-agent-defi-backend.onrender.com`

2. **Deploy to Netlify**
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Netlify will auto-detect `netlify.toml`
   - Build settings (auto-filled):
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/dist`
   - Click "Deploy site"

3. **Configure Environment Variables** (in Netlify dashboard)
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = Your Render backend URL
   - Redeploy the site

4. **Update Backend CORS**
   - Copy your Netlify URL (e.g., `https://your-site.netlify.app`)
   - Go to Render dashboard → Your service → Environment
   - Add/Update: `CORS_ORIGIN` = Your Netlify URL
   - Redeploy backend

## 📋 Configuration Checklist

### Backend (Render)

Required environment variables:
- [x] `NODE_ENV=production`
- [x] `PORT=4000` (auto-set)
- [x] `COINGECKO_API_KEY=CG-tAZ7GPABXTV9WqbMhYfuZVx7`
- [x] `COSMOS_RPC_URL=https://rpc.atlantic-2.seinetwork.io`
- [x] `COSMOS_REST_URL=https://rest.atlantic-2.seinetwork.io`
- [x] `COSMOS_CHAIN_ID=atlantic-2`
- [x] `COSMOS_DENOM=usei`
- [x] `COSMOS_PREFIX=sei`
- [x] `SCAN_INTERVAL_MS=20000`
- [x] `MIN_PROFIT_THRESHOLD=0.02`
- [x] `MAX_SLIPPAGE=0.01`
- [x] `GAS_PRICE=0.025`
- [ ] `CORS_ORIGIN=https://your-frontend.netlify.app` (add after frontend deployment)

### Frontend (Netlify)

Required environment variables:
- [ ] `VITE_API_URL=https://your-backend.onrender.com`

## 🔧 Manual Deployment Commands

### Build Backend Locally
```bash
npm install
npm run build
npm start
```

### Build Frontend Locally
```bash
cd frontend
npm install
npm run build
```

## 🌐 Custom Domain (Optional)

### Netlify Custom Domain
1. Go to Domain settings in Netlify
2. Add custom domain
3. Update DNS records as instructed

### Render Custom Domain
1. Go to Settings → Custom Domains
2. Add your domain
3. Update DNS records

## 🔍 Health Checks

### Backend Health
```bash
curl https://your-backend.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","uptime":12345}
```

### Frontend Health
Open `https://your-frontend.netlify.app` in browser

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not responding
- Check Render logs for errors
- Verify all environment variables are set
- Check if Sei testnet RPC is accessible

**Problem**: CORS errors
- Verify `CORS_ORIGIN` includes your Netlify URL
- Check if Netlify URL is correct (with https://)

### Frontend Issues

**Problem**: Can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check browser console for errors
- Verify backend is running (health check)

**Problem**: Keplr not connecting
- Install Keplr browser extension
- Check browser console for errors
- Try adding Sei Testnet manually in Keplr

### Render Free Tier Limitations

- Backend spins down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds
- 750 hours/month (enough for 24/7 if only one service)

**Solution**: Use a service like UptimeRobot to ping your backend every 14 minutes to keep it alive.

## 📊 Monitoring

### Render Dashboard
- View logs: Dashboard → Your service → Logs
- Monitor CPU/Memory: Dashboard → Your service → Metrics

### Netlify Dashboard
- View deployments: Dashboard → Deploys
- Monitor bandwidth: Dashboard → Analytics

## 🔐 Security Checklist

- [x] No private keys in code
- [x] Environment variables for sensitive data
- [x] CORS configured properly
- [x] HTTPS enabled (automatic on Netlify/Render)
- [x] Keplr handles all wallet signing
- [x] API keys not exposed to frontend

## 💰 Cost Estimation

- **Render (Backend)**: $0/month (Free tier)
- **Netlify (Frontend)**: $0/month (Free tier)
- **Total**: **$0/month** 🎉

### Free Tier Limits

**Render:**
- 750 hours/month
- 512 MB RAM
- 0.1 CPU
- Spins down after 15 min inactivity

**Netlify:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

## 🎯 Post-Deployment

1. **Test the Full Stack**
   - Visit your Netlify URL
   - Connect Keplr wallet
   - Check if agents are running
   - Monitor opportunities feed

2. **Share Your App**
   - Share Netlify URL with users
   - Document Keplr installation steps
   - Provide Sei faucet link

3. **Monitor Performance**
   - Check Render logs daily
   - Monitor Netlify analytics
   - Watch for errors in browser console

## 📚 Resources

- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com
- Keplr Setup: https://www.keplr.app/download
- Sei Faucet: https://faucet.sei-testnet.com/
- Sei Explorer: https://seitrace.com/?chain=atlantic-2

---

**Deployment Time**: ~15 minutes  
**Difficulty**: Easy ⭐  
**Cost**: Free 💰
