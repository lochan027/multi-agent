# 🚀 Quick Start Guide

Get the Multi-Agent DeFi Executor with React Dashboard running in under 5 minutes!

## Prerequisites

- ✅ Node.js 18 or higher installed
- ✅ MetaMask browser extension installed
- ✅ Basic understanding of cryptocurrency wallets

## Step 1: Install Dependencies (2 minutes)

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

Expected output:
```
added 172 packages (backend)
added 215 packages (frontend)
```

## Step 2: Configure Environment (1 minute)

The `.env` file has default testnet settings. **Optional**: Add your testnet private key for actual execution:

```bash
# Edit .env
TESTNET_PRIVATE_KEY=0xYOUR_TESTNET_PRIVATE_KEY_HERE
```

> ⚠️ **Important**: Only use a testnet wallet! Never use mainnet private keys!

### Get Test ETH (if executing trades)

1. Create/use a MetaMask wallet on **Sepolia Test Network**
2. Get free test ETH from:
   - https://sepoliafaucet.com/
   - https://sepolia-faucet.pk910.de/
3. Wait 1-2 minutes for ETH to arrive

## Step 3: Run Everything (30 seconds)

```bash
npm run start:all
```

This single command starts:
- ✅ Backend API server on `http://localhost:4000`
- ✅ Frontend dashboard on `http://localhost:3000`
- ✅ All three agents (Scanner, Risk, Executor)
- ✅ WebSocket communication

You should see:
```
🌐 API Server running on http://localhost:4000
📡 WebSocket server ready
🎨 Frontend should run on http://localhost:3000

🚀 Starting Multi-Agent System with API Server...

🔍 ScannerAgent initialized
⚖️  RiskAgent initialized
💼 ExecutorAgent initialized
✓ Connected to testnet: Chain ID 11155111

VITE v5.4.21  ready in 331 ms
➜  Local:   http://localhost:3000/
```

## Step 4: Open Dashboard & Connect Wallet

1. Open browser to: **http://localhost:3000**
2. Click **"Connect Wallet"** button (top-right)
3. Approve MetaMask connection
4. Watch agents work in real-time! 🎉

### What You'll See on Dashboard

- **📊 System Statistics**: Scans, opportunities, executions, profit
- **🤖 Agent Status Cards**: Real-time status of all three agents
- **💰 Opportunities Feed**: Live arbitrage opportunities detected
- **📝 Activity Log**: Detailed log of all agent actions
- **👛 Wallet Info**: Your connected address and balance

### How It Works

1. **ScannerAgent** fetches token prices every 20 seconds
2. Detects price differences for potential arbitrage
3. **RiskAgent** calculates gas costs and profitability
4. Approves opportunities above profit threshold
5. **ExecutorAgent** simulates trades on testnet
6. Dashboard updates in real-time via WebSocket!

## Step 5: Stop the System

Press `Ctrl+C` to gracefully shut down all services.

## Alternative Running Methods

### Backend Only (No Dashboard)

```bash
npm run server
```

### Original CLI Version

```bash
npm run dev
```

The system will:
1. Scan token prices every 20 seconds
2. Detect arbitrage opportunities
3. Assess risk and profitability
4. Simulate trades on testnet

### Separate Terminals

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run frontend
```

## What's Happening?

### Continuous Loop

```
Every 20 seconds:
  1. ScannerAgent fetches prices from CoinGecko
  2. Detects price differences
  3. If opportunity found → sends to RiskAgent
  4. RiskAgent calculates costs and profit
  5. If profitable → sends to ExecutorAgent
  6. ExecutorAgent simulates the trade
  7. Reports results
```

### Log Output Explained

```
🔍 ScannerAgent: Starting scan...
   ↓ Fetching prices from CoinGecko
   
💡 Opportunity detected!
   Pair: ETH/BTC
   Potential Profit: 3.5%
   → Emitting RiskTask
   
⚖️  RiskAgent: Assessing risk...
   Gas Cost: $2.50
   Slippage: 0.5%
   Net Profit: $15.20
   Decision: ✓ APPROVED
   → Emitting ExecTask
   
💼 ExecutorAgent: Executing trade...
   Simulated Output: 0.025 BTC
   ✓ Simulation successful
```

## Common Issues

### Issue: "Cannot find module 'axios'"

**Solution:**
```bash
npm install
```

### Issue: "Connection refused" or RPC errors

**Solution:**
The default testnet RPC might be slow or down. Edit `.env`:
```bash
TESTNET_RPC_URL=https://rpc.sepolia.org
```

### Issue: No opportunities found

**Solution:**
This is normal! Real arbitrage opportunities are rare. The system uses mock prices with randomization. To see more activity:

1. Lower the profit threshold in `.env`:
```bash
MIN_PROFIT_THRESHOLD=0.001  # 0.1% instead of 2%
```

2. Or modify `src/tools/priceFetcher.ts` to use `fetchMockPrices()` method

### Issue: Build errors

**Solution:**
```bash
npm run clean  # Clear old build
npm run build  # Rebuild
```

## Next Steps

### Customize Token Pairs

Edit `src/index.ts` around line 100:

```typescript
const tokenPairs = [
  { tokenASymbol: 'ethereum', tokenBSymbol: 'bitcoin' },
  { tokenASymbol: 'uniswap', tokenBSymbol: 'chainlink' },
  // Add your pairs here
];
```

### Add Your Own Agent

See `ADK-ARCHITECTURE.md` for the agent pattern, then:

1. Create `src/agents/YourAgent.ts`
2. Create `src/tasks/YourTask.ts`
3. Add tools in `src/tools/`
4. Wire up in `src/index.ts`

### Use Real API Keys

Get free API keys:
- **CoinGecko**: https://www.coingecko.com/en/api
- **DexScreener**: https://dexscreener.com/

Add to `.env`:
```bash
COINGECKO_API_KEY=your_key_here
```

### Get Testnet ETH

1. Create Metamask wallet
2. Switch to Sepolia testnet
3. Visit faucet: https://sepoliafaucet.com/
4. Add private key to `.env`:
```bash
TESTNET_PRIVATE_KEY=0xYOUR_KEY_HERE
```

## Testing the System

### Manual Test

```bash
# Terminal 1: Run the system
npm run dev

# Watch for:
# - Price fetches every 20s
# - Opportunity detections
# - Risk assessments
# - Trade simulations
```

### Verify Components

```bash
# Check TypeScript compilation
npm run build

# Check dist folder created
ls dist/

# Run compiled code
npm start
```

## Architecture Overview

```
┌─────────────────┐
│  ScannerAgent   │  Fetches prices, detects opportunities
└────────┬────────┘
         │ RiskTask
         ▼
┌─────────────────┐
│   RiskAgent     │  Analyzes costs, calculates profit
└────────┬────────┘
         │ ExecTask
         ▼
┌─────────────────┐
│ ExecutorAgent   │  Simulates trades, reports results
└─────────────────┘
```

## Getting Help

- Read full README: `README.md`
- Architecture guide: `ADK-ARCHITECTURE.md`
- Check issues: GitHub Issues
- Review code: All files heavily commented

## Summary

```bash
# Three commands to get started:
npm install        # Install dependencies
npm run build      # Compile TypeScript
npm run dev        # Run the system

# That's it! 🚀
```

---

**Happy Trading! (On testnet, of course 😉)**
