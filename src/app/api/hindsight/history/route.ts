import { NextResponse } from 'next/server';
import { hindsight } from '@/lib/hindsight';

export const maxDuration = 30;

export async function GET() {
  try {
    const memories = await hindsight.getHistory();
    
    // Defensive serialization check to ensure plain object return
    const safeMemories = Array.isArray(memories) 
      ? JSON.parse(JSON.stringify(memories)) 
      : [];

    return NextResponse.json({ 
      success: true, 
      memories: safeMemories
    });
  } catch (error: any) {
    console.error('[API History] Fetch Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      memories: [] 
    }, { status: 500 });
  }
}