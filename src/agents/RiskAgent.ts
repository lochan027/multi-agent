/**
 * RiskAgent - Assesses risk and profitability of arbitrage opportunities
 * 
 * This agent:
 * 1. Receives RiskTask events from ScannerAgent
 * 2. Uses RiskCheckerTool to analyze gas costs, slippage, and profitability
 * 3. Emits ExecTask events for approved opportunities
 */

import { RiskCheckerTool } from '../tools/riskChecker';
import { RiskTaskInput, RiskTaskOutput } from '../tasks/RiskTask';
import { ExecTaskInput } from '../tasks/ExecTask';
import { Config, TradeParams } from '../types';

export class RiskAgent {
  private name = 'RiskAgent';
  private riskChecker: RiskCheckerTool;
  private config: Config;
  private onExecTaskEmit?: (taskInput: ExecTaskInput) => void;

  constructor(config: Config) {
    this.config = config;
    
    // Initialize with estimated SEI price (could be fetched from API)
    this.riskChecker = new RiskCheckerTool(1.0); // ~$1 USD per SEI
    
    console.log(`\n⚖️  ${this.name} initialized`);
    console.log(`   Max Slippage: ${(config.maxSlippage * 100).toFixed(2)}%`);
    console.log(`   Min Profit Threshold: ${(config.minProfitThreshold * 100).toFixed(2)}%`);
  }

  /**
   * Register callback for when ExecTask needs to be emitted
   */
  public onEmitExecTask(callback: (taskInput: ExecTaskInput) => void): void {
    this.onExecTaskEmit = callback;
  }

  /**
   * Update SEI price for gas calculations
   */
  public updateSeiPrice(priceUSD: number): void {
    this.riskChecker.updateSeiPrice(priceUSD);
  }

  /**
   * Execute a risk assessment task
   */
  public async executeRiskTask(input: RiskTaskInput): Promise<RiskTaskOutput> {
    console.log(`\n${this.name}: Assessing risk for opportunity...`);
    console.log(`   Token Pair: ${input.opportunity.tokenPair.tokenA.symbol}/${input.opportunity.tokenPair.tokenB.symbol}`);

    // Perform risk assessment
    const assessment = await this.riskChecker.assessRisk({
      opportunity: input.opportunity,
      tradeAmountUSD: input.tradeAmountUSD,
      gasPriceGwei: input.gasPriceGwei,
      maxSlippage: input.maxSlippage,
      minProfitThreshold: input.minProfitThreshold
    });

    const output: RiskTaskOutput = {
      assessment,
      approved: assessment.approved,
      opportunity: input.opportunity
    };

    // If approved, prepare trade parameters
    if (assessment.approved) {
      const amountInSei = input.tradeAmountUSD / input.opportunity.buyPrice;
      const amountIn = amountInSei.toFixed(18);
      
      // Calculate minimum output with slippage tolerance
      const idealOutput = amountInSei * input.opportunity.exchangeRate;
      const minOutput = idealOutput * (1 - input.maxSlippage);
      const minAmountOut = minOutput.toFixed(18);
      
      // Set deadline to 20 minutes from now
      const deadline = Math.floor(Date.now() / 1000) + 1200;
      
      output.tradeParams = {
        amountIn,
        minAmountOut,
        maxGasPrice: input.gasPriceGwei.toString() // Gas price in usei
      };

      console.log(`\n${this.name}: Trade approved!`);
      console.log(`   Amount In: ${amountIn} ${input.opportunity.tokenPair.tokenA.symbol}`);
      console.log(`   Min Amount Out: ${minAmountOut} ${input.opportunity.tokenPair.tokenB.symbol}`);
      console.log(`   Expected Net Profit: $${assessment.netProfit.toFixed(2)}`);

      // Emit ExecTask
      if (this.onExecTaskEmit) {
        const execTaskInput: ExecTaskInput = {
          opportunity: input.opportunity,
          tradeParams: {
            fromToken: input.opportunity.tokenPair.tokenA,
            toToken: input.opportunity.tokenPair.tokenB,
            amountIn,
            minAmountOut,
            deadline,
            slippageTolerance: input.maxSlippage
          },
          expectedProfit: assessment.netProfit,
          maxGasPrice: input.gasPriceGwei
        };

        console.log(`   → Emitting ExecTask`);
        this.onExecTaskEmit(execTaskInput);
      }
    } else {
      console.log(`\n${this.name}: Trade rejected`);
      console.log(`   Reason: ${assessment.reason}`);
    }

    return output;
  }

  /**
   * Handle incoming RiskTask
   */
  public async handleRiskTask(input: RiskTaskInput): Promise<void> {
    try {
      await this.executeRiskTask(input);
    } catch (error) {
      console.error(`${this.name}: Error executing risk task:`, error);
    }
  }

  /**
   * Get agent name
   */
  public getName(): string {
    return this.name;
  }
}
