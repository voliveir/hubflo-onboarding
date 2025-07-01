import { NextResponse } from 'next/server';
import { getAnalyticsOverview } from '@/lib/database';

export async function GET() {
  try {
    const analytics = await getAnalyticsOverview();
    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics summary.' }, { status: 500 });
  }
} 