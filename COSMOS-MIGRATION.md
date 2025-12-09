# Cosmos Migration Guide

## Overview

This project has been **completely migrated from Ethereum to Cosmos**. All blockchain interactions now use **Osmosis Testnet (osmo-test-5)** instead of Ethereum Sepolia.

## Key Changes

### Architecture Changes

| Component | Before (Ethereum) | After (Cosmos) |
|-----------|-------------------|----------------|
| **Blockchain** | Ethereum Sepolia | Osmosis Testnet (osmo-test-5) |
| **Library** | Ethers.js 6.9.0 | CosmJS 0.32.2 |
| **Wallet** | MetaMask | Keplr |
| **Transaction Type** | Smart contract calls | MsgSend |
| **Native Token** | ETH | OSMO |
| **Gas Unit** | Gwei | uosmo (micro-osmo) |
| **Address Format** | 0x... (hex) | osmo1... (bech32) |
| **Signing** | Private key (backend) | Keplr wallet (frontend) |

### Environment Variables

**Old (.env - Ethereum):**
```env
TESTNET_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
TESTNET_CHAIN_ID=11155111
TESTNET_PRIVATE_KEY=0x...
GAS_PRICE_GWEI=20
```

**New (.env - Cosmos):**
```env
COSMOS_RPC_URL=https://rpc.osmotest5.osmosis.zone
COSMOS_REST_URL=https://lcd.osmotest5.osmosis.zone
COSMOS_CHAIN_ID=osmo-test-5
COSMOS_DENOM=uosmo
COSMOS_PREFIX=osmo
GAS_PRICE=0.025
```

**Critical:** No private keys required! Keplr wallet handles signing.

### Code Changes

#### 1. Configuration (`src/types/index.ts`)

**Removed:**
- `testnetRpcUrl: string`
- `testnetChainId: number`
- `testnetPrivateKey: string`
- `gasPriceGwei: number`

**Added:**
- `cosmosRpcUrl: string`
- `cosmosRestUrl: string`
- `cosmosChainId: string`
- `cosmosDenom: string`
- `cosmosPrefix: string`
- `gasPrice: number`

#### 2. Wallet Tool

**Deleted:** `src/tools/executorWallet.ts` (Ethers.js)

**Created:** `src/tools/cosmosWallet.ts` (CosmJS)

Key methods:
- `initialize()` - Connect to Cosmos chain
- `setAddress(address: string)` - Set wallet address
- `getBalance(address?: string)` - Get OSMO balance
- `simulateSend(params)` - Simulate MsgSend transaction
- `getWalletInfo()` - Get wallet details

#### 3. Agents

**ExecutorAgent** (`src/agents/ExecutorAgent.ts`):
- Uses `CosmosWalletTool` instead of `WalletExecutorTool`
- Simulates `MsgSend` transactions instead of token swaps
- Displays balances in OSMO instead of ETH
- No private key handling (Keplr signs)

**RiskAgent** (`src/agents/RiskAgent.ts`):
- Gas calculations use `uosmo` instead of `gwei`
- Estimates ~75,000 gas units (Cosmos) vs 150,000 (Ethereum)
- Uses OSMO price (~$1) instead of ETH price (~$2000)

**ScannerAgent** (`src/agents/ScannerAgent.ts`):
- Updated to use `config.gasPrice` instead of `config.gasPriceGwei`
- Minimal changes (mostly blockchain-agnostic)

#### 4. Risk Checker Tool

**RiskCheckerTool** (`src/tools/riskChecker.ts`):
- Renamed internal variable from `ethPriceUSD` to `osmoPriceUSD`
- Gas calculation formula changed:
  ```typescript
  // Old (Ethereum):
  gasCostEth = (gasPriceGwei * gasUnits) / 1e9
  gasCostUSD = gasCostEth * ethPriceUSD
  
  // New (Cosmos):
  gasCostUosmo = gasPrice * gasUnits
  gasCostOsmo = gasCostUosmo / 1_000_000
  gasCostUSD = gasCostOsmo * osmoPriceUSD
  ```

## Osmosis Testnet Configuration

### Network Details

| Parameter | Value |
|-----------|-------|
| **Chain ID** | osmo-test-5 |
| **RPC Endpoint** | https://rpc.osmotest5.osmosis.zone |
| **REST Endpoint** | https://lcd.osmotest5.osmosis.zone |
| **WebSocket** | wss://rpc.osmotest5.osmosis.zone/websocket |
| **Faucet** | https://faucet.testnet.osmosis.zone/ |
| **Explorer** | https://testnet.mintscan.io/osmosis-testnet |

### Token Details

- **Native Token:** OSMO
- **Denom:** uosmo (micro-osmo)
- **Conversion:** 1 OSMO = 1,000,000 uosmo
- **Bech32 Prefix:** osmo
- **Address Example:** osmo1abc...xyz

### Gas Configuration

- **Typical Gas Limit (MsgSend):** 75,000
- **Gas Price:** 0.025 uosmo
- **Typical Transaction Cost:** ~0.001875 OSMO (~$0.0019 USD)

### Getting Testnet Tokens

1. Install Keplr wallet extension
2. Visit https://faucet.testnet.osmosis.zone/
3. Connect Keplr wallet
4. Request testnet OSMO
5. Tokens arrive in ~10 seconds

## Frontend Migration (Pending)

The frontend still uses **MetaMask** and needs to be migrated to **Keplr**.

### Required Changes

#### 1. Update `frontend/src/hooks/useWallet.ts`

**Current (MetaMask):**
```typescript
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const address = await signer.getAddress();
```

**Target (Keplr):**
```typescript
await window.keplr.enable('osmo-test-5');
const offlineSigner = window.keplr.getOfflineSigner('osmo-test-5');
const accounts = await offlineSigner.getAccounts();
const address = accounts[0].address;

// Get balance
const client = await SigningStargateClient.connectWithSigner(
  'https://rpc.osmotest5.osmosis.zone',
  offlineSigner
);
const balance = await client.getBalance(address, 'uosmo');
```

#### 2. Update `frontend/src/components/WalletButton.tsx`

**Changes:**
- Button text: "Connect Wallet" → "Connect Keplr"
- Check for `window.keplr` instead of `window.ethereum`
- Display `osmo1...` addresses instead of `0x...`
- Show OSMO balance instead of ETH

#### 3. Add Type Definitions

Create `frontend/src/types/keplr.d.ts`:
```typescript
import { Window as KeplrWindow } from '@keplr-wallet/types';

declare global {
  interface Window extends KeplrWindow {}
}
```

#### 4. Install Dependencies

```bash
cd frontend
npm install @keplr-wallet/types @cosmjs/stargate @cosmjs/proto-signing
```

## Transaction Flow Comparison

### Ethereum (Old)

1. User connects MetaMask
2. Frontend sends transaction request
3. MetaMask prompts signature
4. Backend uses private key to execute
5. Transaction submitted to Sepolia

**Problems:**
- Private keys in backend (security risk)
- Requires ETH for gas
- Sepolia testnet tokens hard to obtain

### Cosmos (New)

1. User connects Keplr
2. Frontend sends transaction request
3. Keplr prompts signature
4. Backend simulates transaction
5. User confirms in Keplr
6. Transaction submitted to Osmosis

**Benefits:**
- No private keys in backend
- Easy testnet tokens from faucet
- Better security model
- Native Cosmos integration

## Testing Guide

### Backend Testing

1. **Check Configuration:**
   ```bash
   npm run dev
   ```
   
   Should show:
   ```
   RPC URL: https://rpc.osmotest5.osmosis.zone
   Chain ID: osmo-test-5
   Denom: uosmo
   Gas Price: 0.025 uosmo
   ```

2. **Test Wallet Connection:**
   The system will connect to Osmosis testnet RPC and query chain height.

3. **Test Simulated Transactions:**
   ExecutorAgent simulates `MsgSend` transactions without requiring actual signing.

### Frontend Testing (After Migration)

1. **Install Keplr:**
   - Install Keplr browser extension
   - Create or import wallet
   - Add Osmosis Testnet

2. **Get Testnet Tokens:**
   - Visit https://faucet.testnet.osmosis.zone/
   - Connect wallet and request tokens

3. **Connect to App:**
   - Click "Connect Keplr"
   - Approve connection
   - See osmo1... address and OSMO balance

4. **Test Agent Controls:**
   - Start/stop agents from UI
   - Configure settings (scan interval, thresholds)
   - Monitor real-time updates

## Keplr Wallet Setup

### Installation

1. **Chrome/Brave:** https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap
2. **Firefox:** https://addons.mozilla.org/en-US/firefox/addon/keplr/

### Adding Osmosis Testnet

If not automatically detected, add manually:

```javascript
await window.keplr.experimentalSuggestChain({
  chainId: 'osmo-test-5',
  chainName: 'Osmosis Testnet',
  rpc: 'https://rpc.osmotest5.osmosis.zone',
  rest: 'https://lcd.osmotest5.osmosis.zone',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'osmo',
    bech32PrefixAccPub: 'osmopub',
    bech32PrefixValAddr: 'osmovaloper',
    bech32PrefixValPub: 'osmovaloperpub',
    bech32PrefixConsAddr: 'osmovalcons',
    bech32PrefixConsPub: 'osmovalconspub',
  },
  currencies: [{
    coinDenom: 'OSMO',
    coinMinimalDenom: 'uosmo',
    coinDecimals: 6,
  }],
  feeCurrencies: [{
    coinDenom: 'OSMO',
    coinMinimalDenom: 'uosmo',
    coinDecimals: 6,
  }],
  stakeCurrency: {
    coinDenom: 'OSMO',
    coinMinimalDenom: 'uosmo',
    coinDecimals: 6,
  },
});
```

## Security Improvements

### Before (Ethereum)

❌ Private keys stored in `.env` file  
❌ Backend signs transactions directly  
❌ Keys could be leaked via logs or errors  
❌ No user consent per transaction  

### After (Cosmos)

✅ No private keys in backend  
✅ Keplr wallet handles all signing  
✅ User approves every transaction  
✅ Keys never leave browser extension  

## Common Issues

### Issue: "Cannot connect to Osmosis RPC"

**Solution:**
- Check `COSMOS_RPC_URL` in `.env`
- Verify internet connection
- Try alternative RPC: https://rpc.testnet.osmosis.zone

### Issue: "Insufficient balance"

**Solution:**
- Visit https://faucet.testnet.osmosis.zone/
- Request testnet tokens
- Wait ~10 seconds

### Issue: "Keplr not detected"

**Solution:**
- Install Keplr browser extension
- Refresh page after installation
- Check browser console for errors

### Issue: "Transaction simulation failed"

**Solution:**
- Check wallet balance (need OSMO for gas)
- Verify chain ID matches `osmo-test-5`
- Ensure RPC endpoint is responsive

## Migration Checklist

### Backend ✅ COMPLETE

- [x] Update environment configuration
- [x] Install CosmJS packages
- [x] Update type definitions
- [x] Create CosmosWalletTool
- [x] Migrate ExecutorAgent
- [x] Update RiskAgent
- [x] Update ScannerAgent
- [x] Update RiskCheckerTool
- [x] Remove executorWallet.ts
- [x] Update index.ts
- [x] Fix compilation errors
- [x] Test build

### Frontend ❌ PENDING

- [ ] Install Keplr dependencies
- [ ] Update useWallet hook
- [ ] Update WalletButton component
- [ ] Add Keplr type definitions
- [ ] Test wallet connection
- [ ] Add agent control endpoints
- [ ] Create settings panel
- [ ] Update documentation

### Documentation ❌ PENDING

- [ ] Update README.md
- [ ] Update QUICKSTART.md
- [ ] Update FRONTEND-GUIDE.md
- [ ] Create KEPLR-SETUP.md
- [ ] Archive Ethereum docs

## Next Steps

1. **Complete Frontend Migration:**
   - Replace MetaMask with Keplr
   - Update wallet connection logic
   - Test on Osmosis testnet

2. **Add Agent Controls:**
   - Backend API endpoints for start/stop
   - Frontend UI for agent management
   - Settings configuration panel

3. **Testing:**
   - End-to-end testing with real Keplr wallet
   - Test all agent interactions
   - Verify gas calculations

4. **Documentation:**
   - Update all docs to reflect Cosmos
   - Add Keplr setup guide
   - Create video walkthrough

## Resources

- **CosmJS Documentation:** https://cosmos.github.io/cosmjs/
- **Keplr Documentation:** https://docs.keplr.app/
- **Osmosis Testnet:** https://docs.osmosis.zone/
- **Cosmos SDK:** https://docs.cosmos.network/
- **Osmosis Explorer:** https://testnet.mintscan.io/osmosis-testnet

## Support

If you encounter issues:

1. Check this migration guide
2. Verify environment configuration
3. Test with Osmosis testnet faucet
4. Check Keplr wallet connection
5. Review browser console for errors

---

**Migration Date:** 2024
**Previous Version:** Ethereum Sepolia
**Current Version:** Osmosis Testnet (osmo-test-5)
