import { NextResponse } from 'next/server';
import { executePiston } from '@/lib/piston';

export async function POST(req: Request) {
  try {
    const { code, language, input } = await req.json();
    
    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required.' }, { status: 400 });
    }

    console.log(`[API Execute] Route handling ${language} via Piston...`);
    const result = await executePiston(language, code, input || '');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Execute] Route Error:', error.message);
    return NextResponse.json({ 
      error: error.message,
      stdout: "",
      stderr: error.message,
      status: { id: 4, description: "Server Error" }
    }, { status: 500 });
  }
}
