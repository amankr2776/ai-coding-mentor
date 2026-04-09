import { NextResponse } from 'next/server';
import { hindsight } from '@/lib/hindsight';

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { content, metadata = {} } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    const data = await hindsight.retain(content, metadata);
    
    // Ensure serializability
    const safeData = data ? JSON.parse(JSON.stringify(data)) : null;

    return NextResponse.json({ success: true, data: safeData });
  } catch (error: any) {
    console.error('[Hindsight API Route] Retain error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}