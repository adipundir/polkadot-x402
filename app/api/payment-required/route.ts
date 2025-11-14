/**
 * Test API Route that returns 402 Payment Required
 * 
 * This endpoint simulates a service that requires payment
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Get payment parameters from query or use defaults
  const amount = searchParams.get('amount') || '0.01'; // 0.01 DOT
  const address = searchParams.get('address') || process.env.DEFAULT_PAYMENT_ADDRESS || '';
  const currency = searchParams.get('currency') || 'DOT';
  const requestId = searchParams.get('requestId') || `req-${Date.now()}`;

  // Return 402 Payment Required with payment headers
  return new NextResponse(
    JSON.stringify({
      error: 'Payment Required',
      message: 'This resource requires payment to access',
      amount,
      currency,
      requestId,
    }),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Amount': amount,
        'X-Payment-Address': address,
        'X-Payment-Currency': currency,
        'X-Payment-Request-Id': requestId,
        'X-Payment-Meta-Service': 'x402-test',
        'X-Payment-Meta-Timestamp': new Date().toISOString(),
      },
    }
  );
}

export async function POST(request: Request) {
  // Same as GET but for POST requests
  return GET(request);
}

