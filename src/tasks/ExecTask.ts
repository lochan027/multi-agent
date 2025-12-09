/**
 * ExecTask - Task for executing approved arbitrage trades
 * 
 * This task receives approved opportunities from the RiskAgent and executes
 * the trade simulation on testnet using a wallet executor tool.
 */

import { ArbitrageOpportunity, ExecutionResult, TradeParams } from '../types';

export interface ExecTaskInput {
  /**
   * The approved arbitrage opportunity
   */
  opportunity: ArbitrageOpportunity;
  
  /**
   * Trade parameters calculated by risk agent
   */
  tradeParams: TradeParams;
  
  /**
   * Expected net profit in USD
   */
  expectedProfit: number;
  
  /**
   * Maximum gas price willing to pay (in Gwei)
   */
  maxGasPrice: number;
}

export interface ExecTaskOutput {
  /**
   * The execution result
   */
  result: ExecutionResult;
  
  /**
   * Original opportunity data
   */
  opportunity: ArbitrageOpportunity;
  
  /**
   * Actual profit/loss in USD
   */
  actualProfitLoss: number;
  
  /**
   * Whether execution was successful
   */
  success: boolean;
  
  /**
   * Execution timestamp
   */
  executionTimestamp: number;
}

export class ExecTask {
  public readonly taskName = 'ExecTask';

  /**
   * Validate input data
   */
  public validateInput(input: ExecTaskInput): boolean {
    if (!input.opportunity) {
      throw new Error('Opportunity data is required');
    }
    
    if (!input.tradeParams) {
      throw new Error('Trade parameters are required');
    }
    
    if (!input.tradeParams.fromToken || !input.tradeParams.toToken) {
      throw new Error('Token information is incomplete');
    }
    
    if (!input.tradeParams.amountIn || input.tradeParams.amountIn === '0') {
      throw new Error('Invalid trade amount');
    }
    
    if (input.maxGasPrice <= 0) {
      throw new Error('Max gas price must be positive');
    }
    
    return true;
  }

  /**
   * Execute the trade execution task
   * This will be called by the ExecutorAgent
   */
  public async run(input: ExecTaskInput): Promise<ExecTaskOutput> {
    this.validateInput(input);
    
    // The actual execution logic will be implemented by the agent
    // This is just the task definition
    const result: ExecutionResult = {
      success: false,
      amountIn: input.tradeParams.amountIn,
      timestamp: Date.now(),
      simulated: true,
      error: 'Not yet executed'
    };
    
    return {
      result,
      opportunity: input.opportunity,
      actualProfitLoss: 0,
      success: false,
      executionTimestamp: Date.now()
    };
  }
}
