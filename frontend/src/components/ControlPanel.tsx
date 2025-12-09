import React from 'react';
import { Play, Square, Settings as SettingsIcon } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
  walletConnected: boolean;
}

export function ControlPanel({ isRunning, onStart, onStop, onOpenSettings, walletConnected }: ControlPanelProps) {
  // Debug log
  React.useEffect(() => {
    console.log('ControlPanel - walletConnected:', walletConnected);
  }, [walletConnected]);

  return (
    <div className="card p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">System Control</h2>
          <p className="text-gray-400 text-sm">
            {!walletConnected && 'Connect your wallet to start'}
            {walletConnected && !isRunning && 'Ready to start scanning'}
            {walletConnected && isRunning && 'System is actively scanning for opportunities'}
          </p>
          {/* Debug info */}
          <p className="text-xs text-gray-500 mt-1">
            Wallet Connected: {walletConnected ? '✅ Yes' : '❌ No'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="btn-secondary px-4 py-2 flex items-center gap-2"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </button>

          {!isRunning ? (
            <button
              onClick={onStart}
              disabled={!walletConnected}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg ${
                walletConnected
                  ? 'bg-green-500 hover:bg-green-600 text-white hover:shadow-green-500/50'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5" />
              Start System
            </button>
          ) : (
            <button
              onClick={onStop}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              <Square className="w-5 h-5" />
              Stop System
            </button>
          )}
        </div>
      </div>

      {!walletConnected && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚠️ Please connect your MetaMask wallet to enable system controls
          </p>
        </div>
      )}
    </div>
  );
}
