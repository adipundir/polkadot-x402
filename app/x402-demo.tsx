'use client';

import { useState, useEffect } from 'react';
import { createX402Client } from '@/lib/x402-polkadot';
import { connectWallet, formatAddress } from '@/lib/wallet';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { AxiosError } from 'axios';
import { X402PaymentError } from '@/types/x402';

// Paseo testnet RPC endpoint
// Alternative endpoints if this doesn't work:
// - wss://paseo-rpc.dwellir.com
// - wss://rpc.ibp.network/paseo
const PASEO_RPC = 'wss://paseo-rpc.dwellir.com';
// Alternative: Asset Hub testnet
// const ASSET_HUB_RPC = 'wss://assethub-polkadot-rpc.dwellir.com';

export default function X402Demo() {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window !== 'undefined') {
      // Try to connect on mount
      handleConnect();
    }
  }, []);

  const handleConnect = async () => {
    try {
      setStatus('Connecting to wallet...');
      const accs = await connectWallet('x402-polkadot-demo');
      setAccounts(accs);
      if (accs.length > 0) {
        setSelectedAccount(accs[0].address);
        setIsConnected(true);
        setStatus(`Connected: ${formatAddress(accs[0].address)}`);
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleTestPayment = async () => {
    if (!selectedAccount) {
      setStatus('Please connect wallet first');
      return;
    }

    setLoading(true);
    setStatus('Testing payment flow...');

    try {
      // Create x402 client with Paseo testnet configuration
      const client = createX402Client({
        polkadotConfig: {
          rpcEndpoint: PASEO_RPC,
          currency: 'DOT',
          decimals: 10,
        },
        getAccountAddress: async () => selectedAccount,
        autoRetry: true,
        maxRetries: 3,
      });

      // Make a request that will return 402
      const response = await client.get('/api/payment-required', {
        params: {
          amount: '0.001', // 0.001 DOT
        },
      });

      setStatus(`Success! Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      if (error instanceof X402PaymentError) {
        if (error.code === 'PAYMENT_PROCESSED') {
          setStatus(`Payment processed! ${error.message}`);
        } else {
          setStatus(`Payment error: ${error.message}`);
        }
      } else {
        const axiosError = error as AxiosError;
        setStatus(`Error: ${axiosError.message || String(error)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
        x402 Polkadot Demo
      </h1>

      <div className="flex flex-col gap-4">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="flex h-12 w-full items-center justify-center rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Connected Account:</p>
              <p className="font-mono text-sm">{formatAddress(selectedAccount)}</p>
              {accounts.length > 1 && (
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="mt-2 w-full rounded border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {accounts.map((acc) => (
                    <option key={acc.address} value={acc.address}>
                      {acc.meta.name || formatAddress(acc.address)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={handleTestPayment}
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-full bg-green-600 px-5 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Test x402 Payment Flow'}
            </button>
          </>
        )}

        {status && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Status:</p>
            <p className="mt-1 text-sm">{status}</p>
          </div>
        )}

        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-2 text-lg font-semibold">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Install Polkadot.js extension from polkadot.js.org/extension</li>
            <li>Create or import an account</li>
            <li>Connect your wallet above</li>
            <li>Get testnet tokens from Paseo faucet (if needed)</li>
            <li>Click "Test x402 Payment Flow" to test the interceptor</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

