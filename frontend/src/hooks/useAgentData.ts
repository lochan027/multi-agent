/**
 * useAgentData Hook - Connects to backend WebSocket for real-time agent data
 */

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  AgentStatus,
  ArbitrageOpportunity,
  SystemStats,
  ScanProgress,
  AgentActivity,
} from '../types';

// Get backend URL from environment variable or use default
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useAgentData = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { name: 'ScannerAgent', status: 'idle', lastActivity: Date.now(), tasksProcessed: 0 },
    { name: 'RiskAgent', status: 'idle', lastActivity: Date.now(), tasksProcessed: 0 },
    { name: 'ExecutorAgent', status: 'idle', lastActivity: Date.now(), tasksProcessed: 0 },
  ]);
  
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalScans: 0,
    opportunitiesDetected: 0,
    opportunitiesApproved: 0,
    executionsAttempted: 0,
    executionsSuccessful: 0,
    totalProfit: 0,
    successRate: 0,
    uptime: 0,
  });
  
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    currentPair: '',
    pairsScanned: 0,
    totalPairs: 0,
    nextScanIn: 20,
  });
  
  const [activityLog, setActivityLog] = useState<AgentActivity[]>([]);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to agent backend');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from agent backend');
      setConnected(false);
    });

    // Agent status updates
    socketInstance.on('agentStatus', (data: AgentStatus) => {
      setAgentStatuses(prev =>
        prev.map(agent =>
          agent.name === data.name ? { ...agent, ...data } : agent
        )
      );
    });

    // New opportunity detected
    socketInstance.on('opportunityDetected', (opportunity: ArbitrageOpportunity) => {
      setOpportunities(prev => [opportunity, ...prev].slice(0, 50));
      setActivityLog(prev => [
        {
          timestamp: Date.now(),
          agent: 'scanner' as const,
          action: 'Opportunity Detected',
          details: `${opportunity.tokenPair.tokenA.symbol}/${opportunity.tokenPair.tokenB.symbol} - ${(opportunity.potentialProfit * 100).toFixed(2)}% profit`,
          status: 'info' as const,
        },
        ...prev,
      ].slice(0, 100));
    });

    // Opportunity status update
    socketInstance.on('opportunityUpdate', (data: { id: string; status: string; details?: any }) => {
      setOpportunities(prev =>
        prev.map(opp =>
          opp.id === data.id ? { ...opp, status: data.status as any, ...data.details } : opp
        )
      );
    });

    // System stats update
    socketInstance.on('statsUpdate', (newStats: Partial<SystemStats>) => {
      setStats(prev => ({ ...prev, ...newStats }));
    });

    // Scan progress
    socketInstance.on('scanProgress', (progress: ScanProgress) => {
      setScanProgress(progress);
    });

    // Agent activity
    socketInstance.on('agentActivity', (activity: AgentActivity) => {
      setActivityLog(prev => [activity, ...prev].slice(0, 100));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return {
    socket,
    connected,
    agentStatuses,
    opportunities,
    stats,
    scanProgress,
    activityLog,
  };
};
