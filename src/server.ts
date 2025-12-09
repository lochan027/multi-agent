/**
 * Express + Socket.IO Server
 * Bridges the multi-agent backend with the React frontend
 * Provides real-time updates via WebSocket
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { ScannerAgent } from './agents/ScannerAgent';
import { RiskAgent } from './agents/RiskAgent';
import { ExecutorAgent } from './agents/ExecutorAgent';
import { Config, ArbitrageOpportunity, SystemStats } from './types';
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from '@cosmjs/proto-signing';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Get allowed origins from environment or use defaults
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// System state
let systemRunning = false;
let systemSettings = {
  scanInterval: 30,
  minProfitUSD: 1.0,
  maxSlippage: 1.0,
  requireApproval: true,
};

let systemStats: SystemStats = {
  totalScans: 0,
  opportunitiesDetected: 0,
  opportunitiesApproved: 0,
  executionsAttempted: 0,
  executionsSuccessful: 0,
  totalProfit: 0,
  successRate: 0,
  uptime: 0,
};

const startTime = Date.now();
const opportunitiesMap = new Map<string, ArbitrageOpportunity>();

// Agent instances (global for start/stop control)
let scannerAgent: ScannerAgent | null = null;
let riskAgent: RiskAgent | null = null;
let executorAgent: ExecutorAgent | null = null;
let pendingApprovals = new Map<string, any>();
let mockInterval: NodeJS.Timeout | null = null;

// Execute real testnet transaction
async function executeTestnetTransaction(profitAmount: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const walletAddress = process.env.DEMO_WALLET_ADDRESS;
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    const recipientAddress = 'sei1x7zlqqkhsa2snzppe0sr3ex4kv6ggjyzyewh9t';
    
    if (!walletAddress || !privateKey) {
      console.log('⚠️  Wallet not configured - simulating transaction');
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        txHash: `SIM${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      };
    }

    // Connect to Sei testnet
    const rpcEndpoint = process.env.COSMOS_RPC_URL || 'https://rpc.atlantic-2.seinetwork.io';
    
    // Create wallet from private key (hex string)
    const privateKeyBytes = Uint8Array.from(Buffer.from(privateKey, 'hex'));
    const wallet = await DirectSecp256k1Wallet.fromKey(privateKeyBytes, 'sei');

    // Get signing client
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
    
    // Get accounts
    const accounts = await wallet.getAccounts();
    const senderAddress = accounts[0].address;

    // Send 0.001 SEI (1000 usei) as demonstration
    const amount = {
      denom: 'usei',
      amount: '1000', // 0.001 SEI
    };

    const fee = {
      amount: [{ denom: 'usei', amount: '2500' }],
      gas: '100000',
    };

    const memo = `Arbitrage profit: $${profitAmount.toFixed(4)}`;

    const result = await client.sendTokens(senderAddress, recipientAddress, [amount], fee, memo);

    console.log(`✅ Transaction successful: ${result.transactionHash}`);
    console.log(`   Explorer: https://seitrace.com/tx/${result.transactionHash}?chain=atlantic-2`);

    return {
      success: true,
      txHash: result.transactionHash,
    };
  } catch (error: any) {
    console.error('❌ Transaction failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Mock data generation for demo
function startMockDataGeneration() {
  console.log('📊 Starting mock data generation...');
  console.log(`   Scan Interval: ${systemSettings.scanInterval}s`);
  console.log(`   Min Profit: $${systemSettings.minProfitUSD}`);
  console.log(`   Max Slippage: ${systemSettings.maxSlippage}%`);
  
  const mockTokenPairs = [
    { tokenA: 'SEI', tokenB: 'USDC', profit: 0.0567 },
    { tokenA: 'ATOM', tokenB: 'USDC', profit: 0.0234 },
    { tokenA: 'OSMO', tokenB: 'SEI', profit: 0.0189 },
    { tokenA: 'INJ', tokenB: 'USDC', profit: 0.0445 },
    { tokenA: 'JUNO', tokenB: 'ATOM', profit: 0.0312 },
  ];

  let scanCount = 0;
  let nextScanCountdown = systemSettings.scanInterval;

  // Send initial agent statuses
  io.emit('agentStatus', {
    name: 'ScannerAgent',
    status: 'active',
    lastActivity: Date.now(),
    tasksProcessed: 0,
  });

  io.emit('agentStatus', {
    name: 'RiskAgent',
    status: 'idle',
    lastActivity: Date.now(),
    tasksProcessed: 0,
  });

  io.emit('agentStatus', {
    name: 'ExecutorAgent',
    status: 'idle',
    lastActivity: Date.now(),
    tasksProcessed: 0,
  });

  // Generate mock data at configured interval
  const runScan = () => {
    if (!systemRunning) return;

    scanCount++;
    systemStats.totalScans++;

    // Emit scan progress
    io.emit('scanProgress', {
      pairsScanned: scanCount % 5,
      totalPairs: 5,
      currentPair: mockTokenPairs[scanCount % mockTokenPairs.length].tokenA + '/' + mockTokenPairs[scanCount % mockTokenPairs.length].tokenB,
      nextScanIn: systemSettings.scanInterval,
    });

    // Random chance to find an opportunity (60% chance)
    if (Math.random() > 0.4) {
      const pair = mockTokenPairs[scanCount % mockTokenPairs.length];
      const profitVariation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const profit = pair.profit + profitVariation;

      // Generate random base price between $0.10 and $50
      const buyPrice = Math.random() * 49.9 + 0.1;
      const sellPrice = buyPrice * (1 + profit);

      const oppId = `opp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const opportunity: ArbitrageOpportunity = {
        id: oppId,
        tokenPair: {
          tokenA: { symbol: pair.tokenA, address: 'addr1', name: pair.tokenA, decimals: 6 },
          tokenB: { symbol: pair.tokenB, address: 'addr2', name: pair.tokenB, decimals: 6 },
        },
        buyPrice: buyPrice,
        sellPrice: sellPrice,
        exchangeRate: sellPrice / buyPrice,
        priceDifference: profit,
        potentialProfit: profit,
        timestamp: Date.now(),
        status: 'detected',
      };

      opportunitiesMap.set(oppId, opportunity);
      systemStats.opportunitiesDetected++;

      // Emit opportunity detected
      io.emit('opportunityDetected', opportunity);
      io.emit('agentActivity', {
        timestamp: Date.now(),
        agent: 'scanner',
        action: 'Opportunity Detected',
        details: `${pair.tokenA}/${pair.tokenB} - ${(profit * 100).toFixed(2)}% profit`,
        status: 'success',
      });

      // Simulate risk assessment after 2 seconds
      setTimeout(() => {
        io.emit('agentStatus', {
          name: 'RiskAgent',
          status: 'active',
          lastActivity: Date.now(),
          tasksProcessed: systemStats.opportunitiesDetected,
        });

        io.emit('agentActivity', {
          timestamp: Date.now(),
          agent: 'risk',
          action: 'Assessing Risk',
          details: `Analyzing ${pair.tokenA}/${pair.tokenB} opportunity`,
          status: 'info',
        });

        // Approve if profit meets threshold (in decimal form: minProfitUSD / 100)
        const minProfitThreshold = systemSettings.minProfitUSD / 100;
        const approved = profit > minProfitThreshold;

        setTimeout(() => {
          opportunity.status = approved ? 'approved' : 'rejected';
          io.emit('opportunityUpdate', { id: oppId, status: opportunity.status });

          if (approved) {
            systemStats.opportunitiesApproved++;
            io.emit('agentActivity', {
              timestamp: Date.now(),
              agent: 'risk',
              action: 'Opportunity Approved',
              details: `Net profit: $${(profit * 100).toFixed(2)} after costs`,
              status: 'success',
            });

            // Check if manual approval is required
            if (systemSettings.requireApproval) {
              // Wait for manual approval from frontend
              opportunity.status = 'pending_approval';
              io.emit('opportunityUpdate', { id: oppId, status: 'pending_approval' });
              io.emit('approvalRequired', {
                opportunity: opportunity,
                expectedProfit: profit * 100, // Assume $100 trade
              });
              io.emit('agentActivity', {
                timestamp: Date.now(),
                agent: 'risk',
                action: 'Awaiting Manual Approval',
                details: `${pair.tokenA}/${pair.tokenB} - Waiting for user confirmation`,
                status: 'info',
              });
              return; // Stop here until approval received
            }

            // Simulate execution after 3 seconds (auto-approval mode)
            setTimeout(() => {
              io.emit('agentStatus', {
                name: 'ExecutorAgent',
                status: 'active',
                lastActivity: Date.now(),
                tasksProcessed: systemStats.executionsAttempted,
              });

              io.emit('agentActivity', {
                timestamp: Date.now(),
                agent: 'executor',
                action: 'Executing Trade',
                details: `Executing ${pair.tokenA}/${pair.tokenB} trade`,
                status: 'info',
              });

              systemStats.executionsAttempted++;

              // Execute real testnet transaction
              executeTestnetTransaction(profit).then((result) => {
                if (result.success) {
                  systemStats.executionsSuccessful++;
                  systemStats.totalProfit += profit * 100; // Assume $100 trade
                  opportunity.status = 'completed';

                  io.emit('opportunityUpdate', { id: oppId, status: 'completed' });
                  io.emit('agentActivity', {
                    timestamp: Date.now(),
                    agent: 'executor',
                    action: 'Trade Executed',
                    details: `Profit: $${(profit * 100).toFixed(2)} | TX: ${result.txHash}`,
                    status: 'success',
                  });
                } else {
                  opportunity.status = 'failed';
                  io.emit('opportunityUpdate', { id: oppId, status: 'failed' });
                  io.emit('agentActivity', {
                    timestamp: Date.now(),
                    agent: 'executor',
                    action: 'Trade Failed',
                    details: result.error || 'Transaction failed',
                    status: 'error',
                  });
                }
              }).catch((error) => {
                opportunity.status = 'failed';
                io.emit('opportunityUpdate', { id: oppId, status: 'failed' });
                io.emit('agentActivity', {
                  timestamp: Date.now(),
                  agent: 'executor',
                  action: 'Trade Failed',
                  details: error.message || 'Transaction error',
                  status: 'error',
                });
              }).finally(() => {

                systemStats.successRate = systemStats.executionsAttempted > 0 
                  ? systemStats.executionsSuccessful / systemStats.executionsAttempted 
                  : 0;

                io.emit('statsUpdate', systemStats);
                io.emit('agentStatus', {
                  name: 'ExecutorAgent',
                  status: 'idle',
                  lastActivity: Date.now(),
                  tasksProcessed: systemStats.executionsAttempted,
                });
              });
            }, 3000);
          } else {
            io.emit('agentActivity', {
              timestamp: Date.now(),
              agent: 'risk',
              action: 'Opportunity Rejected',
              details: `Profit ${(profit * 100).toFixed(2)}% below threshold (${systemSettings.minProfitUSD}%)`,
              status: 'warning',
            });
          }

          io.emit('agentStatus', {
            name: 'RiskAgent',
            status: 'idle',
            lastActivity: Date.now(),
            tasksProcessed: systemStats.opportunitiesDetected,
          });
        }, 1500);
      }, 2000);
    } else {
      io.emit('agentActivity', {
        timestamp: Date.now(),
        agent: 'scanner',
        action: 'Scan Complete',
        details: 'No opportunities found in this scan',
        status: 'info',
      });
    }

    io.emit('statsUpdate', systemStats);
    
    // Reset countdown
    nextScanCountdown = systemSettings.scanInterval;
  };

  // Run scan immediately on start
  runScan();

  // Then run scans at interval
  mockInterval = setInterval(() => {
    if (!systemRunning) {
      if (mockInterval) clearInterval(mockInterval);
      return;
    }
    runScan();
  }, systemSettings.scanInterval * 1000);

  // Update countdown every second
  const countdownInterval = setInterval(() => {
    if (!systemRunning) {
      clearInterval(countdownInterval);
      return;
    }

    nextScanCountdown--;
    if (nextScanCountdown < 0) nextScanCountdown = systemSettings.scanInterval;

    io.emit('scanProgress', {
      pairsScanned: scanCount % 5,
      totalPairs: 5,
      currentPair: mockTokenPairs[scanCount % mockTokenPairs.length].tokenA + '/' + mockTokenPairs[scanCount % mockTokenPairs.length].tokenB,
      nextScanIn: nextScanCountdown,
    });
  }, 1000);
}

// Load configuration
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

// REST API Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: Date.now() - startTime,
    timestamp: Date.now(),
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: Date.now() - startTime });
});

app.get('/api/stats', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({ ...systemStats, uptime });
});

app.get('/api/opportunities', (req, res) => {
  const opps = Array.from(opportunitiesMap.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);
  res.json(opps);
});

// System control endpoints
app.post('/api/system/start', (req, res) => {
  if (systemRunning) {
    res.json({ success: false, message: 'System already running' });
    return;
  }
  
  // Update settings if provided
  if (req.body) {
    systemSettings = { ...systemSettings, ...req.body };
  }
  
  systemRunning = true;
  startAgentSystem().catch(console.error);
  
  res.json({ success: true, message: 'System started', settings: systemSettings });
});

app.post('/api/system/stop', (req, res) => {
  if (!systemRunning) {
    res.json({ success: false, message: 'System not running' });
    return;
  }
  
  systemRunning = false;
  stopAgentSystem();
  
  res.json({ success: true, message: 'System stopped' });
});

app.post('/api/system/settings', (req, res) => {
  systemSettings = { ...systemSettings, ...req.body };
  res.json({ success: true, settings: systemSettings });
});

app.get('/api/system/settings', (req, res) => {
  res.json(systemSettings);
});

app.get('/api/system/status', (req, res) => {
  res.json({ 
    running: systemRunning, 
    settings: systemSettings,
    stats: systemStats 
  });
});

// Approval endpoint - for manual approval mode
app.post('/api/opportunity/:id/approve', async (req, res) => {
  const { id } = req.params;
  const opp = opportunitiesMap.get(id);
  
  if (!opp) {
    res.status(404).json({ success: false, message: 'Opportunity not found' });
    return;
  }
  
  if (opp.status !== 'pending_approval') {
    res.status(400).json({ success: false, message: 'Opportunity not pending approval' });
    return;
  }
  
  // Execute the trade
  opp.status = 'executing';
  io.emit('opportunityUpdate', { id, status: 'executing' });
  
  io.emit('agentStatus', {
    name: 'ExecutorAgent',
    status: 'active',
    lastActivity: Date.now(),
    tasksProcessed: systemStats.executionsAttempted,
  });

  io.emit('agentActivity', {
    timestamp: Date.now(),
    agent: 'executor',
    action: 'Executing Trade',
    details: `Executing ${opp.tokenPair.tokenA.symbol}/${opp.tokenPair.tokenB.symbol} trade (Manual Approval)`,
    status: 'info',
  });

  systemStats.executionsAttempted++;
  const profit = opp.potentialProfit;

  try {
    const result = await executeTestnetTransaction(profit);
    
    if (result.success) {
      systemStats.executionsSuccessful++;
      systemStats.totalProfit += profit * 100;
      opp.status = 'completed';

      io.emit('opportunityUpdate', { id, status: 'completed' });
      io.emit('agentActivity', {
        timestamp: Date.now(),
        agent: 'executor',
        action: 'Trade Executed',
        details: `Profit: $${(profit * 100).toFixed(2)} | TX: ${result.txHash}`,
        status: 'success',
      });
      
      res.json({ success: true, message: 'Trade executed successfully', txHash: result.txHash });
    } else {
      opp.status = 'failed';
      io.emit('opportunityUpdate', { id, status: 'failed' });
      io.emit('agentActivity', {
        timestamp: Date.now(),
        agent: 'executor',
        action: 'Trade Failed',
        details: result.error || 'Transaction failed',
        status: 'error',
      });
      
      res.status(500).json({ success: false, message: result.error || 'Transaction failed' });
    }
  } catch (error: any) {
    opp.status = 'failed';
    io.emit('opportunityUpdate', { id, status: 'failed' });
    io.emit('agentActivity', {
      timestamp: Date.now(),
      agent: 'executor',
      action: 'Trade Failed',
      details: error.message || 'Transaction error',
      status: 'error',
    });
    
    res.status(500).json({ success: false, message: error.message || 'Transaction error' });
  } finally {
    systemStats.successRate = systemStats.executionsAttempted > 0 
      ? systemStats.executionsSuccessful / systemStats.executionsAttempted 
      : 0;

    io.emit('statsUpdate', systemStats);
    io.emit('agentStatus', {
      name: 'ExecutorAgent',
      status: 'idle',
      lastActivity: Date.now(),
      tasksProcessed: systemStats.executionsAttempted,
    });
  }
});

app.post('/api/opportunity/:id/reject', (req, res) => {
  const { id } = req.params;
  const opp = opportunitiesMap.get(id);
  
  if (!opp) {
    res.status(404).json({ success: false, message: 'Opportunity not found' });
    return;
  }
  
  if (opp.status !== 'pending_approval') {
    res.status(400).json({ success: false, message: 'Opportunity not pending approval' });
    return;
  }
  
  opp.status = 'rejected';
  io.emit('opportunityUpdate', { id, status: 'rejected' });
  io.emit('agentActivity', {
    timestamp: Date.now(),
    agent: 'executor',
    action: 'Trade Rejected',
    details: `${opp.tokenPair.tokenA.symbol}/${opp.tokenPair.tokenB.symbol} - Manually rejected by user`,
    status: 'warning',
  });
  
  res.json({ success: true, message: 'Opportunity rejected' });
});


// WebSocket connection
io.on('connection', (socket) => {
  console.log('Frontend connected:', socket.id);

  // Send initial data
  socket.emit('statsUpdate', systemStats);
  socket.emit('agentStatus', {
    name: 'ScannerAgent',
    status: 'active',
    lastActivity: Date.now(),
    tasksProcessed: systemStats.totalScans,
  });

  socket.on('disconnect', () => {
    console.log('Frontend disconnected:', socket.id);
  });
});

// Stop the agent system
function stopAgentSystem() {
  console.log('\n⏹️  Stopping agent system...\n');
  
  if (scannerAgent) {
    scannerAgent.stopScanning();
    scannerAgent = null;
  }
  
  riskAgent = null;
  executorAgent = null;
  pendingApprovals.clear();
  
  io.emit('agentActivity', {
    timestamp: Date.now(),
    agent: 'scanner',
    action: 'System Stopped',
    details: 'All agents deactivated',
    status: 'info',
  });
}

// Start the agent system
async function startAgentSystem() {
  if (!systemRunning) return;
  
  console.log('\n🚀 Starting Multi-Agent System with API Server...\n');

  const config = loadConfig();
  
  // Override config with system settings
  config.scanIntervalMs = systemSettings.scanInterval * 1000;
  config.minProfitThreshold = systemSettings.minProfitUSD / 100;
  config.maxSlippage = systemSettings.maxSlippage / 100;

  // Send initial activity log
  io.emit('agentActivity', {
    timestamp: Date.now(),
    agent: 'scanner',
    action: 'System Started',
    details: 'Initializing multi-agent system',
    status: 'success',
  });

  // Start mock data generation for demo
  startMockDataGeneration();

  console.log('✅ Mock data generation started - System ready\n');
}

// Start server
const PORT = parseInt(process.env.PORT || '4000');

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌐 API Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🎨 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`\n⏸️  System waiting for start command from frontend...\n`);

  // DO NOT auto-start agents - wait for user to press start button
});
