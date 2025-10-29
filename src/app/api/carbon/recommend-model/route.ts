import { NextRequest, NextResponse } from 'next/server';
import { carbonAwareAgent } from '@/services/carbon-aware-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskType, estimatedTokens, maxCarbonBudget } = body;

    if (!taskType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: taskType (simple, moderate, or complex)',
        },
        { status: 400 }
      );
    }

    const recommendation = await carbonAwareAgent.chooseCarbonEfficientModel(
      taskType,
      estimatedTokens || 1000,
      maxCarbonBudget
    );

    return NextResponse.json({
      success: true,
      recommendation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recommending carbon-efficient model:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to recommend model',
      },
      { status: 500 }
    );
  }
}
