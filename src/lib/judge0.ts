import { callGroq } from "./ai";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.JUDGE0_API_KEY;

const languageIdMap: Record<string, number> = {
  "Python": 71,
  "JavaScript": 63,
  "TypeScript": 74,
  "Java": 62,
  "C++": 54,
  "C": 50,
  "C#": 51,
  "Go": 60,
  "Rust": 73,
  "PHP": 68,
  "Ruby": 72,
  "Swift": 83,
  "Kotlin": 78,
  "SQL": 82
};

/**
 * Executes code via Judge0 API (RapidAPI).
 * Provides real-time execution results for 14+ languages.
 */
export const executeCode = async (code: string, language: string, stdin: string = '') => {
  try {
    const languageId = languageIdMap[language] || 71;

    console.log(`[Judge0] Requesting execution for ${language} (ID: ${languageId})...`);

    const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY || "",
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: stdin
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Judge0 API Error: ${errText}`);
    }

    const data = await response.json();

    // Normalize output: Judge0 uses 'Accepted' (id: 3) for success
    return {
      stdout: data.stdout || "",
      stderr: data.stderr || "",
      compile_output: data.compile_output || "",
      output: (data.stdout || "") + (data.stderr || "") + (data.compile_output || ""),
      status: data.status || { id: 3, description: "Accepted" }
    };
  } catch (error: any) {
    console.error("[Judge0] Execution failed:", error.message);
    
    // Fallback to Neural Simulation if API fails (Optional, but here we return structured error)
    return { 
      stdout: '', 
      stderr: `Execution failed: ${error.message}`, 
      output: '', 
      compile_output: '', 
      status: { id: 4, description: 'Execution Failed' } 
    };
  }
};
