/**
 * Polkadot Payment Handler
 * 
 * This module provides the structure for handling payments via Polkadot transactions.
 * Wallet integration will be added in a future version.
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import type { Signer } from '@polkadot/api/types';
import type { 
  PaymentInfo, 
  PaymentResult, 
  PolkadotPaymentConfig,
} from '@/types/x402';
import {
  PaymentTimeoutError,
  PaymentFailedError,
  InvalidPaymentInfoError
} from '@/types/x402';

/**
 * Polkadot API instance manager
 */
export class PolkadotPaymentHandler {
  private api: ApiPromise | null = null;
  private provider: WsProvider | null = null;
  private config: PolkadotPaymentConfig;

  constructor(config: PolkadotPaymentConfig) {
    this.config = config;
  }

  /**
   * Initialize Polkadot API connection
   * 
   * @returns Promise that resolves when API is ready
   */
  async initialize(): Promise<void> {
    if (this.api) {
      return; // Already initialized
    }

    try {
      this.provider = new WsProvider(this.config.rpcEndpoint);
      this.api = await ApiPromise.create({ provider: this.provider });
      
      // Wait for API to be ready
      await this.api.isReady;
    } catch (error) {
      throw new Error(`Failed to initialize Polkadot API: ${error}`);
    }
  }

  /**
   * Get the Polkadot API instance
   * 
   * @returns ApiPromise instance
   */
  async getApi(): Promise<ApiPromise> {
    if (!this.api) {
      await this.initialize();
    }
    if (!this.api) {
      throw new Error('Polkadot API not initialized');
    }
    return this.api;
  }

  /**
   * Validate payment information
   * 
   * @param paymentInfo Payment information to validate
   * @throws InvalidPaymentInfoError if payment info is invalid
   */
  validatePaymentInfo(paymentInfo: PaymentInfo): void {
    if (!paymentInfo.recipient || paymentInfo.recipient.trim() === '') {
      throw new InvalidPaymentInfoError('Recipient address is required');
    }

    if (paymentInfo.amount <= BigInt(0)) {
      throw new InvalidPaymentInfoError('Payment amount must be greater than zero');
    }

    // Validate SS58 address format (basic check)
    // Full validation would require SS58 decoding
    if (!paymentInfo.recipient.match(/^[1-9A-HJ-NP-Za-km-z]{47,48}$/)) {
      throw new InvalidPaymentInfoError('Invalid SS58 address format');
    }
  }

  /**
   * Construct a balance transfer transaction
   * 
   * @param paymentInfo Payment information
   * @returns Transaction object (unsigned)
   */
  async createTransferTransaction(paymentInfo: PaymentInfo) {
    const api = await this.getApi();
    
    // Validate payment info
    this.validatePaymentInfo(paymentInfo);

    // Create transfer transaction
    const transfer = api.tx.balances.transfer(
      paymentInfo.recipient,
      paymentInfo.amount
    );

    return transfer;
  }

  /**
   * Sign and submit a transaction
   * 
   * @param transaction Unsigned transaction
   * @param signer Account signer (from Polkadot.js extension)
   * @param address Account address
   * @returns Promise that resolves with transaction hash
   */
  async signAndSubmit(
    transaction: any,
    signer: Signer,
    address: string
  ): Promise<string> {
    const api = await this.getApi();
    
    return new Promise((resolve, reject) => {
      transaction
        .signAndSend(address, { signer }, (result: any) => {
          if (result.status.isInBlock || result.status.isFinalized) {
            if (result.dispatchError) {
              let errorMessage = 'Transaction failed';
              if (result.dispatchError.isModule) {
                try {
                  const decoded = api.registry.findMetaError(result.dispatchError.asModule);
                  errorMessage = decoded ? `${decoded.section}.${decoded.name}: ${decoded.docs}` : errorMessage;
                } catch {
                  // If decoding fails, use default message
                }
              }
              reject(new PaymentFailedError(errorMessage));
            } else {
              resolve(result.txHash.toString());
            }
          } else if (result.isError) {
            reject(new PaymentFailedError('Transaction error'));
          }
        })
        .catch((error: Error) => {
          reject(new PaymentFailedError(`Transaction submission failed: ${error.message}`));
        });
    });
  }

  /**
   * Wait for transaction confirmation
   * 
   * @param txHash Transaction hash
   * @param timeout Timeout in milliseconds
   * @returns Promise that resolves with payment result
   */
  async waitForConfirmation(
    txHash: string,
    timeout: number = 60000
  ): Promise<PaymentResult> {
    const api = await this.getApi();
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new PaymentTimeoutError('Transaction confirmation timed out'));
      }, timeout);

      // Subscribe to transaction status
      // Note: This is a simplified structure. Full implementation would
      // subscribe to transaction events and wait for finalization
      api.rpc.chain.getBlock().then((block) => {
        clearTimeout(timeoutId);
        resolve({
          txHash,
          blockNumber: block.block.header.number.toNumber(),
          success: true,
        });
      }).catch((error: Error) => {
        clearTimeout(timeoutId);
        reject(new PaymentFailedError(`Transaction failed: ${error.message}`));
      });
    });
  }

  /**
   * Process a payment
   * 
   * This is the main entry point for processing payments.
   * 
   * @param paymentInfo Payment information
   * @param signer Account signer (from Polkadot.js extension)
   * @param address Account address
   * @returns Promise that resolves with payment result
   */
  async processPayment(
    paymentInfo: PaymentInfo,
    signer: Signer,
    address: string
  ): Promise<PaymentResult> {
    // Validate payment info
    this.validatePaymentInfo(paymentInfo);

    // Create transaction
    const transaction = await this.createTransferTransaction(paymentInfo);

    // Sign and submit
    const txHash = await this.signAndSubmit(transaction, signer, address);

    // Wait for confirmation
    const timeout = (this.config as any).paymentTimeout || 60000;
    const result = await this.waitForConfirmation(txHash, timeout);

    return result;
  }

  /**
   * Get account balance
   * 
   * @param address Account address (SS58 format)
   * @returns Promise that resolves with account balance
   */
  async getBalance(address: string): Promise<bigint> {
    const api = await this.getApi();
    
    const accountInfo = await api.query.system.account(address);
    // Type assertion needed for account data structure
    const accountData = accountInfo as any;
    const balance = accountData.data?.free || accountData.free;
    
    if (!balance) {
      return BigInt(0);
    }
    
    return typeof balance.toBigInt === 'function' 
      ? balance.toBigInt() 
      : BigInt(balance.toString());
  }

  /**
   * Disconnect from the API
   */
  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
    if (this.provider) {
      this.provider = null;
    }
  }
}

/**
 * Create a new Polkadot payment handler instance
 * 
 * @param config Polkadot payment configuration
 * @returns New PolkadotPaymentHandler instance
 */
export function createPolkadotPaymentHandler(
  config: PolkadotPaymentConfig
): PolkadotPaymentHandler {
  return new PolkadotPaymentHandler(config);
}

