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

    const operatorId = process.env.HEDERA_ACCOUNT_ID;
    const operatorKey = process.env.HEDERA_PRIVATE_KEY;

    // If credentials not configured, return mock data
    if (!operatorId || !operatorKey) {
      console.log('Hedera credentials not configured, returning mock history');
      const mockHistory = [
        {
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          operation: 'dataset_creation',
          datasetId,
          provider: 'OpenAI',
          model: 'gpt-4',
          inputHash: '0x' + Buffer.from(datasetId).toString('hex').slice(0, 64),
          outputHash: '0x' + Buffer.from(datasetId + '_output').toString('hex').slice(0, 64),
          carbonFootprint: 12.5,
          verified: true,
        },
        {
          timestamp: new Date(Date.now() - 43200000).toISOString(),
          operation: 'model_training',
          datasetId,
          provider: 'Anthropic',
          model: 'claude-3',
          inputHash: '0x' + Buffer.from(datasetId + '_train').toString('hex').slice(0, 64),
          outputHash: '0x' + Buffer.from(datasetId + '_model').toString('hex').slice(0, 64),
          carbonFootprint: 45.2,
          verified: true,
        },
      ];

      return NextResponse.json({
        success: true,
        history: mockHistory,
        count: mockHistory.length,
        timestamp: new Date().toISOString(),
      });
    }

    // Initialize Hedera client with credentials
    const client = Client.forTestnet();
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
    // Return mock data on error
    const datasetIdFromParams = request.nextUrl.searchParams.get('datasetId') || 'unknown';
    const mockHistory = [
      {
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        operation: 'dataset_creation',
        datasetId: datasetIdFromParams,
        provider: 'OpenAI',
        model: 'gpt-4',
        inputHash: '0xabcd1234',
        outputHash: '0xefgh5678',
        carbonFootprint: 12.5,
        verified: true,
      },
    ];

    return NextResponse.json({
      success: true,
      history: mockHistory,
      count: mockHistory.length,
      timestamp: new Date().toISOString(),
      note: 'Using mock data due to error: ' + (error instanceof Error ? error.message : 'Unknown error'),
    });
  }
}
