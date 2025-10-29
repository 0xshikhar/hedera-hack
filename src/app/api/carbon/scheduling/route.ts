import { NextRequest, NextResponse } from 'next/server';
import { carbonAwareAgent } from '@/services/carbon-aware-agent';

export async function GET(request: NextRequest) {
  try {
    const scheduling = carbonAwareAgent.getCarbonAwareScheduling();

    return NextResponse.json({
      success: true,
      scheduling,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting carbon scheduling:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get scheduling',
      },
      { status: 500 }
    );
  }
}
