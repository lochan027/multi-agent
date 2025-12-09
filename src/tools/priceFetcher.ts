/**
 * PriceFetcher Tool - Fetches token prices from CoinGecko and DexScreener APIs
 * 
 * This tool is used by the ScannerAgent to retrieve real-time token prices
 * and calculate potential arbitrage opportunities.
 */

import axios, { AxiosInstance } from 'axios';
import { PriceData, TokenInfo } from '../types';

export class PriceFetcherTool {
  private coingeckoClient: AxiosInstance;
  private dexscreenerClient: AxiosInstance;
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    
    // Initialize CoinGecko API client
    this.coingeckoClient = axios.create({
      baseURL: 'https://api.coingecko.com/api/v3',
      timeout: 10000,
      headers: apiKey ? { 'x-cg-pro-api-key': apiKey } : {}
    });

    // Initialize DexScreener API client (rate limit: 300 req/min for most endpoints)
    this.dexscreenerClient = axios.create({
      baseURL: 'https://api.dexscreener.com',
      timeout: 10000
    });
  }

  /**
   * Fetch token price from CoinGecko
   */
  private async fetchFromCoinGecko(tokenSymbol: string): Promise<number | null> {
    try {
      const response = await this.coingeckoClient.get('/simple/price', {
        params: {
          ids: tokenSymbol.toLowerCase(),
          vs_currencies: 'usd'
        }
      });

      const price = response.data[tokenSymbol.toLowerCase()]?.usd;
      return price || null;
    } catch (error) {
      console.error(`CoinGecko fetch error for ${tokenSymbol}:`, error);
      return null;
    }
  }

  /**
   * Fetch token price from DexScreener by token address
   * Uses GET /latest/dex/tokens/{tokenAddress} endpoint
   * Rate limit: 300 requests per minute
   */
  private async fetchFromDexScreener(tokenAddress: string, chainId: string = 'ethereum'): Promise<number | null> {
    try {
      // API endpoint: /latest/dex/tokens/{tokenAddress}
      const response = await this.dexscreenerClient.get(`/latest/dex/tokens/${tokenAddress}`);
      
      if (response.data.pairs && response.data.pairs.length > 0) {
        // Filter pairs by chain if specified, otherwise get most liquid pair
        const filteredPairs = chainId 
          ? response.data.pairs.filter((pair: any) => pair.chainId === chainId)
          : response.data.pairs;

        if (filteredPairs.length === 0) {
          return null;
        }

        // Get pair with highest liquidity
        const mostLiquidPair = filteredPairs.reduce((prev: any, current: any) => 
          (current.liquidity?.usd || 0) > (prev.liquidity?.usd || 0) ? current : prev
        );

        return parseFloat(mostLiquidPair.priceUsd) || null;
      }
      
      return null;
    } catch (error) {
      console.error(`DexScreener fetch error for ${tokenAddress}:`, error);
      return null;
    }
  }

  /**
   * Search for token pairs on DexScreener
   * Uses GET /latest/dex/search?q={query} endpoint
   * Rate limit: 300 requests per minute
   */
  public async searchPairs(query: string): Promise<any[]> {
    try {
      const response = await this.dexscreenerClient.get('/latest/dex/search', {
        params: { q: query }
      });

      return response.data.pairs || [];
    } catch (error) {
      console.error(`DexScreener search error for ${query}:`, error);
      return [];
    }
  }

  /**
   * Get pools for a specific token on a specific chain
   * Uses GET /latest/dex/pairs/{chainId}/{pairAddress} endpoint
   * Rate limit: 300 requests per minute
   */
  public async getPairInfo(chainId: string, pairAddress: string): Promise<any | null> {
    try {
      const response = await this.dexscreenerClient.get(`/latest/dex/pairs/${chainId}/${pairAddress}`);
      
      if (response.data.pairs && response.data.pairs.length > 0) {
        return response.data.pairs[0];
      }
      
      return null;
    } catch (error) {
      console.error(`DexScreener pair info error for ${chainId}/${pairAddress}:`, error);
      return null;
    }
  }

  /**
   * Create token info with real Ethereum mainnet addresses
   */
  private createTokenInfo(symbol: string): TokenInfo {
    // Real Ethereum mainnet token addresses
    const tokenAddresses: Record<string, string> = {
      'ethereum': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      'bitcoin': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
      'uniswap': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
      'chainlink': '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
      'aave': '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
      'usdc': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      'usdt': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      'dai': '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI
    };

    return {
      symbol: symbol.toUpperCase(),
      address: tokenAddresses[symbol.toLowerCase()] || '0x0000000000000000000000000000000000000000',
      name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
      decimals: 18
    };
  }

  /**
   * Fetch prices for a token pair with fallback to DexScreener
   * Primary: CoinGecko API
   * Fallback: DexScreener API
   */
  public async fetchPrices(
    tokenASymbol: string,
    tokenBSymbol: string,
    useDexScreenerFallback: boolean = true
  ): Promise<PriceData | null> {
    try {
      console.log(`Fetching prices for ${tokenASymbol}/${tokenBSymbol}...`);

      // Try CoinGecko first
      const [priceA, priceB] = await Promise.all([
        this.fetchFromCoinGecko(tokenASymbol),
        this.fetchFromCoinGecko(tokenBSymbol)
      ]);

      if (priceA && priceB) {
        // Calculate exchange rate (how many B tokens per 1 A token)
        const exchangeRate = priceA / priceB;

        const priceData: PriceData = {
          tokenA: this.createTokenInfo(tokenASymbol),
          tokenB: this.createTokenInfo(tokenBSymbol),
          priceA,
          priceB,
          exchangeRate,
          timestamp: Date.now(),
          source: 'coingecko'
        };

        console.log(`✓ Fetched: ${tokenASymbol}=$${priceA.toFixed(2)}, ${tokenBSymbol}=$${priceB.toFixed(2)}`);
        return priceData;
      }

      // If CoinGecko fails and fallback is enabled, try DexScreener
      if (useDexScreenerFallback) {
        console.log(`CoinGecko failed, trying DexScreener...`);
        
        const tokenAInfo = this.createTokenInfo(tokenASymbol);
        const tokenBInfo = this.createTokenInfo(tokenBSymbol);

        const [dexPriceA, dexPriceB] = await Promise.all([
          this.fetchFromDexScreener(tokenAInfo.address),
          this.fetchFromDexScreener(tokenBInfo.address)
        ]);

        if (dexPriceA && dexPriceB) {
          const exchangeRate = dexPriceA / dexPriceB;

          const priceData: PriceData = {
            tokenA: tokenAInfo,
            tokenB: tokenBInfo,
            priceA: dexPriceA,
            priceB: dexPriceB,
            exchangeRate,
            timestamp: Date.now(),
            source: 'dexscreener'
          };

          console.log(`✓ Fetched (DexScreener): ${tokenASymbol}=$${dexPriceA.toFixed(2)}, ${tokenBSymbol}=$${dexPriceB.toFixed(2)}`);
          return priceData;
        }
      }

      console.warn(`Failed to fetch prices for ${tokenASymbol}/${tokenBSymbol}`);
      return null;
    } catch (error) {
      console.error(`Error fetching prices for ${tokenASymbol}/${tokenBSymbol}:`, error);
      return null;
    }
  }

  /**
   * Fetch prices for multiple token pairs
   */
  public async fetchMultiplePrices(
    tokenPairs: Array<{ tokenASymbol: string; tokenBSymbol: string }>
  ): Promise<PriceData[]> {
    const pricePromises = tokenPairs.map(pair =>
      this.fetchPrices(pair.tokenASymbol, pair.tokenBSymbol)
    );

    const results = await Promise.all(pricePromises);
    
    // Filter out null results
    return results.filter((price): price is PriceData => price !== null);
  }

  /**
   * Mock price fetcher for testing without API calls
   */
  public async fetchMockPrices(
    tokenASymbol: string,
    tokenBSymbol: string
  ): Promise<PriceData> {
    // Mock prices with some randomization for testing
    const mockPrices: Record<string, number> = {
      ethereum: 2000 + Math.random() * 100,
      bitcoin: 40000 + Math.random() * 1000,
      uniswap: 5 + Math.random() * 1,
      chainlink: 15 + Math.random() * 2,
      aave: 100 + Math.random() * 10
    };

    const priceA = mockPrices[tokenASymbol.toLowerCase()] || 1;
    const priceB = mockPrices[tokenBSymbol.toLowerCase()] || 1;

    return {
      tokenA: this.createTokenInfo(tokenASymbol),
      tokenB: this.createTokenInfo(tokenBSymbol),
      priceA,
      priceB,
      exchangeRate: priceA / priceB,
      timestamp: Date.now(),
      source: 'mock'
    };
  }
}
