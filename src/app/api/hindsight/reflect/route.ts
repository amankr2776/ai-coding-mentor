import { NextResponse } from 'next/server';
import { hindsight } from '@/lib/hindsight';

export async function POST() {
  try {
    const data = await hindsight.reflect();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.warn('[API Reflect] Background reflection failed:', error.message);
    // Return 200 even on non-critical background failure to prevent UI errors
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
