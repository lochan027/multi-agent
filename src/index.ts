/**
 * Multi-Agent DeFi Executor - Main Orchestrator
 * 
 * This is the entry point that:
 * 1. Loads configuration from environment variables
 * 2. Initializes all three agents (Scanner, Risk, Executor)
 * 3. Sets up event/messaging links between agents
 * 4. Starts the scanning process
 */

import * as dotenv from 'dotenv';
import { ScannerAgent } from './agents/ScannerAgent';
import { RiskAgent } from './agents/RiskAgent';
import { ExecutorAgent } from './agents/ExecutorAgent';
import { Config } from './types';

// Load environment variables
dotenv.config();

/**
 * Load configuration from environment variables
 */
function loadConfig(): Config {
  return {
    coingeckoApiKey: process.env.COINGECKO_API_KEY,
    dexscreenerApiKey: process.env.DEXSCREENER_API_KEY,
    cosmosRpcUrl: process.env.COSMOS_RPC_URL || 'https://rpc.atlantic-2.seinetwork.io',
    cosmosRestUrl: process.env.COSMOS_REST_URL || 'https://rest.atlantic-2.seinetwork.io',
    cosmosChainId: process.env.COSMOS_CHAIN_ID || 'atlantic-2',
    cosmosDenom: process.env.COSMOS_DENOM || 'usei',
    cosmosPrefix: process.env.COSMOS_PREFIX || 'sei',
    scanIntervalMs: parseInt(process.env.SCAN_INTERVAL_MS || '20000'),
    minProfitThreshold: parseFloat(process.env.MIN_PROFIT_THRESHOLD || '0.02'),
    maxSlippage: parseFloat(process.env.MAX_SLIPPAGE || '0.01'),
    gasPrice: parseFloat(process.env.GAS_PRICE || '0.025')
  };
}

/**
 * Print banner
 */
function printBanner(): void {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║        Multi-Agent DeFi Executor                          ║');
  console.log('║        Powered by IQAI ADK-TS                             ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

/**
 * Main orchestrator function
 */
async function main(): Promise<void> {
  printBanner();

  // Load configuration
  console.log('📋 Loading configuration...');
  const config = loadConfig();

  console.log('\n⚙️  Configuration:');
  console.log(`   RPC URL: ${config.cosmosRpcUrl}`);
  console.log(`   REST URL: ${config.cosmosRestUrl}`);
  console.log(`   Chain ID: ${config.cosmosChainId}`);
  console.log(`   Denom: ${config.cosmosDenom}`);
  console.log(`   Scan Interval: ${config.scanIntervalMs}ms`);
  console.log(`   Min Profit: ${(config.minProfitThreshold * 100).toFixed(2)}%`);
  console.log(`   Max Slippage: ${(config.maxSlippage * 100).toFixed(2)}%`);
  console.log(`   Gas Price: ${config.gasPrice} ${config.cosmosDenom}`);

  console.log('\n🚀 Initializing agents...\n');
  console.log('═'.repeat(60));

  // Initialize agents
  const scannerAgent = new ScannerAgent(config);
  const riskAgent = new RiskAgent(config);
  const executorAgent = new ExecutorAgent(config);

  console.log('═'.repeat(60));

  // Set up agent communication links
  console.log('\n🔗 Setting up agent communication...');

  // ScannerAgent → RiskAgent
  scannerAgent.onEmitRiskTask((riskTaskInput) => {
    console.log(`\n📨 ${scannerAgent.getName()} → ${riskAgent.getName()}: RiskTask`);
    riskAgent.handleRiskTask(riskTaskInput);
  });

  // RiskAgent → ExecutorAgent
  riskAgent.onEmitExecTask((execTaskInput) => {
    console.log(`\n📨 ${riskAgent.getName()} → ExecutorAgent: ExecTask`);
    executorAgent.handleExecTask(execTaskInput);
  });

  console.log('   ✓ ScannerAgent → RiskAgent');
  console.log('   ✓ RiskAgent → ExecutorAgent');

  // Define token pairs to scan
  const tokenPairs = [
    { tokenASymbol: 'ethereum', tokenBSymbol: 'bitcoin' },
    { tokenASymbol: 'ethereum', tokenBSymbol: 'uniswap' },
    { tokenASymbol: 'chainlink', tokenBSymbol: 'aave' }
  ];

  console.log('\n📊 Token pairs to scan:');
  tokenPairs.forEach(pair => {
    console.log(`   • ${pair.tokenASymbol.toUpperCase()}/${pair.tokenBSymbol.toUpperCase()}`);
  });

  // Start scanning
  console.log('\n🔄 Starting continuous scanning...\n');
  console.log('═'.repeat(60));
  
  scannerAgent.startScanning(tokenPairs);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n⏹️  Shutting down...');
    scannerAgent.stopScanning();
    
    const stats = executorAgent.getStatistics();
    console.log('\n📈 Final Statistics:');
    console.log(`   Total Executions: ${stats.executionCount}`);
    console.log(`   Successful: ${stats.successCount}`);
    console.log(`   Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`   Total Profit: $${stats.totalProfit.toFixed(2)}`);
    
    console.log('\n👋 Goodbye!\n');
    process.exit(0);
  });

  // Keep the process running
  console.log('\n💡 Press Ctrl+C to stop\n');
}

// Run the orchestrator
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
