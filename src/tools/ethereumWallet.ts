/**
 * Ethereum Wallet Tool - Handles Ethereum mainnet wallet interactions
 * Uses ethers.js for Web3 interactions
 */

import { ethers } from 'ethers';

export interface EthereumWalletConfig {
  privateKey?: string;
  rpcUrl: string;
  chainId: number;
}

export class EthereumWalletTool {
  private provider: ethers.JsonRpcProvider;
  private wallet?: ethers.Wallet;
  private config: EthereumWalletConfig;

  constructor(config: EthereumWalletConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);

    if (config.privateKey) {
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    }
  }

  /**
   * Get wallet address
   */
  public getAddress(): string | null {
    return this.wallet?.address || null;
  }

  /**
   * Get ETH balance
   */
  public async getBalance(address?: string): Promise<string> {
    const addr = address || this.wallet?.address;
    if (!addr) {
      throw new Error('No address provided or wallet not configured');
    }

    const balance = await this.provider.getBalance(addr);
    return ethers.formatEther(balance);
  }

  /**
   * Get ERC-20 token balance
   */
  public async getTokenBalance(tokenAddress: string, walletAddress?: string): Promise<string> {
    const addr = walletAddress || this.wallet?.address;
    if (!addr) {
      throw new Error('No address provided or wallet not configured');
    }

    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
      this.provider
    );

    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(addr),
      tokenContract.decimals()
    ]);

    return ethers.formatUnits(balance, decimals);
  }

  /**
   * Get current gas price
   */
  public async getGasPrice(): Promise<string> {
    const feeData = await this.provider.getFeeData();
    return ethers.formatUnits(feeData.gasPrice || 0n, 'gwei');
  }

  /**
   * Estimate gas for a transaction
   */
  public async estimateGas(to: string, value: bigint = 0n, data: string = '0x'): Promise<bigint> {
    if (!this.wallet) {
      throw new Error('Wallet not configured');
    }

    return await this.provider.estimateGas({
      from: this.wallet.address,
      to,
      value,
      data,
    });
  }

  /**
   * Send ETH transaction
   */
  public async sendTransaction(to: string, amountEth: string): Promise<ethers.TransactionResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not configured');
    }

    const tx = await this.wallet.sendTransaction({
      to,
      value: ethers.parseEther(amountEth),
    });

    return tx;
  }

  /**
   * Wait for transaction confirmation
   */
  public async waitForTransaction(txHash: string, confirmations: number = 1): Promise<ethers.TransactionReceipt | null> {
    return await this.provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Get network info
   */
  public async getNetwork(): Promise<ethers.Network> {
    return await this.provider.getNetwork();
  }

  /**
   * Check if connected to mainnet
   */
  public async isMainnet(): Promise<boolean> {
    const network = await this.getNetwork();
    return network.chainId === 1n;
  }
}

// Common Ethereum mainnet token addresses
export const ETHEREUM_TOKENS = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
};

// Ethereum mainnet configuration
export const ETHEREUM_MAINNET_CONFIG = {
  chainId: 1,
  chainName: 'Ethereum Mainnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY',
    'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    'https://eth.llamarpc.com',
  ],
  blockExplorerUrls: ['https://etherscan.io'],
};
