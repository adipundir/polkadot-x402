# x402 Polkadot

A minimal x402 payment interceptor implementation for Polkadot, adapted from x402-axios but using Polkadot's Substrate architecture instead of EVM.

## Features

- ✅ HTTP 402 Payment Required interceptor for Axios
- ✅ Polkadot wallet integration (Polkadot.js extension)
- ✅ Automatic payment processing on 402 responses
- ✅ Support for Paseo and Asset Hub testnets
- ✅ TypeScript support with full type safety
- ✅ Working demo page with test endpoint

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Polkadot.js browser extension installed ([Download here](https://polkadot.js.org/extension/))
- A Polkadot account with testnet tokens (for Paseo testnet)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

### Get Testnet Tokens

For Paseo testnet:
1. Visit [Polkadot.js Apps](https://polkadot.js.org/apps/)
2. Switch to Paseo testnet
3. Use the faucet to get test tokens

## Usage

### Basic Setup

```typescript
import { createX402Client } from '@/lib/x402-polkadot';
import { connectWallet, getSigner } from '@/lib/wallet';

// Connect wallet
const accounts = await connectWallet('my-app');
const address = accounts[0].address;

// Create x402 client
const client = createX402Client({
  polkadotConfig: {
    rpcEndpoint: 'wss://paseo-rpc.dwellir.com',
    currency: 'DOT',
    decimals: 10,
  },
  getAccountAddress: async () => address,
  autoRetry: true,
});

// Make requests - 402 responses will be handled automatically
const response = await client.get('/api/protected-resource');
```

### Custom Payment Handler

```typescript
const client = createX402Client({
  polkadotConfig: {
    rpcEndpoint: 'wss://paseo-rpc.dwellir.com',
  },
  onPaymentRequired: async (paymentInfo) => {
    // Custom payment logic
    const result = await processPayment(paymentInfo);
    return result.txHash;
  },
});
```

## Project Structure

```
lib/
  x402-polkadot.ts       # Main interceptor
  polkadot-payment.ts    # Payment handler
  wallet.ts              # Wallet integration
types/
  x402.ts                # TypeScript types
app/
  api/
    payment-required/    # Test endpoint that returns 402
  page.tsx               # Demo page
```

## Testnet Configuration

### Paseo Testnet
- RPC: `wss://paseo-rpc.dwellir.com`
- Currency: DOT
- Decimals: 10

### Asset Hub Testnet
- RPC: `wss://assethub-polkadot-rpc.dwellir.com`
- Currency: DOT
- Decimals: 10

## How It Works

1. **Request Made**: Client makes HTTP request via Axios
2. **402 Response**: Server returns HTTP 402 Payment Required with payment headers
3. **Header Parsing**: Interceptor parses payment amount, recipient, and metadata
4. **Payment Processing**: Wallet signs and submits Polkadot transaction
5. **Auto Retry**: Original request is automatically retried after payment

## Payment Headers

The interceptor recognizes these HTTP headers in 402 responses:

- `X-Payment-Amount`: Payment amount (decimal or smallest unit)
- `X-Payment-Address`: Recipient address (SS58 format)
- `X-Payment-Currency`: Currency symbol (default: DOT)
- `X-Payment-Request-Id`: Optional request ID for tracking
- `X-Payment-Meta-*`: Custom metadata headers

## License

MIT
