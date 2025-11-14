/**
 * Wallet Integration for Polkadot
 * 
 * Handles connection to Polkadot.js browser extension
 */

import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

/**
 * Enable Polkadot.js extension and get accounts
 * 
 * @param appName Name of the application requesting access
 * @returns Promise that resolves with available accounts
 */
export async function connectWallet(appName: string = 'x402-polkadot'): Promise<InjectedAccountWithMeta[]> {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    throw new Error('Wallet connection is only available in browser environment');
  }

  try {
    // Request access to extension
    const extensions = await web3Enable(appName);
    
    if (extensions.length === 0) {
      throw new Error('No Polkadot.js extension found. Please install it from https://polkadot.js.org/extension/');
    }

    // Get all accounts
    const accounts = await web3Accounts();
    
    if (accounts.length === 0) {
      throw new Error('No accounts found in Polkadot.js extension. Please create an account first.');
    }

    return accounts;
  } catch (error) {
    throw new Error(`Failed to connect wallet: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get signer for an account address
 * 
 * @param address Account address
 * @returns Promise that resolves with signer
 */
export async function getSigner(address: string) {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    throw new Error('Wallet signer is only available in browser environment');
  }

  const injector = await web3FromAddress(address);
  return injector.signer;
}

/**
 * Format address for display
 * 
 * @param address Full address
 * @returns Formatted address (first 6 + last 6 characters)
 */
export function formatAddress(address: string): string {
  if (address.length <= 12) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

