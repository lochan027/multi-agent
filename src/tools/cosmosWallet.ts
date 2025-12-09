/**
 * CosmosWalletTool - Manages Osmosis testnet wallet and transaction signing
 * 
 * This tool replaces the Ethereum wallet and uses CosmJS for Cosmos SDK chains.
 * Transactions are signed using Keplr wallet (browser) or offline signing (backend).
 * 
 * Uses Osmosis Testnet (osmo-test-5):
 * - RPC: https://rpc.osmotest5.osmosis.zone
 * - REST: https://lcd.osmotest5.osmosis.zone
 * - Denom: uosmo
 */

import { StargateClient, SigningStargateClient, assertIsDeliverTxSuccess } from '@cosmjs/stargate';
import { coins } from '@cosmjs/amino';
import { Config } from '../types';

export interface CosmosWalletInfo {
  address: string;
  chainId: string;
  denom: string;
  prefix: string;
}

export interface CosmosTransactionResult {
  success: boolean;
  txHash?: string;
  height?: number;
  gasUsed?: number;
  error?: string;
  timestamp: number;
}

export class CosmosWalletTool {
  private rpcUrl: string;
  private restUrl: string;
  private chainId: string;
  private denom: string;
  private prefix: string;
  private gasPrice: number;
  private client: StargateClient | null = null;
  private connectedAddress: string | null = null;

  constructor(config: Config) {
    this.rpcUrl = config.cosmosRpcUrl;
    this.restUrl = config.cosmosRestUrl;
    this.chainId = config.cosmosChainId;
    this.denom = config.cosmosDenom;
    this.prefix = config.cosmosPrefix;
    this.gasPrice = config.gasPrice;
  }

  /**
   * Initialize connection to Osmosis testnet
   */
  public async initialize(): Promise<void> {
    try {
      console.log(`\n🔗 Connecting to Cosmos chain...`);
      console.log(`   Chain ID: ${this.chainId}`);
      console.log(`   RPC: ${this.rpcUrl}`);

      this.client = await StargateClient.connect(this.rpcUrl);
      
      const height = await this.client.getHeight();
      console.log(`✓ Connected to ${this.chainId}`);
      console.log(`   Current Height: ${height}`);
    } catch (error) {
      console.error('Failed to connect to Cosmos chain:', error);
      throw error;
    }
  }

  /**
   * Set wallet address (for monitoring, not for signing)
   * In production, this would come from Keplr wallet connection
   */
  public setAddress(address: string): void {
    this.connectedAddress = address;
    console.log(`\n👛 Wallet address set: ${address}`);
  }

  /**
   * Get balance for an address
   */
  public async getBalance(address?: string): Promise<string> {
    if (!this.client) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    const targetAddress = address || this.connectedAddress;
    if (!targetAddress) {
      return '0';
    }

    try {
      const balance = await this.client.getBalance(targetAddress, this.denom);
      
      // Convert from uosmo to OSMO (1 OSMO = 1,000,000 uosmo)
      const osmoBalance = parseFloat(balance.amount) / 1_000_000;
      
      return osmoBalance.toFixed(6);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }

  /**
   * Check if address has sufficient balance
   */
  public async hasSufficientBalance(
    address: string,
    requiredAmount: string
  ): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const balance = await this.client.getBalance(address, this.denom);
      const balanceAmount = parseFloat(balance.amount);
      const required = parseFloat(requiredAmount);

      return balanceAmount >= required;
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  /**
   * Simulate a MsgSend transaction (for demonstration)
   * In real usage, this would be signed by Keplr wallet
   */
  public async simulateSend(params: {
    fromAddress: string;
    toAddress: string;
    amount: string;
    memo?: string;
  }): Promise<CosmosTransactionResult> {
    console.log(`\n💸 Simulating MsgSend transaction...`);
    console.log(`   From: ${params.fromAddress}`);
    console.log(`   To: ${params.toAddress}`);
    console.log(`   Amount: ${params.amount} ${this.denom}`);
    
    try {
      // Check balance first
      const hasBalance = await this.hasSufficientBalance(
        params.fromAddress,
        params.amount
      );

      if (!hasBalance) {
        console.log(`   ✗ Insufficient balance`);
        return {
          success: false,
          error: 'Insufficient balance',
          timestamp: Date.now()
        };
      }

      // Simulate successful transaction
      // In production, this would use SigningStargateClient with Keplr
      const simulatedTxHash = `SIMULATED-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      const height = await this.client!.getHeight();

      console.log(`   ✓ Transaction simulated successfully`);
      console.log(`   Simulated TX Hash: ${simulatedTxHash}`);
      console.log(`   Height: ${height + 1}`);

      return {
        success: true,
        txHash: simulatedTxHash,
        height: height + 1,
        gasUsed: 75000, // Typical gas for MsgSend
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('   ✗ Simulation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get wallet information
   */
  public getWalletInfo(): CosmosWalletInfo | null {
    if (!this.connectedAddress) {
      return null;
    }

    return {
      address: this.connectedAddress,
      chainId: this.chainId,
      denom: this.denom,
      prefix: this.prefix
    };
  }

  /**
   * Get current block height
   */
  public async getHeight(): Promise<number> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    return await this.client.getHeight();
  }

  /**
   * Get transaction details
   */
  public async getTransaction(txHash: string): Promise<any> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    try {
      const tx = await this.client.getTx(txHash);
      return tx;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  /**
   * Calculate gas cost in OSMO
   */
  public calculateGasCost(gasUsed: number): number {
    // gasPrice is in uosmo per gas unit
    const gasCostUosmo = gasUsed * this.gasPrice;
    // Convert to OSMO
    return gasCostUosmo / 1_000_000;
  }

  /**
   * Disconnect from the chain
   */
  public disconnect(): void {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
      this.connectedAddress = null;
      console.log('\n🔌 Disconnected from Cosmos chain');
    }
  }
}
