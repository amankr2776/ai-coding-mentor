import { NextResponse } from 'next/server';
import { explainCode } from "@/app/actions/ai";

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'AI Configuration Error: Missing API Key' }, { status: 500 });
    }

    const { code, language } = await req.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Source code required.' }, { status: 400 });
    }

    console.log('[API Explain] Generating logic breakdown...');
    const result = await explainCode({ code, language });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Explain] Error:', error.message);
    return NextResponse.json({ 
      error: error.message,
      explanation: `Architectural analysis interrupted: ${error.message}`, 
      summary: 'Scan Error' 
    }, { status: 500 });
  }
}
