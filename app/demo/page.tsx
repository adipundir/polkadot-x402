'use client';

import { useState } from 'react';
import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import CodeBlock from '@/components/CodeBlock';
import type { PaymentRequirements } from '@/types/x402';

interface DemoState {
  status: 'idle' | 'loading' | 'success' | 'error';
  weatherData?: any;
  transactionHash?: string;
  responseHeaders?: Record<string, string>;
  requestHeaders?: Record<string, string>;
  error?: string;
  paymentDetails?: {
    amount?: string;
    network?: string;
    payTo?: string;
    token?: string;
  };
  step?: string;
}

/**
 * Create an axios instance with x402 payment support
 * Uses server-side endpoint for payment creation to keep private keys secure
 */
function createX402Axios(baseURL: string): AxiosInstance {
  const instance = axios.create({ baseURL });

  // Add response interceptor for automatic 402 handling
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // Only handle 402 Payment Required errors
      if (error.response?.status !== 402) {
        return Promise.reject(error);
      }

      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
        _x402PaymentHeader?: string;
      };

      // Prevent infinite retry loops
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Extract payment requirements from 402 response
        const paymentRequirements = error.response.data as PaymentRequirements;

        if (!paymentRequirements || !paymentRequirements.network) {
          return Promise.reject(
            new Error('Invalid 402 response: missing payment requirements')
          );
        }

        // Call server-side endpoint to create payment header
        // This keeps the private key secure on the server
        // Use regular axios (not the x402 instance) to avoid infinite loop
        const paymentResponse = await axios.post(`${baseURL}/api/demo/create-payment`, {
          paymentRequirements,
        });

        if (!paymentResponse.data?.paymentHeader) {
          return Promise.reject(
            new Error(
              `Payment creation failed: ${paymentResponse.data?.error || 'No payment header returned'}`
            )
          );
        }

        const paymentHeader = paymentResponse.data.paymentHeader;

        // Store payment requirements in request config for later extraction
        (originalRequest as any)._x402PaymentRequirements = paymentRequirements;
        (originalRequest as any)._x402PaymentHeader = paymentHeader;

        // Add payment header to request headers
        if (!originalRequest.headers) {
          originalRequest.headers = {} as any;
        }
        (originalRequest.headers as any)['X-402-Payment'] = paymentHeader;
        // Always send payment details header so middleware can extract the correct network and other details
        (originalRequest.headers as any)['X-402-Payment-Details'] = JSON.stringify(
          paymentRequirements
        );

        // Retry the original request with payment header
        const retryResponse = await instance.request(originalRequest);

        return retryResponse;
      } catch (paymentError: any) {
        // Better error handling
        const errorMessage = paymentError?.response?.data?.error 
          || paymentError?.response?.data?.details
          || paymentError?.message
          || 'Unknown error';
        
        return Promise.reject(
          new Error(
            `Failed to handle x402 payment: ${errorMessage}`
          )
        );
      }
    }
  );

  return instance;
}

export default function DemoPage() {
  const [demoState, setDemoState] = useState<DemoState>({ status: 'idle' });

  const runDemo = async () => {
    setDemoState({ status: 'loading', step: 'Initializing x402 client...' });

    try {
      const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Create axios instance with x402 support using the SDK pattern
      setDemoState({ status: 'loading', step: 'Step 1: Creating x402-enabled axios client...' });
      const axiosClient = createX402Axios(baseURL);

      // Step 1: Make request - the interceptor will handle 402 automatically
      setDemoState({ status: 'loading', step: 'Step 2: Making request to protected resource...' });

      const response = await axiosClient.get('/api/protected/weather', {
        params: { units: 'celsius' },
      });

      // Step 2: Extract response data
      setDemoState({ status: 'loading', step: 'Step 3: Payment processed successfully!' });

      const data = response.data;

      // Extract headers
      const responseHeaders: Record<string, string> = {};
      Object.keys(response.headers).forEach((key) => {
        const value = response.headers[key];
        if (
          key.toLowerCase().startsWith('x-') ||
          ['cache-control', 'content-type', 'date', 'server'].includes(key.toLowerCase())
        ) {
          responseHeaders[key] = String(value);
        }
      });

      // Extract payment amount from response headers (case-insensitive)
      const paymentAmount = response.headers['x-payment-amount'] || 
                           response.headers['X-Payment-Amount'] || 
                           '0';

      // Extract transaction hash (case-insensitive)
      const transactionHash = response.headers['x-settlement-tx'] || 
                              response.headers['X-Settlement-Tx'];

      // Extract payment response header if available
      let paymentResponseData;
      const paymentResponseHeader = response.headers['x-payment-response'] || 
                                   response.headers['X-Payment-Response'];
      if (paymentResponseHeader) {
        try {
          paymentResponseData = JSON.parse(paymentResponseHeader as string);
        } catch (e) {
          // Ignore parse errors
        }
      }

      // Try to get payment details from the request if available
      const requestConfig = response.config as InternalAxiosRequestConfig & {
        _x402PaymentHeader?: string;
        _x402PaymentRequirements?: PaymentRequirements;
      };
      const paymentHeader = requestConfig._x402PaymentHeader;
      const paymentRequirements = requestConfig._x402PaymentRequirements;

      // Extract payment details from payment requirements or use defaults
      const paymentDetails = {
        amount: paymentAmount || paymentRequirements?.maxAmountRequired || '0',
        network: paymentRequirements?.network || 'polkadot-hub-testnet',
        token: paymentRequirements?.asset === 'native' || !paymentRequirements?.asset 
          ? 'native' 
          : paymentRequirements?.asset || 'native',
        payTo: paymentRequirements?.payTo,
      };

      setDemoState({
        status: 'success',
        weatherData: data.data || data, // Handle both nested and flat data
        transactionHash: transactionHash || paymentResponseData?.transactionHash,
        responseHeaders,
        requestHeaders: paymentHeader
          ? {
              'X-402-Payment': paymentHeader.substring(0, 100) + '...', // Truncate for display
            }
          : {},
        paymentDetails,
      });
    } catch (error) {
      setDemoState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  const resetDemo = () => {
    setDemoState({ status: 'idle' });
  };

  return (
    <main className="min-h-screen bg-[color:var(--tone-light)] pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[color:var(--tone-dark)] mb-2">
            x402 Payment Protocol Demo
          </h1>
          <p className="text-base text-[color:var(--tone-dark)]/70">
            HTTP 402 on Polkadot Hub TestNet
          </p>
        </div>

        {/* Start Demo Section */}
        {demoState.status === 'idle' && (
          <div className="max-w-lg mx-auto mb-8">
            <div className="bg-white border border-[color:var(--tone-border)] rounded-lg p-6">
              <p className="text-sm text-[color:var(--tone-dark)]/70 mb-4">
                This demo uses the polkadot-x402 SDK with automatic 402 payment handling.
                Payment authorization is created server-side to keep private keys secure.
              </p>
            <button
              onClick={runDemo}
                className="btn btn-primary w-full"
            >
                Request Weather Data →
            </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {demoState.status === 'loading' && (
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--tone-dark)]"></div>
            <p className="mt-4 text-[color:var(--tone-dark)]/70">{demoState.step || 'Processing payment...'}</p>
          </div>
        )}

        {/* Results Grid */}
        {(demoState.status === 'success' || demoState.status === 'error') && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - API Response */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[color:var(--tone-dark)] mb-6">
                API Response
              </h2>

              {/* Status */}
              <div className="bg-[color:var(--tone-light)]/50 border border-[color:var(--tone-border)] rounded-xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--tone-dark)]/60 mb-2">Status</p>
                <p className="text-xl font-bold text-[color:var(--tone-dark)]">
                  {demoState.status === 'success' ? '200 OK' : 'Error'}
                </p>
              </div>

              {/* API Response Data */}
              {demoState.status === 'success' && demoState.weatherData && (
                <div className="bg-[color:var(--tone-light)]/50 border border-[color:var(--tone-border)] rounded-xl p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--tone-dark)]/60 mb-4">API Response Data</p>
                  <CodeBlock
                    code={JSON.stringify(demoState.weatherData, null, 2)}
                    language="json"
                  />
                </div>
              )}

              {/* Response Headers */}
              {demoState.status === 'success' && demoState.responseHeaders && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--tone-dark)]/60 mb-3">Response Headers</p>
                  <CodeBlock
                    code={JSON.stringify(demoState.responseHeaders, null, 2)}
                    language="json"
                  />
                </div>
              )}
            </div>

            {/* Right Column - Payment Status */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[color:var(--tone-dark)] mb-6">
                Payment Status
              </h2>

              {/* Success Message */}
              {demoState.status === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-green-900 font-semibold mb-1">Payment verified and settled.</p>
                      <p className="text-green-700 text-sm">The protected resource has been delivered.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {demoState.status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-red-900 font-semibold mb-1">Payment failed</p>
                      <p className="text-red-700 text-sm">{demoState.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Hash */}
              {demoState.status === 'success' && demoState.transactionHash && (
                <div className="bg-[color:var(--tone-light)]/50 border border-[color:var(--tone-border)] rounded-xl p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--tone-dark)]/60 mb-3">Transaction Hash</p>
                  <p className="text-sm font-mono text-[color:var(--tone-dark)] break-all mb-3">
                    {demoState.transactionHash}
                  </p>
                  <a
                    href={`https://blockscout-passet-hub.parity-testnet.parity.io/tx/${demoState.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[color:var(--tone-dark)]/70 hover:text-[color:var(--tone-dark)] underline"
                  >
                    View on Explorer →
                  </a>
                </div>
              )}

              {/* Request Headers */}
              {demoState.status === 'success' && demoState.requestHeaders && Object.keys(demoState.requestHeaders).length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--tone-dark)]/60 mb-3">Payment Authorization</p>
                  <CodeBlock
                    code={JSON.stringify(demoState.requestHeaders, null, 2)}
                    language="json"
                  />
                </div>
              )}

              {/* How it works */}
              {demoState.status === 'success' && (
                <div className="bg-[color:var(--tone-light)]/50 border border-[color:var(--tone-border)] rounded-xl p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--tone-dark)]/60 mb-4">x402 Payment Flow (SDK)</p>
                  <ol className="space-y-3 text-sm text-[color:var(--tone-dark)]/80">
                    <li className="flex gap-3">
                      <span className="font-semibold text-[color:var(--tone-dark)]">1.</span>
                      <span>Create x402-enabled axios client using SDK pattern</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-[color:var(--tone-dark)]">2.</span>
                      <span>Make request - axios interceptor detects 402 response</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-[color:var(--tone-dark)]">3.</span>
                      <span>SDK calls server endpoint to create payment authorization (private key stays secure)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-[color:var(--tone-dark)]">4.</span>
                      <span>Interceptor automatically retries request with X-402-Payment header</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-[color:var(--tone-dark)]">5.</span>
                      <span>Server verifies payment and settles on-chain</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-[color:var(--tone-dark)]">6.</span>
                      <span>Protected resource returned with settlement transaction hash</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Start Over Button */}
              <button
                onClick={resetDemo}
                className="w-full btn btn-primary"
              >
                Start Over →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
