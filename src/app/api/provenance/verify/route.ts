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

    // Initialize Hedera client
    const client = Client.forTestnet();
    
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hedera credentials not configured',
        },
        { status: 500 }
      );
    }

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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit verification',
      },
      { status: 500 }
    );
  }
}
