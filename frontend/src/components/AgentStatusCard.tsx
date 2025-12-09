/**
 * AgentStatusCard Component - Display individual agent status
 */

import React from 'react';
import { Activity, Clock, CheckCircle } from 'lucide-react';
import { AgentStatus } from '../types';

interface Props {
  agent: AgentStatus;
}

export const AgentStatusCard: React.FC<Props> = ({ agent }) => {
  const getStatusColor = () => {
    switch (agent.status) {
      case 'active':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'idle':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'error':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const timeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {agent.status === 'active' && (
            <Activity className="w-5 h-5 text-green-400 animate-pulse" />
          )}
          <h3 className="font-semibold text-lg">{agent.name}</h3>
        </div>
        <span className={`badge ${getStatusColor()}`}>
          {agent.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Last Activity
          </span>
          <span className="font-medium">{timeSince(agent.lastActivity)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Tasks Processed
          </span>
          <span className="font-medium">{agent.tasksProcessed}</span>
        </div>
      </div>
    </div>
  );
};
