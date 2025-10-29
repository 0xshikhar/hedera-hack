import { NextRequest, NextResponse } from 'next/server';
import { aiMirrorAnalytics } from '@/services/ai-mirror-analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, quality, size } = body;

    if (!category || quality === undefined || size === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: category, quality, size',
        },
        { status: 400 }
      );
    }

    const recommendation = await aiMirrorAnalytics.recommendPricing(
      category,
      quality,
      size
    );

    return NextResponse.json({
      success: true,
      recommendation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recommending pricing:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to recommend pricing',
      },
      { status: 500 }
    );
  }
}
