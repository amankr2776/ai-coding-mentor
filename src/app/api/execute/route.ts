import { NextResponse } from 'next/server';
import { executeCode } from '@/lib/judge0';

export async function POST(req: Request) {
  try {
    const { code, language, input } = await req.json();
    
    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required.' }, { status: 400 });
    }

    console.log(`[API Execute] Route handling ${language} via Judge0...`);
    const result = await executeCode(code, language, input || '');

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
