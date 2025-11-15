/**
 * GET /api/settle - Returns information about the settle endpoint
 * POST /api/settle - Settles an x402 payment by signing and broadcasting the transaction
 * 
 * Request body:
 * {
 *   "payload": "0x...",
 *   "details": {
 *     "x402Version": 1,
 *     "scheme": "exact",
 *     "network": "base-sepolia",
 *     "extra": {}
 *   }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "transactionHash": "0x..."
 * }
 * or
 * {
 *   "success": false,
 *   "error": "..."
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import type { SettleRequest, SettlementResult, ErrorResponse } from '@/types/x402';
import { settleX402Payment } from '@/lib/x402/settle';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      endpoint: '/api/settle',
      description: 'Settles x402 payments by signing and broadcasting transactions',
      methods: ['GET', 'POST'],
      requestFormat: {
        payload: 'string (hex-encoded payment payload)',
        details: {
          x402Version: 'number (must be 1)',
          scheme: 'string (e.g., "exact")',
          network: 'string (e.g., "base-sepolia")',
          extra: 'object (optional, network-specific configuration)',
        },
      },
      responseFormat: {
        success: 'boolean',
        transactionHash: 'string (optional, if success is true)',
        error: 'string (optional, if success is false)',
      },
      warning: 'This endpoint requires a valid EVM_PRIVATE_KEY and sufficient funds for gas fees',
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SettleRequest = await request.json();

    // Validate request structure
    if (!body.payload || typeof body.payload !== 'string') {
      const errorResponse: ErrorResponse = {
        error: 'Missing or invalid payload field',
        code: 'INVALID_PAYLOAD',
      };
      return NextResponse.json(errorResponse, {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!body.details || typeof body.details !== 'object') {
      const errorResponse: ErrorResponse = {
        error: 'Missing or invalid details field',
        code: 'INVALID_DETAILS',
      };
      return NextResponse.json(errorResponse, {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Validate details structure
    if (!body.details.x402Version || body.details.x402Version !== 1) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid x402Version. Only version 1 is supported.',
        code: 'INVALID_VERSION',
      };
      return NextResponse.json(errorResponse, {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!body.details.scheme) {
      const errorResponse: ErrorResponse = {
        error: 'Missing scheme in details',
        code: 'MISSING_SCHEME',
      };
      return NextResponse.json(errorResponse, {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!body.details.network) {
      const errorResponse: ErrorResponse = {
        error: 'Missing network in details',
        code: 'MISSING_NETWORK',
      };
      return NextResponse.json(errorResponse, {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Settle the payment
    const result: SettlementResult = await settleX402Payment(
      body.payload,
      body.details
    );

    // Return appropriate status code based on settlement result
    if (result.success) {
      return NextResponse.json(result, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } else {
      // Determine if it's a client error (400) or server error (500)
      const isClientError = 
        result.error?.includes('Unsupported') ||
        result.error?.includes('Missing') ||
        result.error?.includes('Invalid') ||
        result.error?.includes('required');

      return NextResponse.json(result, {
        status: isClientError ? 400 : 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Settlement failed',
      code: 'INTERNAL_ERROR',
      details: {
        message: error instanceof Error ? error.stack : String(error),
      },
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

