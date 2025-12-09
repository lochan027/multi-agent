/**
 * OpportunityCard Component - Display arbitrage opportunity
 */

import React from 'react';
import { TrendingUp, Clock, DollarSign, Activity } from 'lucide-react';
import { ArbitrageOpportunity } from '../types';

interface Props {
  opportunity: ArbitrageOpportunity;
}

export const OpportunityCard: React.FC<Props> = ({ opportunity }) => {
  const getStatusColor = () => {
    switch (opportunity.status) {
      case 'detected':
        return 'badge-info';
      case 'assessing':
        return 'badge-warning';
      case 'approved':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      case 'executing':
        return 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30 animate-pulse';
      case 'completed':
        return 'badge-success';
      case 'failed':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="card p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-lg">
              {opportunity.tokenPair.tokenA.symbol} / {opportunity.tokenPair.tokenB.symbol}
            </h4>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {formatTime(opportunity.timestamp)}
          </div>
        </div>
        <span className={`badge ${getStatusColor()}`}>
          {opportunity.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-400 mb-1">Buy Price</div>
          <div className="font-semibold">${opportunity.buyPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Sell Price</div>
          <div className="font-semibold">${opportunity.sellPrice.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            Potential Profit
          </span>
          <span className="text-green-400 font-bold text-lg">
            {(opportunity.potentialProfit * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};
