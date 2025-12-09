/**
 * Type definitions for the multi-agent DeFi executor system
 */

/**
 * Token information structure
 */
export interface TokenInfo {
  symbol: string;
  address: string;
  name: string;
  decimals: number;
}

/**
 * Price data from external API
 */
export interface PriceData {
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  priceA: number; // Price in USD
  priceB: number; // Price in USD
  exchangeRate: number; // B per A
  timestamp: number;
  source: string; // 'coingecko' | 'dexscreener'
}

/**
 * Arbitrage opportunity detected by scanner
 */
export interface ArbitrageOpportunity {
  id?: string;
  tokenPair: {
    tokenA: TokenInfo;
    tokenB: TokenInfo;
  };
  buyPrice: number;
  sellPrice: number;
  exchangeRate: number;
  priceDifference: number;
  potentialProfit: number;
  timestamp: number;
  status?: 'detected' | 'assessing' | 'approved' | 'pending_approval' | 'executing' | 'completed' | 'failed' | 'rejected';
}

/**
 * Risk assessment result
 */
export interface RiskAssessment {
  approved: boolean;
  estimatedGas: number;
  gasPrice: number;
  gasCostUSD: number;
  slippage: number;
  netProfit: number;
  profitMargin: number;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
}

/**
 * Trade execution parameters
 */
export interface TradeParams {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  amountIn: string;
  minAmountOut: string;
  deadline: number;
  slippageTolerance: number;
}

/**
 * Trade execution result
 */
export interface ExecutionResult {
  success: boolean;
  txHash?: string;
  amountIn: string;
  amountOut?: string;
  gasUsed?: number;
  actualProfit?: number;
  actualProfitLoss?: number;
  error?: string;
  timestamp: number;
  simulated: boolean;
  result?: ExecutionResult;
}

/**
 * System statistics for monitoring
 */
export interface SystemStats {
  totalScans: number;
  opportunitiesDetected: number;
  opportunitiesApproved: number;
  executionsAttempted: number;
  executionsSuccessful: number;
  totalProfit: number;
  successRate: number;
  uptime: number;
}

/**
 * Configuration interface
 */
export interface Config {
  coingeckoApiKey?: string;
  dexscreenerApiKey?: string;
  cosmosRpcUrl: string;
  cosmosRestUrl: string;
  cosmosChainId: string;
  cosmosDenom: string;
  cosmosPrefix: string;
  scanIntervalMs: number;
  minProfitThreshold: number;
  maxSlippage: number;
  gasPrice: number;
}
