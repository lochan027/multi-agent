/**
 * Shared state across Netlify Functions
 * Note: This is in-memory and resets on cold starts
 * For production, use a database or Redis
 */

export interface SystemState {
  running: boolean;
  stats: {
    totalScans: number;
    opportunitiesDetected: number;
    opportunitiesApproved: number;
    executionsAttempted: number;
    executionsSuccessful: number;
    totalProfit: number;
    successRate: number;
    uptime: number;
  };
  settings: {
    scanInterval: number;
    minProfitUSD: number;
    maxSlippage: number;
    requireApproval: boolean;
  };
  startTime: number;
  lastScanTime: number;
}

export interface AgentState {
  name: string;
  status: 'idle' | 'active' | 'processing' | 'error';
  lastActivity: number;
  tasksProcessed: number;
}

export interface Opportunity {
  id: string;
  tokenPair: string;
  tokenA: string;
  tokenB: string;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  profitUSD: number;
  estimatedGas: number;
  riskScore: number;
  status: 'pending_approval' | 'approved' | 'rejected' | 'executing' | 'executed';
  timestamp: number;
  detectedAt: string;
}

// Global state
export const systemState: SystemState = {
  running: false,
  stats: {
    totalScans: 0,
    opportunitiesDetected: 0,
    opportunitiesApproved: 0,
    executionsAttempted: 0,
    executionsSuccessful: 0,
    totalProfit: 0,
    successRate: 0,
    uptime: 0,
  },
  settings: {
    scanInterval: 30,
    minProfitUSD: 1.0,
    maxSlippage: 1.0,
    requireApproval: true,
  },
  startTime: Date.now(),
  lastScanTime: 0,
};

export const agentStates: Record<string, AgentState> = {
  ScannerAgent: {
    name: 'ScannerAgent',
    status: 'idle',
    lastActivity: Date.now(),
    tasksProcessed: 0,
  },
  RiskAgent: {
    name: 'RiskAgent',
    status: 'idle',
    lastActivity: Date.now(),
    tasksProcessed: 0,
  },
  ExecutorAgent: {
    name: 'ExecutorAgent',
    status: 'idle',
    lastActivity: Date.now(),
    tasksProcessed: 0,
  },
};

export const opportunities: Opportunity[] = [];

// Activity log
export interface Activity {
  id: string;
  agent: string;
  action: string;
  details: string;
  status: 'success' | 'error' | 'info';
  timestamp: number;
}

export const activityLog: Activity[] = [];

export function addActivity(agent: string, action: string, details: string, status: 'success' | 'error' | 'info' = 'info') {
  activityLog.unshift({
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    agent,
    action,
    details,
    status,
    timestamp: Date.now(),
  });
  
  // Keep only last 50 activities
  if (activityLog.length > 50) {
    activityLog.pop();
  }
}

// Token pairs for Ethereum
const tokenPairs = [
  { tokenA: 'WETH', tokenB: 'USDC', addressA: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', addressB: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  { tokenA: 'WETH', tokenB: 'USDT', addressA: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', addressB: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  { tokenA: 'USDC', tokenB: 'USDT', addressA: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', addressB: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  { tokenA: 'WETH', tokenB: 'DAI', addressA: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', addressB: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
  { tokenA: 'WBTC', tokenB: 'WETH', addressA: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', addressB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  { tokenA: 'LINK', tokenB: 'WETH', addressA: '0x514910771AF9Ca656af840dff83E8264EcF986CA', addressB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  { tokenA: 'UNI', tokenB: 'WETH', addressA: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', addressB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  { tokenA: 'AAVE', tokenB: 'WETH', addressA: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', addressB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
];

// Generate mock opportunity
export function generateOpportunity(): Opportunity {
  const pair = tokenPairs[Math.floor(Math.random() * tokenPairs.length)];
  const buyPrice = 1800 + Math.random() * 200;
  const sellPrice = buyPrice * (1 + (Math.random() * 0.03 - 0.01)); // -1% to +2% difference
  const profit = sellPrice - buyPrice;
  const profitUSD = Math.abs(profit) * (1 + Math.random() * 2); // Random amount
  const riskScore = Math.random() * 0.5; // 0-50% risk

  return {
    id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tokenPair: `${pair.tokenA}/${pair.tokenB}`,
    tokenA: pair.addressA,
    tokenB: pair.addressB,
    buyPrice,
    sellPrice,
    profit,
    profitUSD,
    estimatedGas: 0.002 + Math.random() * 0.003,
    riskScore,
    status: 'pending_approval',
    timestamp: Date.now(),
    detectedAt: new Date().toISOString(),
  };
}

// Simulate system activity
export function simulateActivity() {
  if (!systemState.running) {
    // Set all agents to idle when system is stopped
    agentStates.ScannerAgent.status = 'idle';
    agentStates.RiskAgent.status = 'idle';
    agentStates.ExecutorAgent.status = 'idle';
    return;
  }

  const now = Date.now();
  
  // Update agent statuses to active
  agentStates.ScannerAgent.status = 'active';
  agentStates.ScannerAgent.lastActivity = now;
  agentStates.ScannerAgent.tasksProcessed++;
  
  agentStates.RiskAgent.status = 'active';
  agentStates.RiskAgent.lastActivity = now;
  agentStates.RiskAgent.tasksProcessed++;
  
  agentStates.ExecutorAgent.status = 'idle';

  // Add scanning activity
  addActivity('ScannerAgent', 'Scanning markets', 'Checking 8 token pairs for arbitrage opportunities', 'info');

  // Generate opportunity occasionally (20% chance per call)
  if (Math.random() < 0.2 && opportunities.length < 10) {
    agentStates.ScannerAgent.status = 'processing';
    
    const opp = generateOpportunity();
    opportunities.unshift(opp);
    systemState.stats.opportunitiesDetected++;
    systemState.stats.totalScans++;
    
    addActivity('ScannerAgent', 'Opportunity detected', `Found ${opp.tokenPair} opportunity: $${opp.profitUSD.toFixed(2)} profit`, 'success');
    
    // Risk assessment
    agentStates.RiskAgent.status = 'processing';
    addActivity('RiskAgent', 'Assessing risk', `Analyzing ${opp.tokenPair} - Risk score: ${(opp.riskScore * 100).toFixed(1)}%`, 'info');
    
    // Auto-process some opportunities
    setTimeout(() => {
      const idx = opportunities.findIndex(o => o.id === opp.id);
      if (idx !== -1 && opportunities[idx].status === 'pending_approval') {
        // 60% chance of approval
        if (Math.random() < 0.6) {
          opportunities[idx].status = 'approved';
          systemState.stats.opportunitiesApproved++;
          addActivity('RiskAgent', 'Opportunity approved', `${opp.tokenPair} passed risk assessment`, 'success');
          
          // Simulate execution
          setTimeout(() => {
            const execIdx = opportunities.findIndex(o => o.id === opp.id);
            if (execIdx !== -1) {
              opportunities[execIdx].status = 'executing';
              agentStates.ExecutorAgent.status = 'processing';
              agentStates.ExecutorAgent.lastActivity = Date.now();
              addActivity('ExecutorAgent', 'Executing trade', `Executing ${opp.tokenPair} arbitrage`, 'info');
              
              setTimeout(() => {
                const finalIdx = opportunities.findIndex(o => o.id === opp.id);
                if (finalIdx !== -1) {
                  opportunities[finalIdx].status = 'executed';
                  systemState.stats.executionsAttempted++;
                  systemState.stats.executionsSuccessful++;
                  systemState.stats.totalProfit += opportunities[finalIdx].profitUSD;
                  systemState.stats.successRate = 
                    (systemState.stats.executionsSuccessful / systemState.stats.executionsAttempted) * 100;
                  agentStates.ExecutorAgent.status = 'active';
                  agentStates.ExecutorAgent.tasksProcessed++;
                  addActivity('ExecutorAgent', 'Trade executed', `Successfully executed ${opp.tokenPair} for $${opp.profitUSD.toFixed(2)} profit`, 'success');
                }
              }, 2000);
            }
          }, 3000);
        } else {
          opportunities[idx].status = 'rejected';
          addActivity('RiskAgent', 'Opportunity rejected', `${opp.tokenPair} failed risk assessment - too risky`, 'error');
        }
      }
    }, 5000);
  }
}
