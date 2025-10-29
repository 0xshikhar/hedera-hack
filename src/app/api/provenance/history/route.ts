import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@hashgraph/sdk';
import { ProvenanceService } from '@/services/provenance';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const datasetId = searchParams.get('datasetId');

    if (!datasetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: datasetId',
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
    const history = await provenanceService.getProvenanceHistory(datasetId);

    return NextResponse.json({
      success: true,
      history,
      count: history.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching provenance history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history',
      },
      { status: 500 }
    );
  }
}
