/**
 * RiskChecker Tool - Analyzes risk and profitability of arbitrage opportunities
 * 
 * This tool calculates gas costs, slippage impact, and net profitability
 * to determine whether an opportunity should be executed.
 */

import { ArbitrageOpportunity, RiskAssessment } from '../types';

export interface RiskCheckParams {
  opportunity: ArbitrageOpportunity;
  tradeAmountUSD: number;
  gasPriceGwei: number;
  maxSlippage: number;
  minProfitThreshold: number;
}

export class RiskCheckerTool {
  private seiPriceUSD: number;

  constructor(seiPriceUSD: number = 1.0) {
    this.seiPriceUSD = seiPriceUSD;
  }

  /**
   * Update SEI price for gas cost calculations
   */
  public updateSeiPrice(priceUSD: number): void {
    this.seiPriceUSD = priceUSD;
  }

  /**
   * Estimate gas cost for a typical Cosmos transaction (MsgSend)
   */
  private estimateGasCost(gasPrice: number): { gasUnits: number; costUSD: number } {
    // Typical gas usage for MsgSend on Osmosis
    const estimatedGasUnits = 75000; // Conservative estimate for MsgSend
    
    // Calculate cost in uosmo (micro-osmo)
    const gasCostUsei = gasPrice * estimatedGasUnits;
    
    // Convert usei to SEI (1 SEI = 1,000,000 usei)
    const gasCostSei = gasCostUsei / 1_000_000;
    
    // Convert to USD
    const gasCostUSD = gasCostSei * this.seiPriceUSD;

    return {
      gasUnits: estimatedGasUnits,
      costUSD: gasCostUSD
    };
  }

  /**
   * Calculate slippage impact on trade
   */
  private calculateSlippage(tradeAmountUSD: number, priceDifference: number): number {
    // Estimate slippage based on trade size and liquidity
    // This is a simplified model - real implementations would query liquidity pools
    
    const baseSlippage = 0.001; // 0.1% base slippage
    const liquidityFactor = Math.min(tradeAmountUSD / 100000, 0.005); // Up to 0.5% for very large trades
    
    return baseSlippage + liquidityFactor;
  }

  /**
   * Determine risk level based on various factors
   */
  private assessRiskLevel(
    profitMargin: number,
    slippage: number,
    priceDifference: number
  ): 'low' | 'medium' | 'high' {
    // High risk if:
    // - Profit margin is low (< 1%)
    // - High slippage (> 2%)
    // - Small price difference (< 2%)
    if (profitMargin < 0.01 || slippage > 0.02 || priceDifference < 0.02) {
      return 'high';
    }
    
    // Medium risk if:
    // - Profit margin is moderate (1-3%)
    // - Moderate slippage (1-2%)
    if (profitMargin < 0.03 || slippage > 0.01) {
      return 'medium';
    }
    
    // Low risk otherwise
    return 'low';
  }

  /**
   * Perform comprehensive risk assessment
   */
  public async assessRisk(params: RiskCheckParams): Promise<RiskAssessment> {
    const { opportunity, tradeAmountUSD, gasPriceGwei, maxSlippage, minProfitThreshold } = params;

    console.log(`\n🔍 Assessing risk for opportunity...`);
    console.log(`   Trade Amount: $${tradeAmountUSD.toFixed(2)}`);
    console.log(`   Potential Profit: ${(opportunity.potentialProfit * 100).toFixed(2)}%`);

    // Calculate gas costs
    const gasCost = this.estimateGasCost(gasPriceGwei);
    console.log(`   Estimated Gas Cost: $${gasCost.costUSD.toFixed(2)}`);

    // Calculate slippage
    const estimatedSlippage = this.calculateSlippage(tradeAmountUSD, opportunity.priceDifference);
    console.log(`   Estimated Slippage: ${(estimatedSlippage * 100).toFixed(2)}%`);

    // Check if slippage exceeds maximum
    if (estimatedSlippage > maxSlippage) {
      return {
        approved: false,
        estimatedGas: gasCost.gasUnits,
        gasPrice: gasPriceGwei,
        gasCostUSD: gasCost.costUSD,
        slippage: estimatedSlippage,
        netProfit: 0,
        profitMargin: 0,
        riskLevel: 'high',
        reason: `Slippage (${(estimatedSlippage * 100).toFixed(2)}%) exceeds maximum (${(maxSlippage * 100).toFixed(2)}%)`
      };
    }

    // Calculate gross profit in USD
    const grossProfitUSD = tradeAmountUSD * opportunity.potentialProfit;
    
    // Calculate slippage cost
    const slippageCostUSD = tradeAmountUSD * estimatedSlippage;
    
    // Calculate net profit
    const netProfitUSD = grossProfitUSD - gasCost.costUSD - slippageCostUSD;
    const profitMargin = netProfitUSD / tradeAmountUSD;

    console.log(`   Gross Profit: $${grossProfitUSD.toFixed(2)}`);
    console.log(`   Slippage Cost: $${slippageCostUSD.toFixed(2)}`);
    console.log(`   Net Profit: $${netProfitUSD.toFixed(2)}`);
    console.log(`   Profit Margin: ${(profitMargin * 100).toFixed(2)}%`);

    // Assess risk level
    const riskLevel = this.assessRiskLevel(
      profitMargin,
      estimatedSlippage,
      opportunity.priceDifference
    );

    // Check if profit meets minimum threshold
    const approved = profitMargin >= minProfitThreshold && netProfitUSD > 0;

    const reason = approved
      ? `Profitable: Net profit $${netProfitUSD.toFixed(2)} (${(profitMargin * 100).toFixed(2)}%)`
      : profitMargin < minProfitThreshold
      ? `Profit margin (${(profitMargin * 100).toFixed(2)}%) below threshold (${(minProfitThreshold * 100).toFixed(2)}%)`
      : 'Net profit is negative after costs';

    console.log(`   Risk Level: ${riskLevel.toUpperCase()}`);
    console.log(`   Decision: ${approved ? '✓ APPROVED' : '✗ REJECTED'}`);
    console.log(`   Reason: ${reason}`);

    return {
      approved,
      estimatedGas: gasCost.gasUnits,
      gasPrice: gasPriceGwei,
      gasCostUSD: gasCost.costUSD,
      slippage: estimatedSlippage,
      netProfit: netProfitUSD,
      profitMargin,
      riskLevel,
      reason
    };
  }

  /**
   * Quick check if opportunity is worth deeper analysis
   */
  public quickCheck(opportunity: ArbitrageOpportunity, minProfit: number): boolean {
    // Quick filter: only proceed if potential profit exceeds minimum
    return opportunity.potentialProfit >= minProfit;
  }
}
