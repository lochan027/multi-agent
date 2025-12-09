/**
 * useWallet Hook - Manages MetaMask wallet connection for Ethereum
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import { WalletState } from '../types';

// Ethereum Mainnet configuration
const ETHEREUM_MAINNET = {
  chainId: '0x1', // 1 in hex
  chainName: 'Ethereum Mainnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://eth.llamarpc.com'],
  blockExplorerUrls: ['https://etherscan.io'],
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>(() => {
    // Don't restore wallet state - require manual connection
    return {
      address: null,
      balance: null,
      chainId: null,
      connected: false,
      isConnecting: false,
    };
  });

  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = (): boolean => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  };

  // Get account balance
  const getBalance = async (address: string, providerInstance: BrowserProvider): Promise<string> => {
    try {
      const balance = await providerInstance.getBalance(address);
      // Convert wei to ETH
      const ethBalance = ethers.formatEther(balance);
      return parseFloat(ethBalance).toFixed(4);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  };

  // Switch to Ethereum Mainnet
  const switchToMainnet = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ETHEREUM_MAINNET.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ETHEREUM_MAINNET],
          });
        } catch (addError) {
          console.error('Error adding Ethereum mainnet:', addError);
        }
      } else {
        console.error('Error switching to Ethereum mainnet:', switchError);
      }
    }
  };

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask wallet to use this feature!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      // Clear any previous errors
      console.clear();
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const address = accounts[0];

        // Create provider
        const providerInstance = new BrowserProvider(window.ethereum);
        
        // Get network
        const network = await providerInstance.getNetwork();
        const chainId = network.chainId.toString();

        // Switch to mainnet if not already
        if (chainId !== '1') {
          await switchToMainnet();
          // Re-get network after switch
          const newNetwork = await providerInstance.getNetwork();
          const newChainId = newNetwork.chainId.toString();
          
          if (newChainId !== '1') {
            throw new Error('Please switch to Ethereum Mainnet in MetaMask');
          }
        }

        // Get balance
        const balance = await getBalance(address, providerInstance);

        setProvider(providerInstance);
        
        // Update wallet state with all fields
        const newWalletState = {
          address,
          balance,
          chainId: '1',
          connected: true,
          isConnecting: false,
        };

        setWallet(newWalletState);
        console.log('Wallet connected:', address);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setWallet(prev => ({
        ...prev,
        connected: false,
        isConnecting: false,
      }));
      alert(error.message || 'Failed to connect wallet');
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      balance: null,
      chainId: null,
      connected: false,
      isConnecting: false,
    });
    setProvider(null);
    localStorage.removeItem('wallet_state');
    console.log('Wallet disconnected');
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        disconnect();
      } else if (accounts[0] !== wallet.address) {
        // User switched account
        console.log('Account changed, reconnecting...');
        connect();
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed:', chainId);
      // Reload the page to avoid state issues
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [wallet.address, connect, disconnect]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (wallet.connected && wallet.address && !provider) {
        await connect();
      }
    };

    autoConnect();
  }, []); // Only run on mount

  // Refresh balance periodically
  useEffect(() => {
    if (!wallet.connected || !wallet.address || !provider) return;

    const refreshBalance = async () => {
      try {
        const balance = await getBalance(wallet.address!, provider);
        setWallet(prev => ({ ...prev, balance }));
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    };

    // Refresh balance every 30 seconds
    const intervalId = setInterval(refreshBalance, 30000);

    return () => clearInterval(intervalId);
  }, [wallet.connected, wallet.address, provider]);

  return {
    ...wallet,
    connect,
    disconnect,
    isMetaMaskInstalled,
    provider,
  };
};
