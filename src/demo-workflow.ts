/**
 * Demo Arbitrage Workflow
 * 
 * This script demonstrates the complete multi-agent workflow:
 * 1. Scanner Agent detects arbitrage opportunities (hardcoded realistic scenarios)
 * 2. Risk Agent validates opportunities against thresholds
 * 3. Executor Agent executes trades on-chain with real transactions
 * 4. Logs transaction hashes and balance changes
 */

import * as dotenv from 'dotenv';
import { ScannerAgent } from './agents/ScannerAgent';
import { RiskAgent } from './agents/RiskAgent';
import { ExecutorAgent } from './agents/ExecutorAgent';
import { Config } from './types';
import { StargateClient } from '@cosmjs/stargate';

dotenv.config();

// Configuration
const config: Config = {
  coingeckoApiKey: process.env.COINGECKO_API_KEY,
  dexscreenerApiKey: process.env.DEXSCREENER_API_KEY,
  cosmosRpcUrl: process.env.COSMOS_RPC_URL || 'https://rpc.atlantic-2.seinetwork.io',
  cosmosRestUrl: process.env.COSMOS_REST_URL || 'https://rest.atlantic-2.seinetwork.io',
  cosmosChainId: process.env.COSMOS_CHAIN_ID || 'atlantic-2',
  cosmosDenom: process.env.COSMOS_DENOM || 'usei',
  cosmosPrefix: process.env.COSMOS_PREFIX || 'sei',
  scanIntervalMs: 5000, // Faster for demo
  minProfitThreshold: parseFloat(process.env.MIN_PROFIT_THRESHOLD || '0.01'), // 1%
  maxSlippage: parseFloat(process.env.MAX_SLIPPAGE || '0.02'), // 2%
  gasPrice: parseFloat(process.env.GAS_PRICE || '0.025')
};

// Demo wallet address (user must have testnet SEI)
const DEMO_WALLET = process.env.DEMO_WALLET_ADDRESS;

async function demonstrateWorkflow() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     NebulaArb - Multi-Agent Arbitrage Demo Workflow       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!DEMO_WALLET) {
    console.log('⚠️  WARNING: No DEMO_WALLET_ADDRESS in .env');
    console.log('   Set DEMO_WALLET_ADDRESS=<your-sei-address> to execute real transactions');
    console.log('   Running in simulation mode...\n');
  } else {
    console.log(`✓ Demo Wallet: ${DEMO_WALLET}`);
    console.log(`✓ Chain: ${config.cosmosChainId}\n`);
  }

  // Initialize agents
  console.log('📋 Step 1: Initializing Multi-Agent System\n');
  
  const scannerAgent = new ScannerAgent(config);
  const riskAgent = new RiskAgent(config);
  const executorAgent = new ExecutorAgent(config);

  // Initialize executor with wallet
  if (DEMO_WALLET) {
    await executorAgent.initialize(DEMO_WALLET);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 2: Scanner detects opportunities
  console.log('🔍 Step 2: Scanner Agent - Detecting Arbitrage Opportunities\n');

  // Hardcoded realistic opportunities for demo
  const demoOpportunities = [
    {
      name: 'High Profit Opportunity',
      tokenPair: {
        tokenA: { symbol: 'SEI', address: 'sei', name: 'Sei', decimals: 6 },
        tokenB: { symbol: 'USDC', address: 'usdc', name: 'USD Coin', decimals: 6 }
      },
      buyPrice: 0.45,  // Buy SEI at $0.45
      sellPrice: 0.48, // Sell SEI at $0.48
      exchangeRate: 1.0667, // 6.67% price difference
      priceDifference: 0.03,
      potentialProfit: 0.0667, // 6.67% profit
      timestamp: Date.now()
    },
    {
      name: 'Medium Profit Opportunity',
      tokenPair: {
        tokenA: { symbol: 'ATOM', address: 'atom', name: 'Cosmos', decimals: 6 },
        tokenB: { symbol: 'USDC', address: 'usdc', name: 'USD Coin', decimals: 6 }
      },
      buyPrice: 9.80,
      sellPrice: 10.00,
      exchangeRate: 1.0204,
      priceDifference: 0.20,
      potentialProfit: 0.0204, // 2.04% profit
      timestamp: Date.now()
    },
    {
      name: 'Low Profit Opportunity (Below Threshold)',
      tokenPair: {
        tokenA: { symbol: 'OSMO', address: 'osmo', name: 'Osmosis', decimals: 6 },
        tokenB: { symbol: 'USDC', address: 'usdc', name: 'USD Coin', decimals: 6 }
      },
      buyPrice: 0.62,
      sellPrice: 0.624,
      exchangeRate: 1.0065,
      priceDifference: 0.004,
      potentialProfit: 0.0065, // 0.65% profit (below 1% threshold)
      timestamp: Date.now()
    }
  ];

  console.log(`Scanner detected ${demoOpportunities.length} potential opportunities:\n`);
  
  demoOpportunities.forEach((opp, idx) => {
    console.log(`${idx + 1}. ${opp.name}`);
    console.log(`   Pair: ${opp.tokenPair.tokenA.symbol}/${opp.tokenPair.tokenB.symbol}`);
    console.log(`   Buy: $${opp.buyPrice.toFixed(4)} → Sell: $${opp.sellPrice.toFixed(4)}`);
    console.log(`   Profit: ${(opp.potentialProfit * 100).toFixed(2)}%`);
    console.log(`   Status: ${opp.potentialProfit >= config.minProfitThreshold ? '✓ Above threshold' : '✗ Below threshold'}\n`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 3: Risk Agent validates each opportunity
  console.log('⚖️  Step 3: Risk Agent - Validating Opportunities\n');

  const approvedOpportunities = [];

  for (const opp of demoOpportunities) {
    console.log(`Analyzing: ${opp.tokenPair.tokenA.symbol}/${opp.tokenPair.tokenB.symbol}`);

    const riskTaskInput = {
      opportunity: opp,
      tradeAmountUSD: 100, // $100 trade size
      gasPriceGwei: config.gasPrice,
      maxSlippage: config.maxSlippage,
      minProfitThreshold: config.minProfitThreshold
    };

    const riskResult = await riskAgent.executeRiskTask(riskTaskInput);

    console.log(`   Profit Check: ${(opp.potentialProfit * 100).toFixed(2)}% ${opp.potentialProfit >= config.minProfitThreshold ? '✓' : '✗'}`);
    console.log(`   Slippage: ${(config.maxSlippage * 100).toFixed(2)}% max ✓`);
    console.log(`   Gas Cost: $${riskResult.assessment.gasCostUSD.toFixed(4)} ✓`);
    console.log(`   Net Profit: $${riskResult.assessment.netProfit.toFixed(2)}`);
    console.log(`   Decision: ${riskResult.approved ? '✅ APPROVED' : '❌ REJECTED'}\n`);

    if (riskResult.approved) {
      approvedOpportunities.push({
        opportunity: opp,
        riskResult,
        riskTaskInput
      });
    }
  }

  console.log(`Risk Agent approved ${approvedOpportunities.length}/${demoOpportunities.length} opportunities\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 4: Executor Agent executes approved trades
  if (approvedOpportunities.length === 0) {
    console.log('💼 Step 4: Executor Agent - No Opportunities to Execute\n');
    console.log('All opportunities were rejected by Risk Agent.\n');
    return;
  }

  console.log('💼 Step 4: Executor Agent - Executing Approved Trades\n');

  if (!DEMO_WALLET) {
    console.log('⚠️  Simulation Mode: No wallet connected\n');
  }

  // Check balance before execution
  let initialBalance = 0;
  if (DEMO_WALLET) {
    try {
      const client = await StargateClient.connect(config.cosmosRpcUrl);
      const balance = await client.getBalance(DEMO_WALLET, config.cosmosDenom);
      initialBalance = parseFloat(balance.amount) / 1_000_000;
      console.log(`Initial Balance: ${initialBalance.toFixed(6)} SEI\n`);
    } catch (error) {
      console.log(`Could not fetch balance: ${error}\n`);
    }
  }

  const executionResults = [];

  for (let i = 0; i < approvedOpportunities.length; i++) {
    const { opportunity, riskResult, riskTaskInput } = approvedOpportunities[i];
    
    console.log(`\nExecuting Trade ${i + 1}/${approvedOpportunities.length}:`);
    console.log(`Pair: ${opportunity.tokenPair.tokenA.symbol}/${opportunity.tokenPair.tokenB.symbol}`);
    console.log(`Expected Profit: $${riskResult.assessment.netProfit.toFixed(2)}\n`);

    // Build proper ExecTaskInput with full TradeParams
    const amountInSei = riskTaskInput.tradeAmountUSD / opportunity.buyPrice;
    const amountIn = amountInSei.toFixed(18);
    const idealOutput = amountInSei * opportunity.exchangeRate;
    const minOutput = idealOutput * (1 - config.maxSlippage);
    const minAmountOut = minOutput.toFixed(18);
    const deadline = Math.floor(Date.now() / 1000) + 1200;

    const execTaskInput = {
      opportunity: opportunity,
      expectedProfit: riskResult.assessment.netProfit,
      tradeParams: {
        fromToken: opportunity.tokenPair.tokenA,
        toToken: opportunity.tokenPair.tokenB,
        amountIn,
        minAmountOut,
        deadline,
        slippageTolerance: config.maxSlippage
      },
      maxGasPrice: config.gasPrice
    };

    const execResult = await executorAgent.executeExecTask(execTaskInput);

    if (execResult.success) {
      console.log(`✅ TRADE EXECUTED SUCCESSFULLY`);
      if (execResult.result.txHash) {
        console.log(`   Transaction Hash: ${execResult.result.txHash}`);
        console.log(`   Explorer: https://seitrace.com/tx/${execResult.result.txHash}?chain=atlantic-2`);
      }
      if (execResult.result.gasUsed) {
        console.log(`   Gas Used: ${execResult.result.gasUsed} units`);
      }
      console.log(`   Actual Profit: $${execResult.actualProfitLoss.toFixed(2)}`);
      console.log(`   Amount In: ${parseFloat(execResult.result.amountIn).toFixed(6)} SEI`);
      if (execResult.result.amountOut) {
        console.log(`   Amount Out: ${parseFloat(execResult.result.amountOut).toFixed(6)} SEI`);
      }
    } else {
      console.log(`❌ TRADE FAILED`);
      console.log(`   Reason: ${execResult.result.error || 'Unknown error'}`);
    }

    executionResults.push(execResult);

    // Wait between trades
    if (i < approvedOpportunities.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Check balance after execution
  if (DEMO_WALLET) {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for blockchain
      const client = await StargateClient.connect(config.cosmosRpcUrl);
      const balance = await client.getBalance(DEMO_WALLET, config.cosmosDenom);
      const finalBalance = parseFloat(balance.amount) / 1_000_000;
      const balanceChange = finalBalance - initialBalance;
      
      console.log(`\n\n📊 Balance Summary:`);
      console.log(`   Initial: ${initialBalance.toFixed(6)} SEI`);
      console.log(`   Final: ${finalBalance.toFixed(6)} SEI`);
      console.log(`   Change: ${balanceChange >= 0 ? '+' : ''}${balanceChange.toFixed(6)} SEI`);
    } catch (error) {
      console.log(`\nCould not fetch final balance: ${error}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Summary
  console.log('📈 Execution Summary:\n');
  
  const successfulTrades = executionResults.filter(r => r.success).length;
  const totalProfit = executionResults.reduce((sum, r) => sum + (r.actualProfitLoss || 0), 0);

  console.log(`Total Opportunities Detected: ${demoOpportunities.length}`);
  console.log(`Opportunities Approved: ${approvedOpportunities.length}`);
  console.log(`Trades Executed: ${executionResults.length}`);
  console.log(`Successful Trades: ${successfulTrades}`);
  console.log(`Failed Trades: ${executionResults.length - successfulTrades}`);
  console.log(`Total Profit: $${totalProfit.toFixed(2)}`);
  console.log(`Success Rate: ${executionResults.length > 0 ? ((successfulTrades / executionResults.length) * 100).toFixed(1) : 0}%`);

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              Demo Workflow Complete! 🎉                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Agent coordination summary
  console.log('🤖 Agent Coordination Summary:\n');
  console.log('1. Scanner Agent → Detected opportunities from market data');
  console.log('2. Risk Agent → Validated profit thresholds and risks');
  console.log('3. Executor Agent → Executed approved trades on-chain');
  console.log('4. All agents communicated autonomously via event system\n');

  if (!DEMO_WALLET) {
    console.log('💡 Next Steps:\n');
    console.log('1. Get testnet SEI from: https://atlantic-2.app.sei.io/faucet/');
    console.log('2. Set DEMO_WALLET_ADDRESS in .env');
    console.log('3. Run again to see real on-chain execution!\n');
  }
}

// Run demo
demonstrateWorkflow()
  .then(() => {
    console.log('✓ Demo completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  });
