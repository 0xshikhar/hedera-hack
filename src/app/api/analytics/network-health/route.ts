import { NextRequest, NextResponse } from 'next/server';
import { aiMirrorAnalytics } from '@/services/ai-mirror-analytics';

export async function GET(request: NextRequest) {
  try {
    const health = await aiMirrorAnalytics.analyzeNetworkHealth();

    return NextResponse.json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error analyzing network health:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze network health',
      },
      { status: 500 }
    );
  }
}
