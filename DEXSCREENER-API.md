# DexScreener API Integration Guide

## Overview

This project integrates [DexScreener API](https://docs.dexscreener.com/api/reference) as a fallback price source for token prices when CoinGecko API fails or is rate-limited.

## API Information

- **Base URL**: `https://api.dexscreener.com`
- **Authentication**: None required (public API)
- **Rate Limits**:
  - Search/Pairs/Tokens endpoints: **300 requests/minute**
  - Profile/Boost endpoints: **60 requests/minute**

## Implemented Endpoints

### 1. Get Token Pairs by Address
```typescript
GET /latest/dex/tokens/{tokenAddress}
```

**Purpose**: Fetch all trading pairs for a specific token across all supported DEXs and chains.

**Usage in Project**:
```typescript
const priceFetcher = new PriceFetcherTool();
const price = await priceFetcher.fetchFromDexScreener(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
);
```

**Response Structure**:
```json
{
  "schemaVersion": "1.0.0",
  "pairs": [
    {
      "chainId": "ethereum",
      "dexId": "uniswap",
      "url": "https://dexscreener.com/ethereum/...",
      "pairAddress": "0x...",
      "baseToken": {
        "address": "0x...",
        "name": "Wrapped Ether",
        "symbol": "WETH"
      },
      "quoteToken": {
        "address": "0x...",
        "name": "USD Coin",
        "symbol": "USDC"
      },
      "priceNative": "1.0",
      "priceUsd": "3100.50",
      "txns": {
        "h24": {
          "buys": 1234,
          "sells": 1100
        }
      },
      "volume": {
        "h24": 5000000
      },
      "priceChange": {
        "h24": 2.5
      },
      "liquidity": {
        "usd": 10000000,
        "base": 3226,
        "quote": 10000000
      },
      "fdv": 100000000,
      "marketCap": 80000000,
      "pairCreatedAt": 1622505600000
    }
  ]
}
```

### 2. Search for Pairs
```typescript
GET /latest/dex/search?q={query}
```

**Purpose**: Search for trading pairs by token symbol, name, or pair address.

**Usage in Project**:
```typescript
const pairs = await priceFetcher.searchPairs('ETH/USDC');
```

**Example Queries**:
- `"ETH/USDC"` - Find ETH/USDC pairs
- `"PEPE"` - Find all pairs with PEPE token
- `"0x..."` - Search by token address

### 3. Get Specific Pair Information
```typescript
GET /latest/dex/pairs/{chainId}/{pairAddress}
```

**Purpose**: Get detailed information about a specific trading pair.

**Usage in Project**:
```typescript
const pairInfo = await priceFetcher.getPairInfo(
  'ethereum',
  '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640' // USDC/WETH on Uniswap V3
);
```

**Supported Chain IDs**:
- `ethereum` - Ethereum mainnet
- `bsc` - Binance Smart Chain
- `polygon` - Polygon
- `arbitrum` - Arbitrum
- `optimism` - Optimism
- `avalanche` - Avalanche
- `base` - Base
- `solana` - Solana
- And many more...

## Implementation Details

### PriceFetcherTool Class

The `PriceFetcherTool` class in `src/tools/priceFetcher.ts` implements DexScreener integration:

```typescript
class PriceFetcherTool {
  private dexscreenerClient: AxiosInstance;

  constructor() {
    this.dexscreenerClient = axios.create({
      baseURL: 'https://api.dexscreener.com',
      timeout: 10000
    });
  }

  // Fetches price from DexScreener by token address
  private async fetchFromDexScreener(
    tokenAddress: string, 
    chainId: string = 'ethereum'
  ): Promise<number | null>

  // Search for pairs matching query
  public async searchPairs(query: string): Promise<any[]>

  // Get specific pair information
  public async getPairInfo(
    chainId: string, 
    pairAddress: string
  ): Promise<any | null>
}
```

### Fallback Strategy

The system uses a cascading fallback approach:

1. **Primary**: CoinGecko API (centralized, reliable)
2. **Fallback**: DexScreener API (DEX aggregator, real-time)
3. **Testing**: Mock prices (for development without API calls)

```typescript
// Automatic fallback in fetchPrices()
const priceData = await priceFetcher.fetchPrices(
  'ethereum',
  'uniswap',
  true // Enable DexScreener fallback
);
```

### Liquidity-Based Selection

When multiple pairs exist for a token, the system selects the **most liquid pair**:

```typescript
const mostLiquidPair = pairs.reduce((prev, current) => 
  (current.liquidity?.usd || 0) > (prev.liquidity?.usd || 0) 
    ? current 
    : prev
);
```

This ensures price accuracy by using the most actively traded pairs.

## Token Address Mapping

Real Ethereum mainnet token addresses used in the system:

| Symbol | Name | Address |
|--------|------|---------|
| WETH | Wrapped Ether | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |
| WBTC | Wrapped Bitcoin | `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599` |
| UNI | Uniswap | `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984` |
| LINK | Chainlink | `0x514910771AF9Ca656af840dff83E8264EcF986CA` |
| AAVE | Aave | `0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9` |
| USDC | USD Coin | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| USDT | Tether | `0xdAC17F958D2ee523a2206206994597C13D831ec7` |
| DAI | Dai Stablecoin | `0x6B175474E89094C44Da98b954EedeAC495271d0F` |

## Rate Limit Handling

### Current Limits
- **DexScreener**: 300 requests/minute for price endpoints
- **CoinGecko Free**: 30 requests/minute
- **CoinGecko Pro**: Up to 500 requests/minute

### Best Practices

1. **Respect Rate Limits**:
   ```typescript
   // Built-in delay between scans
   SCAN_INTERVAL_MS=20000  // 20 seconds
   ```

2. **Cache Results**:
   ```typescript
   // Store prices temporarily to reduce API calls
   const cachedPrice = priceCache.get(tokenSymbol);
   if (cachedPrice && Date.now() - cachedPrice.timestamp < 60000) {
     return cachedPrice;
   }
   ```

3. **Handle Errors Gracefully**:
   ```typescript
   try {
     const price = await fetchFromDexScreener(address);
   } catch (error) {
     if (error.response?.status === 429) {
       // Rate limit hit - wait and retry
       await delay(60000);
     }
   }
   ```

## Advanced Usage

### Multi-Chain Price Comparison

```typescript
// Compare prices across different chains
const ethereumPrice = await fetchFromDexScreener(tokenAddress, 'ethereum');
const polygonPrice = await fetchFromDexScreener(tokenAddress, 'polygon');
const arbitrumPrice = await fetchFromDexScreener(tokenAddress, 'arbitrum');

// Find best price
const bestPrice = Math.min(ethereumPrice, polygonPrice, arbitrumPrice);
```

### Volume-Weighted Price

```typescript
const pairs = await searchPairs('WETH');

// Calculate volume-weighted average price
const totalVolume = pairs.reduce((sum, p) => sum + (p.volume?.h24 || 0), 0);
const vwap = pairs.reduce((sum, p) => {
  const weight = (p.volume?.h24 || 0) / totalVolume;
  return sum + (parseFloat(p.priceUsd) * weight);
}, 0);
```

### Detecting Arbitrage Across DEXs

```typescript
const pairs = await searchPairs('USDC/WETH');

// Group by DEX
const uniswapPair = pairs.find(p => p.dexId === 'uniswap');
const sushiswapPair = pairs.find(p => p.dexId === 'sushiswap');

// Calculate arbitrage opportunity
const priceDiff = Math.abs(
  parseFloat(uniswapPair.priceUsd) - parseFloat(sushiswapPair.priceUsd)
);
const arbitragePercent = (priceDiff / parseFloat(uniswapPair.priceUsd)) * 100;

if (arbitragePercent > MIN_PROFIT_THRESHOLD) {
  console.log(`Arbitrage opportunity: ${arbitragePercent.toFixed(2)}%`);
}
```

## Response Field Reference

### Pair Object

| Field | Type | Description |
|-------|------|-------------|
| `chainId` | string | Blockchain identifier (ethereum, bsc, etc.) |
| `dexId` | string | DEX identifier (uniswap, sushiswap, etc.) |
| `pairAddress` | string | Smart contract address of the pair |
| `baseToken` | object | Base token information (address, name, symbol) |
| `quoteToken` | object | Quote token information (address, name, symbol) |
| `priceNative` | string | Price in native blockchain token |
| `priceUsd` | string | Price in USD |
| `txns` | object | Transaction counts (buys/sells for different timeframes) |
| `volume` | object | Trading volume for different timeframes (h24, h6, h1, m5) |
| `priceChange` | object | Price change percentage for different timeframes |
| `liquidity.usd` | number | Total liquidity in USD |
| `liquidity.base` | number | Base token liquidity |
| `liquidity.quote` | number | Quote token liquidity |
| `fdv` | number | Fully diluted valuation |
| `marketCap` | number | Market capitalization |
| `pairCreatedAt` | number | Pair creation timestamp (Unix) |

## Error Handling

### Common Error Scenarios

1. **Rate Limit Exceeded (429)**:
   ```json
   {
     "error": "Too Many Requests",
     "message": "Rate limit exceeded"
   }
   ```
   **Solution**: Wait 60 seconds before retrying

2. **Token Not Found (404)**:
   ```json
   {
     "pairs": []
   }
   ```
   **Solution**: Fallback to CoinGecko or use mock prices

3. **Network Timeout**:
   ```typescript
   Error: timeout of 10000ms exceeded
   ```
   **Solution**: Retry with exponential backoff

### Error Handling Implementation

```typescript
private async fetchFromDexScreener(
  tokenAddress: string,
  chainId: string = 'ethereum',
  retries: number = 3
): Promise<number | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await this.dexscreenerClient.get(
        `/latest/dex/tokens/${tokenAddress}`
      );
      
      if (response.data.pairs?.length > 0) {
        // Success - return price
        return this.selectBestPrice(response.data.pairs, chainId);
      }
      
      return null;
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limit - wait exponentially
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (i === retries - 1) {
        console.error(`DexScreener fetch failed after ${retries} retries`);
        return null;
      }
    }
  }
  
  return null;
}
```

## Testing

### Manual Testing

```bash
# Test DexScreener integration
npm run dev

# Should see in logs:
# "Fetching prices for ethereum/uniswap..."
# "✓ Fetched (DexScreener): ethereum=$3100.50, uniswap=$5.75"
```

### Test Specific Token

```typescript
const priceFetcher = new PriceFetcherTool();

// Test WETH price
const wethPrice = await priceFetcher.fetchFromDexScreener(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
);
console.log(`WETH Price: $${wethPrice}`);

// Test search
const pairs = await priceFetcher.searchPairs('WETH/USDC');
console.log(`Found ${pairs.length} WETH/USDC pairs`);
```

## Monitoring

### Key Metrics to Track

1. **API Success Rate**: Percentage of successful DexScreener requests
2. **Fallback Usage**: How often DexScreener is used vs CoinGecko
3. **Response Times**: Average latency for DexScreener API calls
4. **Rate Limit Hits**: Number of 429 errors received

### Logging Example

```typescript
console.log(`
Price Fetch Statistics:
  CoinGecko Success: ${coingeckoSuccess}/${totalRequests}
  DexScreener Success: ${dexscreenerSuccess}/${totalRequests}
  Fallback Rate: ${(dexscreenerSuccess/totalRequests * 100).toFixed(1)}%
  Average Response Time: ${avgResponseTime}ms
`);
```

## Resources

- **Official Documentation**: https://docs.dexscreener.com/api/reference
- **Rate Limits**: https://docs.dexscreener.com/api
- **Supported Chains**: https://dexscreener.com/
- **API Status**: No official status page (monitor via Discord)

## Support

For issues with DexScreener API:
- Check documentation: https://docs.dexscreener.com/
- Discord: https://discord.gg/dexscreener
- Twitter: [@dexscreener](https://twitter.com/dexscreener)

For issues with this integration:
- Check project README.md
- Review error logs in console
- Verify token addresses are correct
- Ensure rate limits are not exceeded
