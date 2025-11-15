/**
 * EVM Network configurations
 * Supports both standard networks and custom chain configurations
 */

import { env } from '@/lib/env';

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Standard network configurations
 * Polkadot Hub TestNet facilitator
 */
export const STANDARD_NETWORKS: Record<string, NetworkConfig> = {
  'polkadot-hub-testnet': {
    name: 'Polkadot Hub TestNet',
    chainId: 420420422,
    rpcUrl: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
    nativeCurrency: {
      name: 'PAS',
      symbol: 'PAS',
      decimals: 18,
    },
  },
};

/**
 * Get network configuration for a given network identifier
 * Supports custom chains via environment variables
 */
export function getNetworkConfig(network: string): NetworkConfig {
  // Check if it's a standard network
  if (STANDARD_NETWORKS[network]) {
    return STANDARD_NETWORKS[network];
  }

  // Check if custom chain configuration is provided
  if (env.CHAIN_ID > 0 && env.CHAIN_RPC_URL) {
    // Use custom chain configuration
    return {
      name: env.CHAIN_NAME || `Custom Chain (${network})`,
      chainId: env.CHAIN_ID,
      rpcUrl: env.CHAIN_RPC_URL,
      nativeCurrency: {
        name: env.NATIVE_CURRENCY_NAME,
        symbol: env.NATIVE_CURRENCY_SYMBOL,
        decimals: env.NATIVE_CURRENCY_DECIMALS,
      },
    };
  }

  // Fallback: try to use RPC_URL from env if available
  if (env.RPC_URL && env.RPC_URL !== 'https://testnet-passet-hub-eth-rpc.polkadot.io') {
    // Attempt to infer chain ID from network name or use a default
    // For custom chains, chain ID should be provided via env
    const chainId = env.CHAIN_ID || 420420422; // Default to Polkadot Hub TestNet if not specified
    
    return {
      name: env.CHAIN_NAME || `Custom Chain (${network})`,
      chainId,
      rpcUrl: env.RPC_URL,
      nativeCurrency: {
        name: env.NATIVE_CURRENCY_NAME,
        symbol: env.NATIVE_CURRENCY_SYMBOL,
        decimals: env.NATIVE_CURRENCY_DECIMALS,
      },
    };
  }

  // Default fallback
  throw new Error(
    `Network "${network}" is not supported. Please configure CHAIN_ID, CHAIN_RPC_URL, and other chain details in environment variables for custom chains.`
  );
}

/**
 * Get all supported networks
 */
export function getSupportedNetworks(): string[] {
  return Object.keys(STANDARD_NETWORKS);
}

