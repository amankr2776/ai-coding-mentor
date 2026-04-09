import { NextResponse } from 'next/server';
import { getAssistance } from "@/app/actions/ai";
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
    const { code, language, problemDescription, hintLevel } = await req.json();
    
    console.log('[API Hint] Generating hint with level:', hintLevel);
    const result = await getAssistance({ code, language, problemDescription, hintLevel });

    // Non-blocking hindsight record
    try {
      hindsight.retain(`User requested hint (Level ${hintLevel}) for: ${problemDescription.substring(0, 50)}...`, {
        type: 'hint_request',
        language,
        timestamp: new Date().toISOString()
      }).catch(e => console.error('[API Hint] Hindsight error:', e.message));
    } catch (e) {}

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[API Hint] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
