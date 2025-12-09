/**
 * useAgentData Hook - Fetches agent data from Netlify Functions (polling instead of WebSocket)
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/.netlify/functions';
const POLL_INTERVAL = 3000; // Poll every 3 seconds

export interface AgentStatus {
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

export interface SystemSettings {
  scanInterval: number;
  minProfitUSD: number;
  maxSlippage: number;
  requireApproval: boolean;
}

export const useAgentData = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [systemRunning, setSystemRunning] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalScans: 0,
    opportunitiesDetected: 0,
    opportunitiesApproved: 0,
    executionsAttempted: 0,
    executionsSuccessful: 0,
    totalProfit: 0,
    successRate: 0,
    uptime: 0,
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    scanInterval: 30,
    minProfitUSD: 1.0,
    maxSlippage: 1.0,
    requireApproval: true,
  });
  const [connected, setConnected] = useState(false);

  // Fetch system status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api-status`);
      setSystemRunning(response.data.running);
      setSystemStats(response.data.stats);
      setSystemSettings(response.data.settings);
      setConnected(true);
    } catch (error) {
      console.error('Error fetching status:', error);
      setConnected(false);
    }
  }, []);

  // Fetch agent statuses
  const fetchAgents = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api-agents`);
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  }, []);

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api-opportunities`);
      setOpportunities(response.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  }, []);

  // Start system
  const startSystem = useCallback(async () => {
    try {
      await axios.post(`${API_BASE_URL}/api-status`, { action: 'start' });
      setSystemRunning(true);
    } catch (error) {
      console.error('Error starting system:', error);
    }
  }, []);

  // Stop system
  const stopSystem = useCallback(async () => {
    try {
      await axios.post(`${API_BASE_URL}/api-status`, { action: 'stop' });
      setSystemRunning(false);
    } catch (error) {
      console.error('Error stopping system:', error);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<SystemSettings>) => {
    try {
      await axios.post(`${API_BASE_URL}/api-status`, { settings: newSettings });
      setSystemSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }, []);

  // Approve opportunity
  const approveOpportunity = useCallback(async (opportunityId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api-opportunities`, {
        action: 'approve',
        opportunityId,
      });
      
      // Update local state
      setOpportunities(prev =>
        prev.map(opp =>
          opp.id === opportunityId ? { ...opp, status: 'approved' as const } : opp
        )
      );
    } catch (error) {
      console.error('Error approving opportunity:', error);
    }
  }, []);

  // Reject opportunity
  const rejectOpportunity = useCallback(async (opportunityId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api-opportunities`, {
        action: 'reject',
        opportunityId,
      });
      
      // Remove from local state
      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
    } catch (error) {
      console.error('Error rejecting opportunity:', error);
    }
  }, []);

  // Polling effect
  useEffect(() => {
    // Initial fetch
    fetchStatus();
    fetchAgents();
    fetchOpportunities();

    // Set up polling
    const intervalId = setInterval(() => {
      fetchStatus();
      fetchAgents();
      fetchOpportunities();
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchStatus, fetchAgents, fetchOpportunities]);

  return {
    agents,
    opportunities,
    systemRunning,
    systemStats,
    systemSettings,
    connected,
    startSystem,
    stopSystem,
    updateSettings,
    approveOpportunity,
    rejectOpportunity,
  };
};
