import { NextResponse } from 'next/server';
import { getCodeFeedback } from '@/app/actions/ai';
import { hindsight } from '@/lib/hindsight';
import { executePiston } from '@/lib/piston';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { code, language, problem } = await req.json();
    
    if (!code || !language || !problem) {
      return NextResponse.json({ 
        passed: false, 
        feedback: 'Evaluation parameters missing.' 
      }, { status: 400 });
    }

    console.log(`[API Submit] Protocol initiated for ${language} using Piston...`);
    
    // Step 1: Real Execution to get raw output
    const mainTestCase = problem.testCases?.[0] || { input: "", expectedOutput: "" };
    const execution = await executePiston(language, code, mainTestCase.input || '');
    
    const testResults = [{
      passed: (execution.stdout || '').trim() === (mainTestCase.expectedOutput || '').trim(),
      input: mainTestCase.input,
      expectedOutput: mainTestCase.expectedOutput,
      actualOutput: execution.stdout,
      error: execution.stderr
    }];

    // Step 2: Deep Logic Assessment via Action
    const result = await getCodeFeedback({
      code,
      language,
      problem,
      testResults
    });
    
    // Step 3: Asynchronous Hindsight Archival (Non-blocking)
    try {
      const status = result.passed ? 'success' : 'failure';
      const rootCause = result.passed ? 'None' : (result.rootCauseAnalysis || 'Logic verification failed');
      
      hindsight.retain(
        `User practiced ${problem.topic} in ${language}. Result: ${status}. Logic Analysis: ${rootCause}`,
        { 
          topic: problem.topic, 
          language, 
          type: status, 
          title: problem.title,
          timestamp: new Date().toISOString()
        }
      ).catch(e => console.warn("[API Submit] Archival skipped:", e.message));
    } catch(e) {}
    
    return NextResponse.json({ 
      ...result, 
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error("[API Submit] Fatal error:", error.message);
    return NextResponse.json({ 
      passed: false, 
      feedback: `The neural evaluation service encountered an interruption: ${error.message}`,
      correctCode: '',
      mistakes: ['System Interrupt']
    }, { status: 200 }); 
  }
}
