/**
 * ExecutorAgent - Executes approved arbitrage trades on Sei testnet
 * 
 * This agent:
 * 1. Receives ExecTask events from RiskAgent
 * 2. Uses CosmosWalletTool to simulate MsgSend transactions
 * 3. Reports execution results
 * 
 * Note: Uses Sei Testnet (atlantic-2) instead of Ethereum
 */

import { CosmosWalletTool } from '../tools/cosmosWallet';
import { ExecTaskInput, ExecTaskOutput } from '../tasks/ExecTask';
import { Config, ExecutionResult } from '../types';

export class ExecutorAgent {
  private name = 'ExecutorAgent';
  private cosmosWallet: CosmosWalletTool;
  private config: Config;
  private executionCount = 0;
  private successCount = 0;
  private totalProfit = 0;
  private isInitialized = false;

  constructor(config: Config) {
    this.config = config;
    
    // Initialize Cosmos wallet
    this.cosmosWallet = new CosmosWalletTool(config);
    
    console.log(`\n💼 ${this.name} initialized`);
  }

  /**
   * Initialize connection to Cosmos chain
   */
  public async initialize(walletAddress?: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.cosmosWallet.initialize();
      
      if (walletAddress) {
        this.cosmosWallet.setAddress(walletAddress);
        await this.printWalletInfo(walletAddress);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error(`Failed to initialize ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Print wallet information
   */
  private async printWalletInfo(address: string): Promise<void> {
    try {
      const balance = await this.cosmosWallet.getBalance(address);
      const height = await this.cosmosWallet.getHeight();
      const walletInfo = this.cosmosWallet.getWalletInfo();
      
      if (walletInfo) {
        console.log(`   Wallet Address: ${walletInfo.address}`);
        console.log(`   Balance: ${balance} SEI`);
        console.log(`   Chain ID: ${walletInfo.chainId}`);
        console.log(`   Block Height: ${height}`);
      }
    } catch (error) {
      console.error(`   Failed to fetch wallet info:`, error);
    }
  }

  /**
   * Execute a trade execution task
   * Note: Simulates MsgSend transaction for demonstration
   */
  public async executeExecTask(input: ExecTaskInput): Promise<ExecTaskOutput> {
    console.log(`\n${this.name}: Executing trade simulation...`);
    console.log(`   Opportunity: ${input.opportunity.tokenPair.tokenA.symbol} → ${input.opportunity.tokenPair.tokenB.symbol}`);
    console.log(`   Expected Profit: $${input.expectedProfit.toFixed(2)}`);

    this.executionCount++;

    let result: ExecutionResult;

    try {
      const walletInfo = this.cosmosWallet.getWalletInfo();
      
      if (!walletInfo) {
        console.log(`   ✗ Wallet not connected`);
        result = {
          success: false,
          amountIn: input.tradeParams.amountIn,
          timestamp: Date.now(),
          simulated: true,
          error: 'Wallet not connected'
        };
      } else {
        // Check balance
        const balance = await this.cosmosWallet.getBalance();
        const balanceOsmo = parseFloat(balance);

        // Calculate required OSMO (for demonstration, use 1 OSMO)
        const requiredOsmo = 1.0;

        if (balanceOsmo < requiredOsmo) {
          console.log(`   ✗ Insufficient balance (need ${requiredOsmo} OSMO, have ${balanceOsmo} OSMO)`);
          result = {
            success: false,
            amountIn: input.tradeParams.amountIn,
            timestamp: Date.now(),
            simulated: true,
            error: 'Insufficient OSMO balance'
          };
        } else {
          // Simulate MsgSend transaction
          // In production, this would trigger Keplr wallet signature
          const txResult = await this.cosmosWallet.simulateSend({
            fromAddress: walletInfo.address,
            toAddress: walletInfo.address, // Send to self for demo
            amount: (requiredOsmo * 1_000_000).toString(), // Convert to uosmo
            memo: `Arbitrage: ${input.opportunity.tokenPair.tokenA.symbol}/${input.opportunity.tokenPair.tokenB.symbol}`
          });

          if (txResult.success) {
            // Calculate simulated profit
            const actualProfit = input.expectedProfit * (0.95 + Math.random() * 0.1); // 95-105% of expected
            
            result = {
              success: true,
              txHash: txResult.txHash,
              amountIn: input.tradeParams.amountIn,
              amountOut: (parseFloat(input.tradeParams.amountIn) * 1.02).toString(),
              gasUsed: txResult.gasUsed,
              actualProfit: actualProfit,
              timestamp: txResult.timestamp,
              simulated: true
            };

            this.successCount++;
            this.totalProfit += actualProfit;
          } else {
            result = {
              success: false,
              amountIn: input.tradeParams.amountIn,
              timestamp: txResult.timestamp,
              simulated: true,
              error: txResult.error || 'Transaction failed'
            };
          }
        }
      }

      // Update statistics
      if (result.success) {
        this.successCount++;
        if (result.actualProfit) {
          this.totalProfit += result.actualProfit;
        }
      }

      // Log execution result
      console.log(`\n${this.name}: Execution complete`);
      console.log(`   Success: ${result.success ? '✓' : '✗'}`);
      if (result.success) {
        console.log(`   TX Hash: ${result.txHash}`);
        console.log(`   Amount Out: ${result.amountOut}`);
        console.log(`   Gas Used: ${result.gasUsed}`);
        console.log(`   Actual Profit: $${result.actualProfit?.toFixed(2) || '0.00'}`);
      } else {
        console.log(`   Error: ${result.error}`);
      }

      // Print statistics
      console.log(`\n${this.name}: Statistics`);
      console.log(`   Total Executions: ${this.executionCount}`);
      console.log(`   Successful: ${this.successCount}`);
      console.log(`   Success Rate: ${((this.successCount / this.executionCount) * 100).toFixed(1)}%`);
      console.log(`   Total Profit: $${this.totalProfit.toFixed(2)}`);

    } catch (error) {
      console.error(`${this.name}: Execution error:`, error);
      
      result = {
        success: false,
        amountIn: input.tradeParams.amountIn,
        timestamp: Date.now(),
        simulated: true,
        error: error instanceof Error ? error.message : 'Unknown execution error'
      };
    }

    const output: ExecTaskOutput = {
      result,
      opportunity: input.opportunity,
      actualProfitLoss: result.actualProfit || 0,
      success: result.success,
      executionTimestamp: result.timestamp
    };

    return output;
  }

  /**
   * Handle incoming ExecTask
   */
  public async handleExecTask(input: ExecTaskInput): Promise<ExecutionResult> {
    try {
      const output = await this.executeExecTask(input);
      return {
        success: output.success,
        amountIn: input.tradeParams.amountIn,
        amountOut: output.result.amountOut,
        gasUsed: output.result.gasUsed,
        actualProfit: output.result.actualProfit,
        actualProfitLoss: output.actualProfitLoss,
        txHash: output.result.txHash,
        error: output.result.error,
        timestamp: output.executionTimestamp,
        simulated: output.result.simulated,
        result: output.result
      };
    } catch (error) {
      console.error(`${this.name}: Error handling exec task:`, error);
      return {
        success: false,
        amountIn: '0',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        simulated: true
      };
    }
  }

  /**
   * Get execution statistics
   */
  public getStatistics(): {
    executionCount: number;
    successCount: number;
    successRate: number;
    totalProfit: number;
  } {
    return {
      executionCount: this.executionCount,
      successCount: this.successCount,
      successRate: this.executionCount > 0 ? this.successCount / this.executionCount : 0,
      totalProfit: this.totalProfit
    };
  }

  /**
   * Disconnect from Cosmos chain
   */
  public disconnect(): void {
    this.cosmosWallet.disconnect();
  }
}
