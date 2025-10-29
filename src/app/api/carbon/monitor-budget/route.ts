import { NextRequest, NextResponse } from 'next/server';
import { carbonAwareAgent } from '@/services/carbon-aware-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentUsage, budget, alertThresholds } = body;

    if (currentUsage === undefined || budget === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: currentUsage, budget',
        },
        { status: 400 }
      );
    }

    const monitoring = await carbonAwareAgent.monitorCarbonBudget(
      currentUsage,
      budget,
      alertThresholds
    );

    // Get offset recommendations if needed
    let offsetRecommendation;
    if (monitoring.status === 'warning' || monitoring.status === 'critical') {
      offsetRecommendation = carbonAwareAgent.suggestCarbonOffsets(currentUsage);
    }

    return NextResponse.json({
      success: true,
      monitoring,
      offsetRecommendation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error monitoring carbon budget:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to monitor budget',
      },
      { status: 500 }
    );
  }
}
