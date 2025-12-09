/**
 * Type definitions for the frontend
 */

export interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | string | null;
  connected: boolean;
  isConnecting: boolean;
}

export interface AgentStatus {
  name: string;
  status: 'active' | 'idle' | 'error' | 'processing';
  lastActivity: number;
  tasksProcessed: number;
}

export interface ArbitrageOpportunity {
  id: string;
  tokenPair: {
    tokenA: { symbol: string; address: string };
    tokenB: { symbol: string; address: string };
  };
  buyPrice: number;
  sellPrice: number;
  potentialProfit: number;
  profitUSD?: number;
  timestamp: number;
  status: 'detected' | 'assessing' | 'approved' | 'pending_approval' | 'rejected' | 'executing' | 'completed' | 'failed';
  riskScore?: number;
}

export interface ExecutionResult {
  opportunityId: string;
  success: boolean;
  txHash?: string;
  amountIn: string;
  amountOut?: string;
  gasUsed?: number;
  actualProfit?: number;
  timestamp: number;
}

export interface SystemStats {
  totalScans: number;
  opportunitiesDetected: number;
  opportunitiesApproved: number;
  executionsAttempted: number;
  executionsSuccessful: number;
  totalProfit: number;
  successRate: number;
  uptime: number;
}

export interface ScanProgress {
  currentPair: string;
  pairsScanned: number;
  totalPairs: number;
  nextScanIn: number;
}

export interface AgentActivity {
  timestamp: number;
  agent: 'scanner' | 'risk' | 'executor';
  action: string;
  details: string;
  status: 'success' | 'warning' | 'error' | 'info';
}
