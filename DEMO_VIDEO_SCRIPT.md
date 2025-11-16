Hi everyone, introducing Polkadot x402.

## Slide 1: What is x402?

x402 is a payment protocol that extends HTTP with the 402 Payment Required status code. It enables API providers to charge for access using blockchain micropayments. Instead of traditional subscription models, you can charge per request, making APIs more accessible and flexible.

## Slide 2: How x402 Works

x402 leverages the HTTP 402 status code that was originally reserved for future payment systems. When a client requests a protected resource, the server responds with a 402 Payment Required status, including payment requirements like the amount, network, and recipient address. The client then creates a payment authorization, signs it cryptographically, and includes it in the request header. The server verifies the payment and settles it on-chain before returning the protected resource.

## Protocol Flow Diagram

Let me walk you through the complete flow:

**Step 1**: The client sends a request to a protected API endpoint without making a payment.

**Step 2**: The server responds with a 402 Payment Required status code, including payment requirements such as the amount, network, recipient address, and token.

**Step 3**: The client signs a transaction using their private key and adds it to the X-402-Payment header before sending the request again.

**Step 4**: The facilitator verifies the payment signature and requirements, then settles the transaction on-chain by transferring tokens from the buyer to the seller.

**Step 5**: Once the payment is verified and settled, the API response is returned to the client with the transaction hash in the response headers.

That's the complete x402 payment flow - simple, secure, and decentralized.

## Let's Get to the Demo

Now let's see how easy it is to monetize your APIs with Polkadot x402.

### Middleware Setup

Setting up payment protection is incredibly simple. In your middleware configuration, you just need to specify:
- The recipient address (where payments should go)
- The amount to charge per request
- The protected route details

That's it. Your API is now monetized. No complex setup, no additional infrastructure - just configure these three things and you're ready to accept payments.

### Live Demo

Let's see it in action. This is a weather API protected by Polkadot x402.

**First Request**: As you can see, when we make a request without payment, we receive a 402 Payment Required status code with the payment requirements.

**Payment Authorization**: The client automatically creates a payment authorization, signs it, and includes it in the X-402-Payment header.

**Second Request**: Now when we retry the request with the payment header, the facilitator verifies the payment and settles it on-chain.

**Success**: We receive a successful 200 response with the weather data, and you can see the transaction hash in the response headers. The payment has been processed on Polkadot Hub TestNet.

This is the future of micropayments on Polkadot. Instant, low-cost, per-request payments that make APIs more accessible and profitable.

## SDK and Protocol Availability

The Polkadot x402 SDK is now live on npm, ready for you to integrate into your projects. The protocol is live on Polkadot Hub TestNet, so you can start building and testing right away. Check out the documentation to get started.

You can find the team on Twitter with these usernames: [Add Twitter usernames here]

Well, that was Polkadot x402. Thank you for your time.

---

## Key Points to Highlight:

1. **Polkadot Hub TestNet**: Running on Polkadot's EVM-compatible testnet
2. **PAS Token**: Native token for payments (or USDC if configured)
3. **Private Key Signing**: Uses private keys from environment variables (no wallet connect needed)
4. **Facilitator Service**: Handles payment verification and settlement
5. **Protected Weather API**: Example endpoint that requires payment
6. **Transaction Hash**: Visible in response headers after successful payment

## Visual Cues:

- Show the 402 Payment Required response
- Show the payment authorization being created
- Show the successful API response with transaction hash
- Show the transaction on Polkadot Hub TestNet explorer
- Show the demo page with payment flow visualization
