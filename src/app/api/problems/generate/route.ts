import { NextResponse } from 'next/server';
import { generateProblem } from "@/app/actions/ai";
import { hindsight } from "@/lib/hindsight";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { difficulty, language } = await req.json();
    
    console.log('[API Generate] Recalling user history for personalization...');
    const memories = await hindsight.recall("What topics and languages did this user struggle with most?", 10);
    const weaknessSummary = memories.length > 0 
      ? memories.map((m: any) => m.content).join("\n")
      : "The user is new. Focus on fundamentals.";

    const problem = await generateProblem({
      difficulty,
      language,
      weaknesses: weaknessSummary
    });

    // Retain experience memory after problem generation
    await hindsight.retain('AI recommended a problem based on user weak areas', {
      type: 'experience',
      difficulty,
      language,
      timestamp: new Date().toISOString()
    }).catch(e => console.warn('[API Generate] Hindsight recommendation retain skipped:', e.message));

    return NextResponse.json(problem, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[API Generate] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}