import { NextResponse } from 'next/server';
import { convertCode } from "@/app/actions/ai";

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'AI Configuration Error: Missing API Key' }, { status: 500 });
    }

    const { code, language } = await req.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Source required.' }, { status: 400 });
    }

    console.log('[API Convert] Calculating language vectors...');
    const result = await convertCode({ code, fromLanguage: language });

    if (!result || Object.keys(result).length === 0) {
      throw new Error("AI returned an empty translation mapping.");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Convert] Translation Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
