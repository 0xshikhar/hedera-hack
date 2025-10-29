import { NextRequest, NextResponse } from 'next/server';
import { aiMirrorAnalytics } from '@/services/ai-mirror-analytics';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const insights = await aiMirrorAnalytics.generateInsights(limit);

    return NextResponse.json({
      success: true,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate insights',
      },
      { status: 500 }
    );
  }
}
