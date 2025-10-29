import { NextResponse } from 'next/server';
import { Client } from '@hashgraph/sdk';
import { ProvenanceService } from '@/services/provenance';

export async function GET() {
  try {
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
    const stats = await provenanceService.getProvenanceStats();

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching provenance stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
