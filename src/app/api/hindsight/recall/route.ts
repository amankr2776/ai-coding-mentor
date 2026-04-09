import { NextResponse } from 'next/server';
import { hindsight } from '@/lib/hindsight';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    const { query, topK = 10 } = body;

    const memories = await hindsight.recall(query || 'all practice sessions', topK);
    
    // Ensure serializability
    const safeMemories = Array.isArray(memories) 
      ? JSON.parse(JSON.stringify(memories)) 
      : [];

    return NextResponse.json({ success: true, memories: safeMemories });
  } catch (error: any) {
    console.error('[Hindsight API Route] Recall error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}