/**
 * x402 Protocol Type Definitions
 * Based on x402 protocol specifications
 */

/**
 * Payment requirements structure as specified by x402 protocol
 */
export interface PaymentRequirements {
  x402Version: number;
  scheme: string;
  network: string;
  extra?: Record<string, any>;
}

/**
 * Verification request payload
 */
export interface VerifyRequest {
  payload: string;
  details: PaymentRequirements;
}

/**
 * Verification result
 */
export interface VerificationResult {
  valid: boolean;
  error?: string;
  details?: {
    amount: string;
    token: string;
    from: string;
    to: string;
    nonce?: string;
    timestamp?: number;
  };
}

/**
 * Settlement request payload
 */
export interface SettleRequest {
  payload: string;
  details: PaymentRequirements;
}

/**
 * Settlement result
 */
export interface SettlementResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Supported payment configuration
 */
export interface SupportedPayment {
  x402Version: number;
  scheme: string;
  network: string;
  extra?: Record<string, any>;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, any>;
}

