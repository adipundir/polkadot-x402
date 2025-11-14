/**
 * x402 Polkadot Interceptor
 * 
 * Axios interceptor for handling HTTP 402 Payment Required responses
 * and processing payments via Polkadot transactions.
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type {
  X402PaymentHeaders,
  PaymentInfo,
  X402InterceptorOptions,
  PaymentResult,
} from '@/types/x402';
import {
  X402PaymentError,
  InvalidPaymentInfoError,
} from '@/types/x402';
import { PolkadotPaymentHandler, createPolkadotPaymentHandler } from './polkadot-payment';
import { connectWallet, getSigner } from './wallet';
import type { Signer } from '@polkadot/api/types';

/**
 * Parse x402 payment headers from HTTP response
 * 
 * @param headers Response headers
 * @returns Parsed payment information
 */
function parsePaymentHeaders(headers: Record<string, string | string[] | undefined>): X402PaymentHeaders {
  const paymentHeaders: X402PaymentHeaders = {};

  // Common header names for x402 payment information
  const headerMappings: Record<string, keyof X402PaymentHeaders> = {
    'x-payment-amount': 'amount',
    'x-payment-address': 'address',
    'x-payment-currency': 'currency',
    'x-payment-request-id': 'requestId',
    'payment-amount': 'amount',
    'payment-address': 'address',
    'payment-currency': 'currency',
    'payment-request-id': 'requestId',
  };

  // Parse headers (case-insensitive)
  const lowerHeaders: Record<string, string> = {};
  Object.keys(headers).forEach(key => {
    const value = headers[key];
    if (typeof value === 'string') {
      lowerHeaders[key.toLowerCase()] = value;
    } else if (Array.isArray(value) && value.length > 0) {
      lowerHeaders[key.toLowerCase()] = value[0];
    }
  });

  Object.entries(headerMappings).forEach(([headerName, property]) => {
    const value = lowerHeaders[headerName.toLowerCase()];
    if (value && property !== 'metadata') {
      (paymentHeaders as any)[property] = value;
    }
  });

  // Parse metadata from headers (any header starting with x-payment-meta-)
  const metadata: Record<string, string> = {};
  Object.keys(lowerHeaders).forEach(key => {
    if (key.startsWith('x-payment-meta-')) {
      const metaKey = key.replace('x-payment-meta-', '');
      const metaValue = lowerHeaders[key];
      if (metaValue) {
        metadata[metaKey] = metaValue;
      }
    }
  });

  if (Object.keys(metadata).length > 0) {
    paymentHeaders.metadata = metadata;
  }

  return paymentHeaders;
}

/**
 * Convert payment headers to PaymentInfo
 * 
 * @param headers Payment headers
 * @param config Configuration for defaults
 * @returns Payment information
 */
function headersToPaymentInfo(
  headers: X402PaymentHeaders,
  config: X402InterceptorOptions
): PaymentInfo {
  const decimals = config.polkadotConfig.decimals || 10;
  
  // Parse amount
  let amount: bigint;
  if (headers.amount) {
    // Try to parse as number with decimals
    const amountStr = headers.amount.trim();
    if (amountStr.includes('.')) {
      // Decimal format: "1.5" -> 15000000000 (for 10 decimals)
      const [integer, decimal] = amountStr.split('.');
      const decimalPart = decimal.padEnd(decimals, '0').slice(0, decimals);
      amount = BigInt(integer) * BigInt(10 ** decimals) + BigInt(decimalPart);
    } else {
      // Already in smallest unit
      amount = BigInt(amountStr);
    }
  } else {
    throw new InvalidPaymentInfoError('Payment amount not specified in headers');
  }

  // Get recipient address
  const recipient = headers.address || config.polkadotConfig.defaultRecipient;
  if (!recipient) {
    throw new InvalidPaymentInfoError('Recipient address not specified in headers or config');
  }

  // Get currency
  const currency = headers.currency || config.polkadotConfig.currency || 'DOT';

  return {
    amount,
    recipient,
    currency,
    requestId: headers.requestId,
    metadata: headers.metadata,
  };
}

/**
 * Setup x402 interceptor on an Axios instance
 * 
 * @param axiosInstance Axios instance to add interceptor to
 * @param options Interceptor configuration options
 * @returns Cleanup function to remove interceptor
 */
export function setupX402Interceptor(
  axiosInstance: AxiosInstance,
  options: X402InterceptorOptions
): () => void {
  const paymentHandler = createPolkadotPaymentHandler(options.polkadotConfig);
  const maxRetries = options.maxRetries || 3;
  const autoRetry = options.autoRetry !== false; // Default to true

  // Track payment attempts per request
  const paymentAttempts = new Map<string, number>();

  // Response interceptor to handle 402 responses
  const responseInterceptor = axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Success - clear any payment attempts for this request
      const requestKey = getRequestKey(response.config);
      paymentAttempts.delete(requestKey);
      return response;
    },
    async (error: AxiosError) => {
      // Check if this is a 402 Payment Required response
      if (error.response?.status === 402) {
        const requestKey = getRequestKey(error.config);
        const attempts = paymentAttempts.get(requestKey) || 0;

        // Check retry limit
        if (attempts >= maxRetries) {
          paymentAttempts.delete(requestKey);
          return Promise.reject(
            new X402PaymentError(
              `Payment required but max retries (${maxRetries}) exceeded`,
              'MAX_RETRIES_EXCEEDED'
            )
          );
        }

        paymentAttempts.set(requestKey, attempts + 1);

        try {
          // Parse payment headers
          const paymentHeaders = parsePaymentHeaders(
            error.response.headers as Record<string, string | string[] | undefined>
          );

          // Convert to PaymentInfo
          const paymentInfo = headersToPaymentInfo(paymentHeaders, options);

          // Process payment
          let txHash: string;
          
          if (options.onPaymentRequired) {
            // Use custom payment handler
            txHash = await options.onPaymentRequired(paymentInfo);
          } else {
            // Default payment flow using wallet integration
            const address = options.getAccountAddress 
              ? await options.getAccountAddress()
              : (await connectWallet())[0]?.address;
            
            if (!address) {
              throw new X402PaymentError(
                'No account address available for payment',
                'NO_ACCOUNT',
                paymentInfo
              );
            }

            const signer = options.getSigner
              ? await options.getSigner(address)
              : await getSigner(address);

            // Process payment using payment handler
            const result = await paymentHandler.processPayment(paymentInfo, signer, address);
            txHash = result.txHash;
          }

          // Wait for payment confirmation if auto-retry is enabled
          if (autoRetry) {
            // Wait a bit for payment to be processed
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Retry the original request
            if (error.config) {
              return axiosInstance.request(error.config);
            }
          }

          // Return payment result
          return Promise.reject(
            new X402PaymentError(
              `Payment processed (tx: ${txHash}) but request not retried`,
              'PAYMENT_PROCESSED',
              paymentInfo
            )
          );
        } catch (paymentError) {
          // Payment failed
          if (paymentError instanceof X402PaymentError) {
            return Promise.reject(paymentError);
          }
          
          return Promise.reject(
            new X402PaymentError(
              `Payment processing failed: ${paymentError instanceof Error ? paymentError.message : String(paymentError)}`,
              'PAYMENT_PROCESSING_ERROR',
              paymentError instanceof InvalidPaymentInfoError ? paymentError.paymentInfo : undefined
            )
          );
        }
      }

      // Not a 402 error, pass through
      return Promise.reject(error);
    }
  );

  // Cleanup function
  return () => {
    axiosInstance.interceptors.response.eject(responseInterceptor);
    paymentHandler.disconnect().catch(() => {
      // Ignore disconnect errors
    });
  };
}

/**
 * Get a unique key for a request (for tracking payment attempts)
 * 
 * @param config Request config
 * @returns Unique request key
 */
function getRequestKey(config: InternalAxiosRequestConfig | undefined): string {
  if (!config) {
    return Math.random().toString();
  }
  
  return `${config.method || 'GET'}:${config.url || ''}:${JSON.stringify(config.params || {})}`;
}

/**
 * Create an Axios instance with x402 interceptor pre-configured
 * 
 * @param options Interceptor configuration options
 * @param baseConfig Base Axios configuration
 * @returns Axios instance with x402 interceptor
 */
export function createX402Client(
  options: X402InterceptorOptions,
  baseConfig?: AxiosRequestConfig
): AxiosInstance {
  const client = axios.create(baseConfig);
  setupX402Interceptor(client, options);
  return client;
}

/**
 * Default export for convenience
 */
export default {
  setupX402Interceptor,
  createX402Client,
  createPolkadotPaymentHandler,
};

