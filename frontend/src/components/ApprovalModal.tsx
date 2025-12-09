import React from 'react';
import { Check, X, Clock, TrendingUp } from 'lucide-react';

interface ApprovalModalProps {
  opportunity: {
    id?: string;
    tokenPair: {
      tokenA: { symbol: string };
      tokenB: { symbol: string };
    };
    potentialProfit: number;
    priceDifference: number;
    buyPrice: number;
    sellPrice: number;
  };
  expectedProfit: number;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export function ApprovalModal({ opportunity, expectedProfit, onApprove, onReject, onClose }: ApprovalModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-xl w-full p-8 relative animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-500/20 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Trade Approval Required</h2>
            <p className="text-sm text-gray-400">Review this opportunity before execution</p>
          </div>
        </div>

        {/* Opportunity Details */}
        <div className="space-y-4 mb-8">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Token Pair</span>
              <span className="font-semibold text-lg">
                {opportunity.tokenPair.tokenA.symbol} / {opportunity.tokenPair.tokenB.symbol}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 block mb-1">Buy Price</span>
                <span className="font-mono text-green-400">${opportunity.buyPrice.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Sell Price</span>
                <span className="font-mono text-purple-400">${opportunity.sellPrice.toFixed(6)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-green-400">Expected Profit</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  ${expectedProfit.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">
                  {(opportunity.potentialProfit * 100).toFixed(2)}% gain
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> This trade has been analyzed by the Risk Agent and approved based on 
              your settings. Gas fees and slippage have been factored into the expected profit.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReject}
            className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <X className="w-5 h-5" />
            Reject Trade
          </button>
          <button
            onClick={onApprove}
            className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Check className="w-5 h-5" />
            Approve & Execute
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full text-sm text-gray-400 hover:text-white transition-colors"
        >
          Close without action
        </button>
      </div>
    </div>
  );
}
