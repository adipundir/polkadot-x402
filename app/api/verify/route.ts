/**
 * GET /api/verify - Returns information about the verify endpoint
 * POST /api/verify - Verifies an x402 payment payload
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
 *   "valid": true,
 *   "details": { ... }
 * }
 * or
 * {
 *   "valid": false,
 *   "error": "..."
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import type { VerifyRequest, VerificationResult, ErrorResponse } from '@/types/x402';
import { verifyX402Payment } from '@/lib/x402/verify';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      endpoint: '/api/verify',
      description: 'Verifies x402 payment payloads',
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
        valid: 'boolean',
        error: 'string (optional, if valid is false)',
        details: 'object (optional, if valid is true)',
      },
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
    const body: VerifyRequest = await request.json();

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

    // Verify the payment
    const result: VerificationResult = await verifyX402Payment(
      body.payload,
      body.details
    );

    // Return appropriate status code based on verification result
    if (result.valid) {
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
      return NextResponse.json(result, {
        status: 400,
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
      error: error instanceof Error ? error.message : 'Verification failed',
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

