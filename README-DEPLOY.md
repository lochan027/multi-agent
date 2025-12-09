# Multi-Agent DeFi Executor

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/multi-agent-defi)

A complete, production-ready multi-agent system for DeFi arbitrage on **Cosmos (Osmosis Testnet)** with real-time monitoring dashboard.

## 🌟 Live Demo

- **Frontend**: [https://your-app.netlify.app](https://your-app.netlify.app)
- **Backend API**: [https://your-api.onrender.com](https://your-api.onrender.com)

## ✨ Features

- ✅ **Multi-Agent System**: Scanner → Risk Assessor → Executor pipeline
- ✅ **Cosmos Integration**: Built on Osmosis Testnet with CosmJS
- ✅ **Keplr Wallet**: Secure browser-based signing (no private keys!)
- ✅ **Real-Time Dashboard**: Live WebSocket updates
- ✅ **Production Ready**: Optimized for Netlify + Render deployment
- ✅ **Zero Cost Hosting**: Free tier deployment on both platforms

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Keplr wallet extension
- Git

### Local Development

1. **Clone Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/multi-agent-defi.git
   cd multi-agent-defi
   ```

2. **Setup Backend**
   ```bash
   npm install
   cp .env.example .env
   # Add your COINGECKO_API_KEY to .env
   npm run build
   npm run server
   ```

3. **Setup Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000

## 🌐 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy

1. **Backend (Render)**
   - Connect GitHub repo
   - Auto-detects `render.yaml`
   - Add `COINGECKO_API_KEY` env var
   - Deploy!

2. **Frontend (Netlify)**
   - Connect GitHub repo
   - Auto-detects `netlify.toml`
   - Add `VITE_API_URL` env var (your Render URL)
   - Deploy!

**Total Time**: ~15 minutes  
**Total Cost**: $0/month

## 🏗️ Architecture

```
┌──────────────┐
│ ScannerAgent │ → Fetches token prices (CoinGecko + DexScreener)
└──────┬───────┘
       │ RiskTask
       ▼
┌──────────────┐
│  RiskAgent   │ → Calculates gas costs & profitability
└──────┬───────┘
       │ ExecTask
       ▼
┌──────────────┐
│ExecutorAgent │ → Simulates transactions on Osmosis
└──────────────┘
       │
       ▼ WebSocket
┌──────────────┐
│React Frontend│ → Real-time dashboard + Keplr wallet
└──────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js + Socket.IO
- **Blockchain**: CosmJS (Osmosis Testnet)
- **APIs**: CoinGecko Pro, DexScreener

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS 3
- **Wallet**: Keplr browser extension
- **Real-Time**: Socket.IO client

### Deployment
- **Frontend**: Netlify (Free tier)
- **Backend**: Render (Free tier)
- **Cost**: $0/month

## 📋 Environment Variables

### Backend (.env)
```env
COINGECKO_API_KEY=your_key_here
COSMOS_RPC_URL=https://rpc.osmotest5.osmosis.zone
COSMOS_REST_URL=https://lcd.osmotest5.osmosis.zone
COSMOS_CHAIN_ID=osmo-test-5
COSMOS_DENOM=uosmo
COSMOS_PREFIX=osmo
SCAN_INTERVAL_MS=20000
MIN_PROFIT_THRESHOLD=0.02
MAX_SLIPPAGE=0.01
GAS_PRICE=0.025
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend.onrender.com
```

## 🔐 Security

- ✅ No private keys in code or backend
- ✅ Keplr wallet handles all transaction signing
- ✅ CORS configured for production
- ✅ Environment variables for sensitive data
- ✅ HTTPS enforced (automatic on Netlify/Render)

## 🎯 How to Use

1. **Install Keplr**: https://www.keplr.app/download
2. **Get Testnet Tokens**: https://faucet.testnet.osmosis.zone
3. **Open App**: Click "Connect Keplr"
4. **Monitor**: Watch agents detect and analyze opportunities
5. **Track Stats**: View execution results in real-time

## 📊 Features

### Backend Features
- Continuous token price scanning
- Multi-source price aggregation (CoinGecko + DexScreener)
- Risk assessment with gas cost calculation
- Transaction simulation on Osmosis testnet
- Real-time WebSocket broadcasting
- RESTful API endpoints
- Health check monitoring

### Frontend Features
- Live agent status monitoring
- Arbitrage opportunity feed
- System statistics dashboard
- Activity log with filtering
- Keplr wallet integration
- Responsive design
- Real-time updates via WebSocket

## 🧪 Testing

### Backend
```bash
npm run build
npm start
# Check health: curl http://localhost:4000/api/health
```

### Frontend
```bash
cd frontend
npm run build
# Serve: npx serve dist
```

### Integration Test
1. Start backend
2. Start frontend
3. Connect Keplr wallet
4. Watch for opportunities
5. Monitor execution

## 📚 Documentation

- [COSMOS-MIGRATION.md](./COSMOS-MIGRATION.md) - Migration from Ethereum to Cosmos
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [MIGRATION-COMPLETE.md](./MIGRATION-COMPLETE.md) - Migration status
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [FRONTEND-GUIDE.md](./FRONTEND-GUIDE.md) - Frontend development guide

## 🐛 Troubleshooting

### Backend Issues
**Problem**: Backend not responding on Render  
**Solution**: Check logs, verify environment variables, free tier spins down after 15 min

**Problem**: CORS errors  
**Solution**: Add Netlify URL to `CORS_ORIGIN` environment variable

### Frontend Issues
**Problem**: Can't connect to backend  
**Solution**: Verify `VITE_API_URL` is set correctly, check browser console

**Problem**: Keplr not connecting  
**Solution**: Install Keplr extension, refresh page, check if Osmosis Testnet is added

## 💡 Tips

### Keep Render Backend Alive (Free Tier)
Use UptimeRobot to ping your backend every 14 minutes:
```
https://uptimerobot.com
Add monitor: https://your-backend.onrender.com/api/health
```

### Optimize Build Size
Frontend bundle is large (~1.9MB). Consider code splitting:
```typescript
// Use dynamic imports
const Component = lazy(() => import('./Component'));
```

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- IQAI ADK-TS architecture pattern
- CosmJS for Cosmos integration
- Keplr wallet team
- Osmosis testnet
- CoinGecko API
- DexScreener API

## 📞 Support

- GitHub Issues: https://github.com/YOUR_USERNAME/multi-agent-defi/issues
- Documentation: See `/docs` folder
- Keplr Support: https://help.keplr.app

## 🎯 Roadmap

- [ ] Add more DEX integrations
- [ ] Support multiple Cosmos chains
- [ ] Advanced trading strategies
- [ ] Portfolio tracking
- [ ] Mobile responsive improvements
- [ ] Dark/Light theme toggle

---

**Built with ❤️ using Cosmos SDK, React, and TypeScript**

**Deploy in 15 minutes | Host for $0/month | No private keys required**
