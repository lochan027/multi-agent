/**
 * ScanTask - Task for scanning token prices and detecting arbitrage opportunities
 * 
 * This task is executed by the ScannerAgent to fetch token prices from external APIs
 * and identify potential arbitrage opportunities based on price differences.
 */

import { ArbitrageOpportunity } from '../types';

export interface ScanTaskInput {
  /**
   * List of token pairs to scan
   */
  tokenPairs: Array<{
    tokenASymbol: string;
    tokenBSymbol: string;
  }>;
  
  /**
   * Minimum price difference threshold to consider an opportunity (percentage)
   */
  minPriceDifference: number;
}

export interface ScanTaskOutput {
  /**
   * List of detected arbitrage opportunities
   */
  opportunities: ArbitrageOpportunity[];
  
  /**
   * Timestamp of the scan
   */
  scanTimestamp: number;
  
  /**
   * Number of pairs scanned
   */
  pairsScanned: number;
  
  /**
   * Any errors encountered during scanning
   */
  errors?: string[];
}

export class ScanTask {
  public readonly taskName = 'ScanTask';

  /**
   * Validate input data
   */
  public validateInput(input: ScanTaskInput): boolean {
    if (!input.tokenPairs || input.tokenPairs.length === 0) {
      throw new Error('Token pairs list cannot be empty');
    }
    
    if (input.minPriceDifference < 0 || input.minPriceDifference > 1) {
      throw new Error('Min price difference must be between 0 and 1');
    }
    
    return true;
  }

  /**
   * Execute the scan task
   * This will be called by the ScannerAgent
   */
  public async run(input: ScanTaskInput): Promise<ScanTaskOutput> {
    this.validateInput(input);
    
    // The actual execution logic will be implemented by the agent
    // This is just the task definition
    return {
      opportunities: [],
      scanTimestamp: Date.now(),
      pairsScanned: input.tokenPairs.length,
      errors: []
    };
  }
}
