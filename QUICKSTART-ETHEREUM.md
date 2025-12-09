# 🚀 Quick Start Guide - NebulaArb on Ethereum

## Deploy to Netlify in 3 Steps

### 1️⃣ Deploy Button
Click this button to deploy to Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### 2️⃣ Connect GitHub
- Authorize Netlify to access your GitHub
- Choose a repository name (e.g., `nebulaarb-ethereum`)
- Click **"Save & Deploy"**

### 3️⃣ Install MetaMask & Connect
- Install [MetaMask](https://metamask.io/download/) if you haven't already
- Visit your deployed site (e.g., `your-site.netlify.app`)
- Click **"Connect Wallet"**
- Switch to Ethereum Mainnet in MetaMask
- Start monitoring arbitrage opportunities!

---

## 💡 What You Get

- ✅ **Serverless Backend** - No server management needed
- ✅ **Ethereum Mainnet** - Real DeFi data from major DEXs
- ✅ **10+ Token Pairs** - WETH, USDC, USDT, DAI, WBTC, LINK, UNI, AAVE, and more
- ✅ **Real-time Monitoring** - Live arbitrage opportunity detection
- ✅ **Manual Approval** - You control every trade
- ✅ **$0/month** - Free tier is plenty for personal use

---

## 🔧 Optional: Add API Keys for Better Performance

In Netlify dashboard → **Site settings** → **Environment variables**, add:

### CoinGecko API (Recommended)
Get better rate limits for price data:
- Sign up at [CoinGecko](https://www.coingecko.com/en/api/pricing)
- Add variable: `COINGECKO_API_KEY`

### Alchemy RPC (Recommended)
Faster and more reliable Ethereum access:
- Sign up at [Alchemy](https://www.alchemy.com/)
- Create an Ethereum Mainnet app
- Add variable: `ETHEREUM_RPC_URL` = `https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY`

### Alternative: Infura RPC
- Sign up at [Infura](https://infura.io/)
- Create an Ethereum project
- Add variable: `ETHEREUM_RPC_URL` = `https://mainnet.infura.io/v3/YOUR_KEY`

---

## 📱 Using the Dashboard

### Connect Wallet
1. Click **"Connect MetaMask"** button
2. Approve the connection in MetaMask popup
3. Ensure you're on **Ethereum Mainnet** (not a testnet)

### Start Monitoring
1. Click **"Start System"** after connecting wallet
2. Scanner will begin looking for arbitrage opportunities
3. Opportunities appear in the **"Opportunities"** section

### Configure Settings
Click the ⚙️ **Settings** button to adjust:
- **Scan Interval**: How often to check prices (30-60 seconds recommended)
- **Min Profit**: Minimum profit in USD to show opportunities ($5-10 for mainnet)
- **Max Slippage**: Maximum acceptable slippage (0.5-1% recommended)
- **Manual Approval**: Keep enabled for safety

### Approve Trades
When an opportunity appears:
1. Review the profit, gas costs, and risk score
2. Click **"Approve"** if you want to execute
3. Confirm the transaction in MetaMask
4. Wait for execution and check results

---

## ⚠️ Important Notes

### Mainnet Safety
- **Start Small**: Test with small amounts first
- **Gas Fees**: Ethereum gas can be expensive ($20-100+ during high activity)
- **Slippage**: Prices can move between detection and execution
- **Manual Mode**: Keep manual approval enabled until you're comfortable

### Realistic Expectations
- Arbitrage opportunities are **rare** on Ethereum mainnet
- Most opportunities are taken by MEV bots within seconds
- Profitable arbitrage requires:
  - Fast execution (sub-second)
  - Low gas fees
  - Large capital for meaningful profits

### This App is For
- 📊 Learning DeFi concepts
- 🔍 Monitoring arbitrage opportunities
- 🎓 Understanding multi-agent systems
- 🧪 Experimenting with trading strategies

---

## 🆘 Troubleshooting

### "MetaMask not detected"
- Install MetaMask browser extension
- Refresh the page
- Try a different browser

### "Wrong network"
- Open MetaMask
- Switch to **Ethereum Mainnet**
- Refresh the page

### "No opportunities found"
- This is normal - arbitrage is rare
- Try lowering **Min Profit** threshold
- Wait longer (opportunities come and go)
- Verify API keys are set correctly

### Build errors on Netlify
- Check build logs in Netlify dashboard
- Verify Node.js version is 18+
- Ensure all dependencies are installed

---

## 📚 Learn More

- [Full Deployment Guide](./NETLIFY-DEPLOYMENT.md)
- [API Documentation](./NETLIFY-DEPLOYMENT.md#-api-endpoints)
- [Local Development](./NETLIFY-DEPLOYMENT.md#-local-development)
- [Architecture Overview](./README.md#-architecture)

---

## 🎉 You're Ready!

Your NebulaArb instance is now live on Ethereum Mainnet. Happy trading! 🚀

**Remember**: Always practice caution with real funds on mainnet.
