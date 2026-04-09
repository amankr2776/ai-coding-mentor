import { callGroq } from "./ai";

/**
 * Pure Groq-based Neural Simulation Gateway.
 * Mentally executes code and returns raw output, eliminating the need for external compilers.
 */
export const executeCode = async (code: string, language: string, stdin: string = '') => {
  try {
    const systemPrompt = "You are a highly precise code execution engine. You mentally simulate code execution and return ONLY the raw output (stdout). No explanation, no markdown.";
    const userPrompt = `Execute this ${language} code with the provided input. 
Input: ${stdin || 'None'}
Code:
${code}

Return ONLY the exact raw string output. If the code would crash, return 'ERROR: [reason]'.`;

    const output = await callGroq(userPrompt, systemPrompt, false);
    
    // Clean up any AI conversational noise if it slipped through
    let cleanedOutput = output.trim();
    if (cleanedOutput.startsWith('```')) {
      cleanedOutput = cleanedOutput.replace(/```[a-z]*\n?|```/g, '').trim();
    }

    const isError = cleanedOutput.startsWith('ERROR:');
    
    return {
      stdout: isError ? '' : cleanedOutput,
      stderr: isError ? cleanedOutput : '',
      output: cleanedOutput,
      compile_output: '',
      status: { id: isError ? 4 : 3, description: isError ? 'Runtime Error' : 'Success' }
    };
  } catch (e: any) {
    console.error("[Neural Simulator] Failure:", e.message);
    return { stdout: '', stderr: 'Neural simulation failed.', output: '', compile_output: '', status: { id: 4, description: 'Simulation Failed' } };
  }
};
