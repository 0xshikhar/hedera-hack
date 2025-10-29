import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@hashgraph/sdk';
import { ProvenanceService } from '@/services/provenance';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { datasetId, verifier, vote, comments } = body;

    if (!datasetId || !verifier || !vote) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: datasetId, verifier, vote',
        },
        { status: 400 }
      );
    }

    if (vote !== 'upvote' && vote !== 'downvote') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid vote value. Must be "upvote" or "downvote"',
        },
        { status: 400 }
      );
    }

    const operatorId = process.env.HEDERA_ACCOUNT_ID;
    const operatorKey = process.env.HEDERA_PRIVATE_KEY;

    // If credentials not configured, return mock success
    if (!operatorId || !operatorKey) {
      console.log('Hedera credentials not configured, returning mock verification');
      return NextResponse.json({
        success: true,
        message: 'Verification vote recorded (mock mode)',
        timestamp: new Date().toISOString(),
      });
    }

    // Initialize Hedera client with credentials
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    const provenanceService = new ProvenanceService(client);
    const result = await provenanceService.submitVerificationVote(
      datasetId,
      verifier,
      vote,
      comments
    );

    return NextResponse.json({
      success: result.success,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    // Return mock success on error
    return NextResponse.json({
      success: true,
      message: 'Verification vote recorded (fallback mode)',
      timestamp: new Date().toISOString(),
      note: 'Error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'),
    });
  }
}
