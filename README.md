# NebulaArb

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

**NebulaArb** is an autonomous DeFi arbitrage system built with **IQAI's ADK-TS architecture pattern** that detects, analyzes, and executes arbitrage opportunities on **Ethereum Mainnet**. Features a beautiful **React dashboard** with landing page, **MetaMask wallet integration**, and **manual or autonomous trading modes**.

---

## 🚀 Deploy in 2 Commands (Recommended)

```powershell
# Step 1: Setup (one time)
.\setup.ps1

# Step 2: Deploy
.\deploy.ps1
```

**That's it!** See [DEPLOY.md](./DEPLOY.md) for the simplest deployment guide.

---

## 🚀 Quick Deploy (5 minutes, $0/month)

### 🎯 Simplest Method (Recommended)
```powershell
.\setup.ps1    # One-time setup
.\deploy.ps1   # Deploy
```
See [DEPLOY.md](./DEPLOY.md) - Just 2 commands!

### 📋 Alternative Methods

**CLI Approach:**
```powershell
npm install -g netlify-cli
netlify login
netlify init
.\deploy.ps1
```
See [CLI-QUICK-START.md](./CLI-QUICK-START.md)

**One-Click Deploy:**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

**NPM Scripts:**
```powershell
npm run netlify:dev     # Test locally
npm run deploy:full     # Deploy
```

---

### 📚 Documentation

- **[DEPLOY.md](./DEPLOY.md)** - ⭐ Simplest guide (START HERE!)
- **[CLI-CHEAT-SHEET.md](./CLI-CHEAT-SHEET.md)** - Quick command reference
- **[CLI-QUICK-START.md](./CLI-QUICK-START.md)** - Step-by-step CLI guide
- **[CLI-DEPLOYMENT.md](./CLI-DEPLOYMENT.md)** - Complete CLI documentation
- **[NETLIFY-DEPLOYMENT.md](./NETLIFY-DEPLOYMENT.md)** - API documentation
- **[DEPLOYMENT-OPTIONS.md](./DEPLOYMENT-OPTIONS.md)** - Compare all methods
- **[DOCS-INDEX.md](./DOCS-INDEX.md)** - 📖 Complete documentation index

**Free Hosting:**
- Frontend + Backend: Netlify (serverless functions)
- No separate backend server needed!

> **✨ ETHEREUM MAINNET**: This project runs on Ethereum Mainnet with support for popular tokens like WETH, USDC, USDT, DAI, WBTC, LINK, UNI, AAVE, and more.

## 🎯 Features

- ✅ **Landing Page**: Beautiful landing page with feature highlights
- ✅ **Wallet-Gated Start**: System only starts after MetaMask connection
- ✅ **Manual/Auto Modes**: Choose manual approval or autonomous trading
- ✅ **Settings Panel**: Configure scan intervals, profit thresholds, slippage
- ✅ **Multi-Agent Architecture**: Three specialized agents working in pipeline
- ✅ **Real-Time Dashboard**: React frontend with live agent monitoring
- ✅ **MetaMask Integration**: Connect MetaMask to view and fund operations
- ✅ **Ethereum Mainnet**: Built on Ethereum with major token pairs
- ✅ **Serverless Backend**: Netlify Functions for scalable API
- ✅ **Mainnet Safe**: All operations require explicit approval
- ✅ **Event-Driven**: Agents communicate via typed events
- ✅ **Type-Safe**: Full TypeScript with strict mode
- ✅ **No Private Keys**: MetaMask handles all signing securely

## 🏗️ Architecture

This system implements a **three-agent pipeline** with event-driven communication:

```
┌─────────────────┐
│  ScannerAgent   │  Scans token prices via CoinGecko/DexScreener
│                 │  Detects arbitrage opportunities
└────────┬────────┘
         │ RiskTask
         ▼
┌─────────────────┐
│   RiskAgent     │  Calculates gas costs & slippage
│                 │  Assesses profitability
└────────┬────────┘
         │ ExecTask
         ▼
┌─────────────────┐
│ ExecutorAgent   │  Simulates swap on testnet
│                 │  Reports execution results
└─────────────────┘
         │
         ▼ WebSocket Events
┌─────────────────┐
│  React Frontend │  Dashboard with wallet connection
│  (Port 3000)    │  Real-time monitoring & stats
└─────────────────┘
```

### Agent Responsibilities

#### 🔍 **ScannerAgent**
- Fetches real-time token prices from CoinGecko API
- Analyzes price differences across token pairs
- Detects arbitrage opportunities above profit threshold
- **Emits:** `RiskTask` events when opportunities are found
- **Tools:** `PriceFetcherTool` (CoinGecko + DexScreener fallback)

#### ⚖️ **RiskAgent**
- Receives `RiskTask` from ScannerAgent
- Calculates transaction gas costs in USD
- Estimates slippage impact based on trade size
- Computes net profitability after all costs
- Approves/rejects opportunities based on risk parameters
- **Emits:** `ExecTask` events for approved opportunities
- **Tools:** `RiskCheckerTool`

#### 💼 **ExecutorAgent**
- Receives `ExecTask` from RiskAgent
- Connects to Sei testnet via CosmJS
- Simulates MsgSend transactions (for demonstration)
- Reports execution results and tracks statistics
- **Tools:** `CosmosWalletTool`

## 🔗 Blockchain Integration

### Sei Testnet (atlantic-2)

- **Chain ID:** atlantic-2
- **RPC:** https://rpc.atlantic-2.seinetwork.io
- **REST:** https://rest.atlantic-2.seinetwork.io
- **Faucet:** https://faucet.sei-testnet.com/
- **Explorer:** https://seitrace.com/?chain=atlantic-2
- **Native Token:** SEI (usei)
- **Wallet:** Keplr browser extension

**Why Cosmos?**
- ✅ No private keys in backend (Keplr signs)
- ✅ Easy testnet tokens from faucet
- ✅ Low gas costs (~0.002 OSMO per tx)
- ✅ Fast finality (~5 seconds)
- ✅ Native IBC support

## 🔌 API Integration

### Price Data Sources

The system uses a **dual-source strategy** for reliable price data:

1. **CoinGecko API (Primary)**
   - Centralized, reliable pricing
   - Free tier: 30 calls/minute
   - Pro tier: Up to 500 calls/minute
   - Get API key: https://www.coingecko.com/en/api/pricing

2. **DexScreener API (Fallback)**
   - Real-time DEX aggregator
   - Rate limit: 300 requests/minute
   - No API key required
   - Documentation: https://docs.dexscreener.com/api/reference
   - See `DEXSCREENER-API.md` for detailed integration guide

When CoinGecko fails or is rate-limited, the system automatically falls back to DexScreener to ensure continuous operation.

## 📁 Project Structure

```
multi-agent-defi-executor/
├── src/
│   ├── agents/
│   │   ├── ScannerAgent.ts    # Price scanning & opportunity detection
│   │   ├── RiskAgent.ts       # Risk assessment & profitability analysis
│   │   ├── ExecutorAgent.ts   # Trade execution & simulation
│   │   └── index.ts           # Agent exports
│   ├── tools/
│   │   ├── priceFetcher.ts    # CoinGecko/DexScreener API integration
│   │   ├── riskChecker.ts     # Gas, slippage, profit calculations
│   │   ├── executorWallet.ts  # Ethers.js wallet & testnet interaction
│   │   └── index.ts           # Tool exports
│   ├── tasks/
│   │   ├── ScanTask.ts        # Scan task definition & schema
│   │   ├── RiskTask.ts        # Risk task definition & schema
│   │   ├── ExecTask.ts        # Execution task definition & schema
│   │   └── index.ts           # Task exports
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── index.ts               # Main orchestrator & entry point (CLI)
│   └── server.ts              # API server with WebSocket (dashboard)
├── frontend/
│   ├── src/
│   │   ├── components/        # React UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── App.tsx            # Main dashboard component
│   │   └── types.ts           # Frontend type definitions
│   ├── vite.config.ts         # Vite build configuration
│   └── package.json           # Frontend dependencies
├── docs/
│   ├── DEXSCREENER-API.md     # DexScreener integration guide
│   ├── FRONTEND-GUIDE.md      # Frontend setup & customization
│   ├── FRONTEND-IMPLEMENTATION.md  # Implementation details
│   └── ADK-ARCHITECTURE.md    # Architecture pattern explanation
├── package.json               # Backend dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```


## 🚀 Installation

### Prerequisites

- **Node.js** 18+ (recommended: v20 LTS)
- **npm** or **yarn**
- **Git**

### Step 1: Clone & Install

```bash
# Navigate to project directory
cd multi-agent-defi-executor

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# (See Configuration section below)
```

### Step 3: Install Dependencies

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

The backend requires:
- **axios**: HTTP client for API calls
- **ethers**: Ethereum wallet and blockchain interaction
- **express**: HTTP server for API endpoints
- **socket.io**: Real-time WebSocket communication
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **typescript**: TypeScript compiler
- **ts-node**: TypeScript execution for development

The frontend requires:
- **react**: UI library
- **ethers**: Web3 wallet integration
- **socket.io-client**: Real-time backend communication
- **vite**: Build tool and dev server
- **tailwindcss**: Utility-first CSS framework
- **recharts**: Data visualization
- **lucide-react**: Icon library

## ⚙️ Configuration

Edit `.env` file with your settings:

```bash
# API Keys (optional but recommended for production)
COINGECKO_API_KEY=your_coingecko_api_key_here
DEXSCREENER_API_KEY=your_dexscreener_api_key_here

# Testnet Configuration
TESTNET_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
TESTNET_CHAIN_ID=11155111

# Wallet (TESTNET ONLY - DO NOT USE REAL FUNDS)
TESTNET_PRIVATE_KEY=0xYOUR_TESTNET_PRIVATE_KEY_HERE

# Trading Parameters
SCAN_INTERVAL_MS=20000           # Scan every 20 seconds
MIN_PROFIT_THRESHOLD=0.02        # 2% minimum profit
MAX_SLIPPAGE=0.01                # 1% max slippage
GAS_PRICE_GWEI=20                # Gas price in Gwei
```

### ⚠️ Security Notes

- **NEVER** use mainnet private keys
- **ONLY** use testnet wallets with test ETH
- The default key in `.env.example` is for demonstration only
- Add `.env` to `.gitignore` (already configured)

### Getting Testnet ETH

1. Create a new wallet: `https://metamask.io/`
2. Switch to Sepolia testnet
3. Get free test ETH: `https://sepoliafaucet.com/`

## 🎮 Usage

### Option 1: Run Everything (Recommended)

Start both backend server and frontend dashboard:

```bash
npm run start:all
```

This will:
- Start the backend API server on `http://localhost:4000`
- Start the frontend dashboard on `http://localhost:3000`
- Initialize all three agents
- Enable WebSocket communication
- Open your browser to view the dashboard

### Option 2: Run Backend Only

```bash
npm run server
```

This runs the API server with the multi-agent system without the frontend interface.

### Option 3: Run Components Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run frontend
```

### Option 4: Development Mode (Old CLI version)

```bash
npm run dev
```

This runs the original CLI-only version without the API server or frontend.

### Build for Production

**Backend:**
```bash
npm run build
```

**Frontend:**
```bash
cd frontend
npm run build
```

## 🌐 Using the Dashboard

1. **Open the Dashboard**: Navigate to `http://localhost:3000` after starting the servers

2. **Connect Your Wallet**:
   - Click "Connect Wallet" button in the top-right
   - MetaMask will prompt to connect
   - Make sure you're on Sepolia testnet
   - Your wallet balance will be displayed

3. **Monitor Agents**:
   - View real-time status of all three agents
   - See tasks processed by each agent
   - Watch for active/idle status indicators

4. **Track Opportunities**:
   - Live feed of detected arbitrage opportunities
   - Status badges: Detected → Assessing → Approved → Executing → Completed/Failed
   - Profit calculations and token pairs

5. **View Statistics**:
   - Total scans performed
   - Opportunities detected and approved
   - Execution success rate
   - Total profit/loss

6. **Activity Log**:
   - Real-time feed of agent actions
   - Color-coded by status (info, success, warning, error)
   - Detailed descriptions of each action

### Expected Output

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        Multi-Agent DeFi Executor                          ║
║        Powered by IQAI ADK-TS                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📋 Loading configuration...

⚙️  Configuration:
   RPC URL: https://ethereum-sepolia-rpc.publicnode.com
   Chain ID: 11155111
   Scan Interval: 20000ms
   Min Profit: 2.00%
   Max Slippage: 1.00%
   Gas Price: 20 Gwei

🚀 Initializing agents...

🔍 ScannerAgent initialized
   Scan Interval: 20000ms
   Min Profit Threshold: 2.00%

⚖️  RiskAgent initialized
   Max Slippage: 1.00%
   Min Profit Threshold: 2.00%

💼 ExecutorAgent initialized
   ✓ Wallet initialized: 0x...
   ✓ Connected to testnet: Chain ID 11155111
   Wallet Address: 0x1234...5678
   Balance: 0.5 ETH
   Chain ID: 11155111
   Block Number: 4829374

🔗 Setting up agent communication...
   ✓ ScannerAgent → RiskAgent
   ✓ RiskAgent → ExecutorAgent

📊 Token pairs to scan:
   • ETHEREUM/BITCOIN
   • ETHEREUM/UNISWAP
   • CHAINLINK/AAVE

🔄 Starting continuous scanning...

💡 Press Ctrl+C to stop
```

## 🔧 How It Works

### 1. **Scanning Phase** (ScannerAgent)

Every 20 seconds, the ScannerAgent:
- Fetches current prices for configured token pairs
- Calculates potential profit margins
- Filters opportunities above minimum threshold
- Emits `RiskTask` for each opportunity

### 2. **Risk Assessment Phase** (RiskAgent)

When receiving a `RiskTask`, the RiskAgent:
- Estimates gas cost based on current network conditions
- Calculates slippage based on trade size
- Computes net profit after deducting costs
- Determines risk level (low/medium/high)
- Approves if profit margin exceeds threshold
- Emits `ExecTask` if approved

### 3. **Execution Phase** (ExecutorAgent)

When receiving an `ExecTask`, the ExecutorAgent:
- Checks wallet balance
- Simulates the swap transaction
- Calculates actual output with slippage
- Returns execution result
- Updates statistics

### Communication Flow

```
ScannerAgent.executeScanTask()
    ↓
    detects opportunity
    ↓
    emits RiskTask
    ↓
RiskAgent.handleRiskTask()
    ↓
    assesses risk & profitability
    ↓
    if approved → emits ExecTask
    ↓
ExecutorAgent.handleExecTask()
    ↓
    simulates execution
    ↓
    reports result
```

## 🌐 Deploying to ATP (Agent Task Protocol)

> **Note**: ATP deployment instructions are for when IQAI's ADK-TS becomes publicly available. The architecture is designed to be ATP-compatible.

IQAI's ATP allows you to deploy agents to a distributed network for production use.

### Step 1: Install ATP CLI (When Available)

```bash
npm install -g adk-ts-cli
```

### Step 2: Configure ATP Credentials

Add to `.env`:

```bash
ATP_ENDPOINT=https://atp.iqai.network
ATP_API_KEY=your_atp_api_key_here
```

### Step 3: Build for Deployment

```bash
npm run build
```

### Step 4: Deploy Agents

```bash
# Deploy all agents
adk-ts deploy --config atp.config.json

# Or deploy individually
adk-ts deploy --agent ScannerAgent
adk-ts deploy --agent RiskAgent
adk-ts deploy --agent ExecutorAgent
```

### Step 5: Register Tasks

```bash
# Register task definitions with ATP
adk-ts register-task --name ScanTask
adk-ts register-task --name RiskTask
adk-ts register-task --name ExecTask
```

### Step 6: Monitor Agents

```bash
# View agent status
adk-ts status

# View logs
adk-ts logs --agent ScannerAgent --tail
```

### ATP Configuration File

Create `atp.config.json`:

```json
{
  "version": "1.0.0",
  "agents": [
    {
      "name": "ScannerAgent",
      "entry": "dist/agents/ScannerAgent.js",
      "resources": {
        "cpu": "0.5",
        "memory": "512Mi"
      },
      "replicas": 1
    },
    {
      "name": "RiskAgent",
      "entry": "dist/agents/RiskAgent.js",
      "resources": {
        "cpu": "0.5",
        "memory": "512Mi"
      },
      "replicas": 2
    },
    {
      "name": "ExecutorAgent",
      "entry": "dist/agents/ExecutorAgent.js",
      "resources": {
        "cpu": "1.0",
        "memory": "1Gi"
      },
      "replicas": 1
    }
  ],
  "tasks": [
    "ScanTask",
    "RiskTask",
    "ExecTask"
  ]
}
```

## 🔍 Testing

### Manual Testing

```bash
# Run with verbose logging
DEBUG=* npm run dev

# Test specific token pairs (modify src/index.ts)
const tokenPairs = [
  { tokenASymbol: 'ethereum', tokenBSymbol: 'bitcoin' }
];
```

### Unit Testing (Future Enhancement)

```bash
# Install testing framework
npm install --save-dev jest @types/jest ts-jest

# Run tests
npm test
```

## 📊 Monitoring & Statistics

The ExecutorAgent tracks and displays statistics:

- **Total Executions**: Number of trades attempted
- **Successful**: Number of successful simulations
- **Success Rate**: Percentage of successful trades
- **Total Profit**: Cumulative profit across all trades

Press `Ctrl+C` to view final statistics:

```
📈 Final Statistics:
   Total Executions: 15
   Successful: 12
   Success Rate: 80.0%
   Total Profit: $124.50
```

## 🛠️ Customization

### Adding New Token Pairs

Edit `src/index.ts`:

```typescript
const tokenPairs = [
  { tokenASymbol: 'ethereum', tokenBSymbol: 'bitcoin' },
  { tokenASymbol: 'uniswap', tokenBSymbol: 'chainlink' },
  // Add more pairs here
];
```

### Adjusting Trading Parameters

Modify `.env`:

```bash
MIN_PROFIT_THRESHOLD=0.03  # 3% minimum profit
MAX_SLIPPAGE=0.005         # 0.5% max slippage
SCAN_INTERVAL_MS=30000     # Scan every 30 seconds
```

### Adding New Agents

1. Create agent in `src/agents/YourAgent.ts`
2. Define task in `src/tasks/YourTask.ts`
3. Create tools in `src/tools/yourTool.ts`
4. Register in `src/index.ts`
5. Set up communication links

## ⚠️ Important Warnings

### Testnet Only
- **This system is for TESTNET SIMULATION ONLY**
- Do not use real private keys or mainnet configurations
- No real money should ever be at risk

### API Rate Limits
- Free CoinGecko API: 10-30 calls/minute
- Consider paid plans for production use
- Implement caching to reduce API calls

### Gas Costs
- Testnet gas prices may not reflect mainnet
- Always validate profitability on mainnet conditions
- Add safety buffers for gas price volatility

### Slippage
- Large trades cause higher slippage
- Simplified slippage model (consider DEX liquidity)
- Use flash loans or split orders for large amounts

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Resources

- **IQAI ADK-TS Documentation**: [https://docs.iqai.network/adk-ts](https://docs.iqai.network/adk-ts)
- **CoinGecko API**: [https://www.coingecko.com/en/api](https://www.coingecko.com/en/api)
- **DexScreener API**: [https://docs.dexscreener.com/](https://docs.dexscreener.com/)
- **Ethers.js**: [https://docs.ethers.org/v6/](https://docs.ethers.org/v6/)
- **Sepolia Testnet**: [https://sepolia.dev/](https://sepolia.dev/)

## 📞 Support

- **Issues**: Open an issue on GitHub
- **Discussions**: Join our Discord community
- **Email**: support@iqai.network

---

**Built with ❤️ using IQAI ADK-TS**

*Remember: Always test thoroughly on testnet before considering any mainnet deployment.*
