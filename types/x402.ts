/**
 * x402 Payment Protocol Types for Polkadot
 * 
 * These types define the structure for handling HTTP 402 Payment Required
 * responses and processing payments via Polkadot transactions.
 */

/**
 * Payment header structure from HTTP 402 response
 */
export interface X402PaymentHeaders {
  /**
   * Payment amount required (in smallest unit, e.g., Planck for DOT)
   */
  amount?: string;
  
  /**
   * Recipient address (SS58 format for Polkadot)
   */
  address?: string;
  
  /**
   * Payment token/currency identifier
   */
  currency?: string;
  
  /**
   * Payment request ID for tracking
   */
  requestId?: string;
  
  /**
   * Additional payment metadata
   */
  metadata?: Record<string, string>;
}

/**
 * Parsed payment information from 402 response
 */
export interface PaymentInfo {
  amount: bigint;
  recipient: string;
  currency: string;
  requestId?: string;
  metadata?: Record<string, string>;
}

/**
 * Polkadot-specific payment configuration
 */
export interface PolkadotPaymentConfig {
  /**
   * RPC endpoint URL (WebSocket or HTTP)
   */
  rpcEndpoint: string;
  
  /**
   * Network/chain identifier
   */
  chainId?: string;
  
  /**
   * Default recipient address if not provided in headers
   */
  defaultRecipient?: string;
  
  /**
   * Currency symbol (default: DOT)
   */
  currency?: string;
  
  /**
   * Decimals for the currency (default: 10 for DOT)
   */
  decimals?: number;
}

/**
 * Interceptor configuration options
 */
export interface X402InterceptorOptions {
  /**
   * Polkadot payment configuration
   */
  polkadotConfig: PolkadotPaymentConfig;
  
  /**
   * Function to handle payment (to be implemented with wallet integration)
   * If not provided, will attempt to use wallet connection
   */
  onPaymentRequired?: (paymentInfo: PaymentInfo) => Promise<string>;
  
  /**
   * Function to get the current account address
   * If not provided, will attempt to use first available account
   */
  getAccountAddress?: () => Promise<string | null>;
  
  /**
   * Function to get the signer for an account
   * If not provided, will attempt to use wallet connection
   */
  getSigner?: (address: string) => Promise<any>;
  
  /**
   * Maximum number of payment retries
   */
  maxRetries?: number;
  
  /**
   * Timeout for payment transactions (in milliseconds)
   */
  paymentTimeout?: number;
  
  /**
   * Whether to automatically retry after payment
   */
  autoRetry?: boolean;
}

/**
 * Payment transaction result
 */
export interface PaymentResult {
  /**
   * Transaction hash
   */
  txHash: string;
  
  /**
   * Block number where transaction was included
   */
  blockNumber?: number;
  
  /**
   * Whether payment was successful
   */
  success: boolean;
  
  /**
   * Error message if payment failed
   */
  error?: string;
}

/**
 * Error types for payment processing
 */
export class X402PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public paymentInfo?: PaymentInfo
  ) {
    super(message);
    this.name = 'X402PaymentError';
  }
}

export class PaymentTimeoutError extends X402PaymentError {
  constructor(message: string = 'Payment transaction timed out', paymentInfo?: PaymentInfo) {
    super(message, 'PAYMENT_TIMEOUT', paymentInfo);
    this.name = 'PaymentTimeoutError';
  }
}

export class PaymentFailedError extends X402PaymentError {
  constructor(message: string = 'Payment transaction failed', paymentInfo?: PaymentInfo) {
    super(message, 'PAYMENT_FAILED', paymentInfo);
    this.name = 'PaymentFailedError';
  }
}

export class InvalidPaymentInfoError extends X402PaymentError {
  constructor(message: string = 'Invalid payment information', paymentInfo?: PaymentInfo) {
    super(message, 'INVALID_PAYMENT_INFO', paymentInfo);
    this.name = 'InvalidPaymentInfoError';
  }
}

