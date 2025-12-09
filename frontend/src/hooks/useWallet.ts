/**
 * useWallet Hook - Manages Keplr wallet connection for Cosmos
 */

import { useState, useEffect, useCallback } from 'react';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { WalletState } from '../types';

// Sei Testnet configuration
const SEI_TESTNET = {
  chainId: 'atlantic-2',
  chainName: 'Sei Testnet',
  rpc: 'https://rpc.atlantic-2.seinetwork.io',
  rest: 'https://rest.atlantic-2.seinetwork.io',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'sei',
    bech32PrefixAccPub: 'seipub',
    bech32PrefixValAddr: 'seivaloper',
    bech32PrefixValPub: 'seivaloperpub',
    bech32PrefixConsAddr: 'seivalcons',
    bech32PrefixConsPub: 'seivalconspub',
  },
  currencies: [{
    coinDenom: 'SEI',
    coinMinimalDenom: 'usei',
    coinDecimals: 6,
    coinGeckoId: 'sei-network',
  }],
  feeCurrencies: [{
    coinDenom: 'SEI',
    coinMinimalDenom: 'usei',
    coinDecimals: 6,
    coinGeckoId: 'sei-network',
  }],
  stakeCurrency: {
    coinDenom: 'SEI',
    coinMinimalDenom: 'usei',
    coinDecimals: 6,
    coinGeckoId: 'sei-network',
  },
  features: ['ibc-transfer', 'ibc-go'],
};

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>(() => {
    // Try to restore wallet state from localStorage
    const saved = localStorage.getItem('wallet_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          address: null,
          balance: null,
          chainId: null,
          connected: false,
          isConnecting: false,
        };
      }
    }
    return {
      address: null,
      balance: null,
      chainId: null,
      connected: false,
      isConnecting: false,
    };
  });

  const [client, setClient] = useState<StargateClient | null>(null);

  // Save wallet state to localStorage whenever it changes
  useEffect(() => {
    if (wallet.connected) {
      localStorage.setItem('wallet_state', JSON.stringify(wallet));
    } else {
      localStorage.removeItem('wallet_state');
    }
  }, [wallet]);

  // Check if Keplr is installed
  const isKeplrInstalled = (): boolean => {
    return typeof window.keplr !== 'undefined';
  };

  // Get account balance
  const getBalance = async (address: string, clientInstance: StargateClient): Promise<string> => {
    try {
      const balance = await clientInstance.getBalance(address, 'usei');
      // Convert usei to SEI (1 SEI = 1,000,000 usei)
      const seiBalance = parseFloat(balance.amount) / 1_000_000;
      return seiBalance.toFixed(6);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  };

  // Suggest Sei Testnet chain to Keplr if not already added
  const suggestChain = async () => {
    if (!window.keplr) return;

    try {
      await window.keplr.experimentalSuggestChain(SEI_TESTNET);
    } catch (error) {
      console.error('Error suggesting chain:', error);
    }
  };

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isKeplrInstalled()) {
      alert('Please install Keplr wallet to use this feature!');
      window.open('https://www.keplr.app/download', '_blank');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      // Suggest chain first (in case it's not added)
      await suggestChain();

      // Enable Keplr for Sei Testnet
      await window.keplr!.enable(SEI_TESTNET.chainId);

      // Get offline signer
      const offlineSigner = window.keplr!.getOfflineSigner(SEI_TESTNET.chainId);
      
      // Get accounts
      const accounts = await offlineSigner.getAccounts();

      if (accounts.length > 0) {
        const address = accounts[0].address;

        // Connect to Sei RPC
        const clientInstance = await StargateClient.connect(SEI_TESTNET.rpc);
        
        // Get balance
        const balance = await getBalance(address, clientInstance);

        setClient(clientInstance);
        
        // Update wallet state with all fields
        const newWalletState = {
          address,
          balance,
          chainId: SEI_TESTNET.chainId,
          connected: true,
          isConnecting: false,
        };
        
        setWallet(newWalletState);

        console.log('✅ Connected to Keplr wallet');
        console.log('   Address:', address);
        console.log('   Balance:', balance, 'SEI');
        console.log('   Wallet State:', newWalletState);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      let errorMessage = 'Failed to connect to Keplr wallet';
      if (error.message?.includes('rejected')) {
        errorMessage = 'Connection request was rejected';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Sei Testnet not found in Keplr';
      }
      
      alert(errorMessage);
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    if (client) {
      client.disconnect();
    }
    
    setWallet({
      address: null,
      balance: null,
      chainId: null,
      connected: false,
      isConnecting: false,
    });
    setClient(null);
    
    console.log('✅ Disconnected from Keplr wallet');
  }, [client]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!wallet.connected || !wallet.address || !client) return;

    try {
      const balance = await getBalance(wallet.address, client);
      setWallet(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  }, [wallet.connected, wallet.address, client]);

  // Listen for Keplr account changes
  useEffect(() => {
    if (!window.keplr) return;

    const handleAccountChange = () => {
      if (wallet.connected) {
        // Reconnect with new account
        disconnect();
        setTimeout(() => connect(), 100);
      }
    };

    window.addEventListener('keplr_keystorechange', handleAccountChange);

    return () => {
      window.removeEventListener('keplr_keystorechange', handleAccountChange);
    };
  }, [wallet.connected, connect, disconnect]);

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!wallet.connected) return;

    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, [wallet.connected, refreshBalance]);

  // Auto-reconnect on mount if wallet was previously connected
  useEffect(() => {
    const autoReconnect = async () => {
      const saved = localStorage.getItem('wallet_state');
      if (saved && window.keplr) {
        try {
          const savedState = JSON.parse(saved);
          if (savedState.connected && savedState.address) {
            console.log('Auto-reconnecting wallet...');
            await connect();
          }
        } catch (error) {
          console.error('Auto-reconnect failed:', error);
        }
      }
    };
    
    autoReconnect();
  }, []); // Only run once on mount

  return {
    wallet,
    connect,
    disconnect,
    refreshBalance,
    isKeplrInstalled,
    client,
  };
};
