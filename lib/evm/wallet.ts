/**
 * EVM Wallet and Provider Management
 * Handles wallet initialization with support for custom chains
 */

import { ethers } from 'ethers';
import { env } from '@/lib/env';
import { getNetworkConfig } from './networks';

let wallet: ethers.Wallet | null = null;
let provider: ethers.JsonRpcProvider | null = null;
let currentNetwork: string | null = null;

/**
 * Get or create RPC provider for a specific network
 */
export function getProvider(network?: string): ethers.JsonRpcProvider {
  const networkId = network || env.NETWORK;
  
  // Reuse provider if same network
  if (provider && currentNetwork === networkId) {
    return provider;
  }

  const networkConfig = getNetworkConfig(networkId);
  
  // Create custom network configuration for ethers
  const customNetwork = {
    name: networkConfig.name,
    chainId: networkConfig.chainId,
  };

  // Create provider with custom network
  provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl, customNetwork, {
    staticNetwork: ethers.Network.from(customNetwork),
  });
  
  currentNetwork = networkId;
  
  return provider;
}

/**
 * Get or create wallet instance
 * Wallet is initialized with the default network but can be used with any network
 */
export function getWallet(network?: string): ethers.Wallet {
  const networkId = network || env.NETWORK;
  
  if (!wallet) {
    const provider = getProvider(networkId);
    wallet = new ethers.Wallet(env.EVM_PRIVATE_KEY, provider);
    currentNetwork = networkId;
  } else if (networkId !== currentNetwork) {
    // Update provider if network changed
    const provider = getProvider(networkId);
    wallet = wallet.connect(provider);
    currentNetwork = networkId;
  }
  
  return wallet;
}

/**
 * Get wallet address
 */
export async function getWalletAddress(network?: string): Promise<string> {
  const wallet = getWallet(network);
  return await wallet.getAddress();
}

/**
 * Reset wallet and provider (useful for testing or network switching)
 */
export function resetWallet(): void {
  wallet = null;
  provider = null;
  currentNetwork = null;
}

