/**
 * RiskTask - Task for assessing risk and profitability of arbitrage opportunities
 * 
 * This task receives detected opportunities from the ScannerAgent and performs
 * comprehensive risk analysis including gas costs, slippage, and net profitability.
 */

import { ArbitrageOpportunity, RiskAssessment } from '../types';

export interface RiskTaskInput {
  /**
   * The arbitrage opportunity to assess
   */
  opportunity: ArbitrageOpportunity;
  
  /**
   * Trade amount in USD
   */
  tradeAmountUSD: number;
  
  /**
   * Current gas price in Gwei
   */
  gasPriceGwei: number;
  
  /**
   * Maximum acceptable slippage (percentage)
   */
  maxSlippage: number;
  
  /**
   * Minimum profit threshold to approve (percentage)
   */
  minProfitThreshold: number;
}

export interface RiskTaskOutput {
  /**
   * The risk assessment result
   */
  assessment: RiskAssessment;
  
  /**
   * Whether the opportunity is approved for execution
   */
  approved: boolean;
  
  /**
   * Original opportunity data
   */
  opportunity: ArbitrageOpportunity;
  
  /**
   * Recommended trade parameters if approved
   */
  tradeParams?: {
    amountIn: string;
    minAmountOut: string;
    maxGasPrice: string;
  };
}

export class RiskTask {
  public readonly taskName = 'RiskTask';

  /**
   * Validate input data
   */
  public validateInput(input: RiskTaskInput): boolean {
    if (!input.opportunity) {
      throw new Error('Opportunity data is required');
    }
    
    if (input.tradeAmountUSD <= 0) {
      throw new Error('Trade amount must be positive');
    }
    
    if (input.gasPriceGwei <= 0) {
      throw new Error('Gas price must be positive');
    }
    
    if (input.maxSlippage < 0 || input.maxSlippage > 1) {
      throw new Error('Max slippage must be between 0 and 1');
    }
    
    if (input.minProfitThreshold < 0) {
      throw new Error('Min profit threshold must be non-negative');
    }
    
    return true;
  }

  /**
   * Execute the risk assessment task
   * This will be called by the RiskAgent
   */
  public async run(input: RiskTaskInput): Promise<RiskTaskOutput> {
    this.validateInput(input);
    
    // The actual execution logic will be implemented by the agent
    // This is just the task definition
    const assessment: RiskAssessment = {
      approved: false,
      estimatedGas: 0,
      gasPrice: input.gasPriceGwei,
      gasCostUSD: 0,
      slippage: 0,
      netProfit: 0,
      profitMargin: 0,
      riskLevel: 'high',
      reason: 'Not yet assessed'
    };
    
    return {
      assessment,
      approved: false,
      opportunity: input.opportunity
    };
  }
}
