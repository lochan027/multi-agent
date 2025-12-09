/**
 * WalletButton Component - Connect/Disconnect Keplr wallet button
 */

import React from 'react';
import { Wallet, Power, AlertCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const WalletButton: React.FC = () => {
  const { wallet, connect, disconnect, isKeplrInstalled } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-6)}`;
  };

  if (!isKeplrInstalled()) {
    return (
      <button
        onClick={() => window.open('https://www.keplr.app/download', '_blank')}
        className="btn-danger flex items-center gap-2"
      >
        <AlertCircle className="w-4 h-4" />
        Install Keplr
      </button>
    );
  }

  if (wallet.isConnecting) {
    return (
      <button disabled className="btn-secondary flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Connecting...
      </button>
    );
  }

  if (wallet.connected && wallet.address) {
    return (
      <div className="flex items-center gap-3">
        <div className="card px-4 py-2">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs text-gray-400">
                Sei Testnet
              </div>
              <div className="font-mono font-semibold text-sm">
                {formatAddress(wallet.address)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Balance</div>
              <div className="font-semibold">
                {parseFloat(wallet.balance || '0').toFixed(4)} SEI
              </div>
            </div>
            <button
              onClick={disconnect}
              className="btn-danger p-2"
              title="Disconnect"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="btn-primary flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      Connect Keplr
    </button>
  );
};
