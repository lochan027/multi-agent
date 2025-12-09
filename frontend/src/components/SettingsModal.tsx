import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

export interface SystemSettings {
  scanInterval: number;
  minProfitUSD: number;
  maxSlippage: number;
  requireApproval: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold mb-4 gradient-text">System Settings</h2>

        {/* Settings Form */}
        <div className="space-y-4">
          {/* Scan Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Scan Interval (seconds)
            </label>
            <input
              type="number"
              min="5"
              max="300"
              value={localSettings.scanInterval}
              onChange={(e) => setLocalSettings({ ...localSettings, scanInterval: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              How often to scan for opportunities (5-300 seconds)
            </p>
          </div>

          {/* Min Profit */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Minimum Profit (USD)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={localSettings.minProfitUSD}
              onChange={(e) => setLocalSettings({ ...localSettings, minProfitUSD: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Only execute trades with profit above this threshold
            </p>
          </div>

          {/* Max Slippage */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Maximum Slippage (%)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={localSettings.maxSlippage}
              onChange={(e) => setLocalSettings({ ...localSettings, maxSlippage: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Maximum allowed price slippage (0-10%)
            </p>
          </div>

          {/* Require Approval Toggle */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Require Trade Approval
                </label>
                <p className="text-xs text-gray-400">
                  Ask for approval before each trade or execute automatically
                </p>
              </div>
              
              <button
                onClick={() => setLocalSettings({ ...localSettings, requireApproval: !localSettings.requireApproval })}
                className={`ml-4 relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors ${
                  localSettings.requireApproval ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    localSettings.requireApproval ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className={`mt-3 p-3 rounded-lg border ${
              localSettings.requireApproval 
                ? 'bg-blue-500/10 border-blue-500/30' 
                : 'bg-orange-500/10 border-orange-500/30'
            }`}>
              <p className={`text-xs ${
                localSettings.requireApproval ? 'text-blue-400' : 'text-orange-400'
              }`}>
                {localSettings.requireApproval ? (
                  <>
                    <strong>Manual:</strong> Review each trade before execution
                  </>
                ) : (
                  <>
                    <strong>Autonomous:</strong> Execute trades automatically
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
