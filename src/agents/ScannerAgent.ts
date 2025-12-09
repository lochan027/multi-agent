/**
 * ScannerAgent - Continuously scans token prices and detects arbitrage opportunities
 * 
 * This agent:
 * 1. Fetches token prices from external APIs using PriceFetcherTool
 * 2. Analyzes price differences to identify arbitrage opportunities
 * 3. Emits RiskTask events for profitable opportunities
 */

import { PriceFetcherTool } from '../tools/priceFetcher';
import { ScanTaskInput, ScanTaskOutput } from '../tasks/ScanTask';
import { RiskTaskInput } from '../tasks/RiskTask';
import { ArbitrageOpportunity, PriceData, Config } from '../types';

export class ScannerAgent {
  private name = 'ScannerAgent';
  private priceFetcher: PriceFetcherTool;
  private config: Config;
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private onRiskTaskEmit?: (taskInput: RiskTaskInput) => void;

  constructor(config: Config) {
    this.config = config;
    this.priceFetcher = new PriceFetcherTool(config.coingeckoApiKey);
    
    console.log(`\n🔍 ${this.name} initialized`);
    console.log(`   Scan Interval: ${config.scanIntervalMs}ms`);
    console.log(`   Min Profit Threshold: ${(config.minProfitThreshold * 100).toFixed(2)}%`);
  }

  /**
   * Register callback for when RiskTask needs to be emitted
   */
  public onEmitRiskTask(callback: (taskInput: RiskTaskInput) => void): void {
    this.onRiskTaskEmit = callback;
  }

  /**
   * Analyze price data to detect arbitrage opportunities
   */
  private detectOpportunities(priceDataList: PriceData[]): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];

    for (const priceData of priceDataList) {
      // Calculate price difference percentage
      // We're looking for situations where buying tokenA and selling for tokenB yields profit
      const buyPrice = priceData.priceA;
      const sellPrice = priceData.priceB * priceData.exchangeRate;
      
      // Calculate potential profit (simplified model)
      const priceDifference = Math.abs(sellPrice - buyPrice) / buyPrice;
      const potentialProfit = (sellPrice - buyPrice) / buyPrice;

      // Only consider if profit exceeds minimum threshold
      if (potentialProfit > this.config.minProfitThreshold) {
        const opportunity: ArbitrageOpportunity = {
          tokenPair: {
            tokenA: priceData.tokenA,
            tokenB: priceData.tokenB
          },
          buyPrice,
          sellPrice,
          exchangeRate: priceData.exchangeRate,
          priceDifference,
          potentialProfit,
          timestamp: priceData.timestamp
        };

        opportunities.push(opportunity);
        
        console.log(`\n💡 Opportunity detected!`);
        console.log(`   Pair: ${priceData.tokenA.symbol}/${priceData.tokenB.symbol}`);
        console.log(`   Buy Price: $${buyPrice.toFixed(2)}`);
        console.log(`   Sell Price: $${sellPrice.toFixed(2)}`);
        console.log(`   Potential Profit: ${(potentialProfit * 100).toFixed(2)}%`);
      }
    }

    return opportunities;
  }

  /**
   * Execute a scan task
   */
  public async executeScanTask(input: ScanTaskInput): Promise<ScanTaskOutput> {
    console.log(`\n${this.name}: Starting scan of ${input.tokenPairs.length} token pairs...`);

    const errors: string[] = [];
    const priceDataList: PriceData[] = [];

    // Fetch prices for all token pairs
    for (const pair of input.tokenPairs) {
      try {
        const priceData = await this.priceFetcher.fetchPrices(
          pair.tokenASymbol,
          pair.tokenBSymbol
        );

        if (priceData) {
          priceDataList.push(priceData);
        } else {
          errors.push(`Failed to fetch prices for ${pair.tokenASymbol}/${pair.tokenBSymbol}`);
        }
      } catch (error) {
        const errorMsg = `Error fetching ${pair.tokenASymbol}/${pair.tokenBSymbol}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // Detect arbitrage opportunities
    const opportunities = this.detectOpportunities(priceDataList);

    console.log(`\n${this.name}: Scan complete`);
    console.log(`   Pairs scanned: ${priceDataList.length}/${input.tokenPairs.length}`);
    console.log(`   Opportunities found: ${opportunities.length}`);

    // Emit RiskTask for each opportunity
    if (opportunities.length > 0 && this.onRiskTaskEmit) {
      for (const opportunity of opportunities) {
        const riskTaskInput: RiskTaskInput = {
          opportunity,
          tradeAmountUSD: 1000, // Default trade amount
          gasPriceGwei: this.config.gasPrice || 0.025, // Cosmos gas price in usei
          maxSlippage: this.config.maxSlippage,
          minProfitThreshold: this.config.minProfitThreshold
        };

        console.log(`   → Emitting RiskTask for ${opportunity.tokenPair.tokenA.symbol}/${opportunity.tokenPair.tokenB.symbol}`);
        this.onRiskTaskEmit(riskTaskInput);
      }
    }

    return {
      opportunities,
      scanTimestamp: Date.now(),
      pairsScanned: priceDataList.length,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Start continuous scanning
   */
  public startScanning(tokenPairs: Array<{ tokenASymbol: string; tokenBSymbol: string }>): void {
    if (this.scanInterval) {
      console.log(`${this.name}: Already scanning`);
      return;
    }

    console.log(`\n${this.name}: Starting continuous scan...`);

    // Execute first scan immediately
    const input: ScanTaskInput = {
      tokenPairs,
      minPriceDifference: this.config.minProfitThreshold
    };
    
    this.executeScanTask(input).catch(error => {
      console.error(`${this.name}: Error in initial scan:`, error);
    });

    // Set up interval for continuous scanning
    this.scanInterval = setInterval(() => {
      this.executeScanTask(input).catch(error => {
        console.error(`${this.name}: Error in scan:`, error);
      });
    }, this.config.scanIntervalMs);
  }

  /**
   * Stop scanning
   */
  public stopScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
      console.log(`\n${this.name}: Stopped scanning`);
    }
  }

  /**
   * Get agent name
   */
  public getName(): string {
    return this.name;
  }
}
