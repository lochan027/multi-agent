# NebulaArb - Ethereum Mainnet Deployment Guide

## 🚀 Quick Deploy to Netlify (5 minutes)

This guide will help you deploy NebulaArb on Netlify with serverless backend functions.

### Prerequisites

- GitHub account
- Netlify account (free tier is sufficient)
- MetaMask wallet installed

### Step 1: Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Click the "Deploy to Netlify" button above
2. Connect your GitHub account
3. Choose a repository name
4. Click "Deploy site"

### Step 2: Configure Environment Variables

In your Netlify dashboard, go to **Site settings** → **Environment variables** and add:

**Optional but recommended:**
- `COINGECKO_API_KEY` - Get free key from [CoinGecko](https://www.coingecko.com/en/api/pricing)
- `ETHEREUM_RPC_URL` - Use Alchemy or Infura for better reliability
  - [Alchemy](https://www.alchemy.com/) (recommended): `https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY`
  - [Infura](https://infura.io/): `https://mainnet.infura.io/v3/YOUR_KEY`

### Step 3: Access Your Deployment

1. Wait for the build to complete (~2-3 minutes)
2. Click on your site URL (e.g., `your-site.netlify.app`)
3. Connect your MetaMask wallet
4. Start monitoring Ethereum arbitrage opportunities!

---

## 🏗️ Architecture Overview

### Frontend
- **Hosting**: Netlify (static site)
- **Framework**: React + Vite + TypeScript
- **Wallet**: MetaMask integration for Ethereum

### Backend
- **Hosting**: Netlify Functions (serverless)
- **Runtime**: Node.js 18
- **API Endpoints**:
  - `/.netlify/functions/api-status` - System status and stats
  - `/.netlify/functions/api-agents` - Agent statuses
  - `/.netlify/functions/api-opportunities` - Arbitrage opportunities

### Blockchain
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Wallet**: MetaMask (browser extension)
- **Token Pairs**: WETH, USDC, USDT, DAI, WBTC, LINK, UNI, AAVE, MKR, and more

---

## 📡 API Endpoints

### GET `/.netlify/functions/api-status`
Returns system status, statistics, and settings.

**Response:**
```json
{
  "running": true,
  "stats": {
    "totalScans": 42,
    "opportunitiesDetected": 8,
    "opportunitiesApproved": 3,
    "executionsAttempted": 3,
    "executionsSuccessful": 2,
    "totalProfit": 15.75,
    "successRate": 66.7,
    "uptime": 3600
  },
  "settings": {
    "scanInterval": 30,
    "minProfitUSD": 1.0,
    "maxSlippage": 1.0,
    "requireApproval": true
  }
}
```

### POST `/.netlify/functions/api-status`
Control system state or update settings.

**Start system:**
```json
{ "action": "start" }
```

**Stop system:**
```json
{ "action": "stop" }
```

**Update settings:**
```json
{
  "settings": {
    "scanInterval": 60,
    "minProfitUSD": 2.0
  }
}
```

### GET `/.netlify/functions/api-opportunities`
Get current arbitrage opportunities.

**Response:**
```json
[
  {
    "id": "opp-1234567890",
    "tokenPair": "WETH/USDC",
    "tokenA": "WETH",
    "tokenB": "USDC",
    "buyPrice": 3500.50,
    "sellPrice": 3585.75,
    "profit": 2.435,
    "profitUSD": 85.25,
    "estimatedGas": 75.50,
    "riskScore": 35.2,
    "status": "pending_approval",
    "timestamp": 1702345678901,
    "detectedAt": "2024-12-08T10:30:00.000Z"
  }
]
```

### POST `/.netlify/functions/api-opportunities`
Approve or reject opportunities.

**Approve:**
```json
{
  "action": "approve",
  "opportunityId": "opp-1234567890"
}
```

**Reject:**
```json
{
  "action": "reject",
  "opportunityId": "opp-1234567890"
}
```

### GET `/.netlify/functions/api-agents`
Get status of all agents.

**Response:**
```json
[
  {
    "name": "ScannerAgent",
    "status": "active",
    "lastActivity": 1702345678901,
    "tasksProcessed": 42
  },
  {
    "name": "RiskAgent",
    "status": "idle",
    "lastActivity": 1702345678801,
    "tasksProcessed": 8
  },
  {
    "name": "ExecutorAgent",
    "status": "idle",
    "lastActivity": 1702345678701,
    "tasksProcessed": 3
  }
]
```

---

## 🔧 Local Development

### Prerequisites
- Node.js 18+ and npm
- Netlify CLI: `npm install -g netlify-cli`

### Setup

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd multi-agent
```

2. **Install dependencies:**
```bash
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

3. **Configure environment variables:**
```bash
# Copy example files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local

# Edit .env files with your API keys
```

4. **Run locally with Netlify Dev:**
```bash
netlify dev
```

This will:
- Start the frontend dev server (Vite)
- Start the Netlify Functions locally
- Proxy API requests to functions
- Open browser at `http://localhost:8888`

### Frontend Development Only
```bash
cd frontend
npm run dev
```

---

## 🔐 Security Best Practices

### For Mainnet Deployment

1. **Never commit private keys** - Use MetaMask for wallet operations
2. **Use environment variables** - Set sensitive data in Netlify UI
3. **Enable rate limiting** - Configure Netlify rate limits if needed
4. **Monitor gas prices** - High gas can eat into profits
5. **Start with small amounts** - Test with minimal funds first

### Recommended Settings for Mainnet

- **Min Profit**: $5-10 USD (to cover gas fees)
- **Max Slippage**: 0.5-1.0% (lower is safer)
- **Require Approval**: `true` (manual approval recommended for mainnet)
- **Scan Interval**: 30-60 seconds (avoid rate limits)

---

## 📊 Monitoring & Analytics

### View Logs in Netlify
1. Go to **Site settings** → **Functions**
2. Click on a function name
3. View real-time logs and invocations

### Metrics Available
- Total scans performed
- Opportunities detected
- Success rate
- Total profit (USD)
- Gas costs
- Agent performance

---

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (must be 18+)
- Verify all dependencies are in `package.json`
- Check Netlify build logs

### Functions Return Errors
- Verify environment variables are set
- Check function logs in Netlify dashboard
- Test endpoints locally with `netlify dev`

### MetaMask Not Connecting
- Ensure MetaMask is installed
- Check you're on Ethereum Mainnet
- Try disconnecting and reconnecting
- Clear browser cache

### No Opportunities Detected
- Arbitrage opportunities are rare on mainnet
- Lower minimum profit threshold
- Check API rate limits (CoinGecko/DexScreener)
- Verify RPC endpoint is working

---

## 💰 Cost Breakdown

### Netlify Free Tier
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ 125K serverless function requests/month
- ✅ Custom domain support

**Estimated monthly cost: $0**

### Optional Paid Services
- CoinGecko API: $0-129/month (free tier available)
- Alchemy RPC: $0-199/month (free tier: 300M compute units)
- Infura RPC: $0-50/month (free tier: 100K requests/day)

---

## 📈 Scaling Considerations

### When to Upgrade

**Netlify Pro ($19/month):**
- More function execution time
- Higher bandwidth
- Better support

**Infrastructure Upgrades:**
- Dedicated RPC node for lower latency
- Paid API tiers for higher rate limits
- Database for persistent state (currently in-memory)

---

## 🤝 Support

- **Documentation**: Check all `.md` files in repo
- **Issues**: Open GitHub issue
- **Discord**: Join our community (if available)

---

## 📝 License

MIT License - See LICENSE file for details
