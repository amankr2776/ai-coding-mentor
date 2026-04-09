/**
 * @fileOverview Piston API integration for real code execution.
 */

const PISTON_URL = "https://emkc.org/api/v2/piston";

// Language mapping for Piston aliases
const languageMap: Record<string, string> = {
  "Python": "python",
  "JavaScript": "javascript",
  "TypeScript": "typescript",
  "Java": "java",
  "C++": "cpp",
  "C": "c",
  "C#": "csharp",
  "Go": "go",
  "Rust": "rust",
  "PHP": "php",
  "Ruby": "ruby",
  "Swift": "swift",
  "Kotlin": "kotlin",
  "SQL": "sqlite3"
};

let runtimesCache: any[] = [];

/**
 * Fetch available runtimes from Piston to get correct versions.
 */
async function getRuntimes() {
  if (runtimesCache.length > 0) return runtimesCache;
  try {
    const res = await fetch(`${PISTON_URL}/runtimes`);
    const data = await res.json();
    runtimesCache = data;
    return data;
  } catch (e) {
    console.error("[Piston] Failed to fetch runtimes:", e);
    return [];
  }
}

/**
 * Execute code via Piston API v2.
 */
export async function executePiston(languageName: string, code: string, stdin: string = "") {
  try {
    const runtimes = await getRuntimes();
    const langAlias = languageMap[languageName] || languageName.toLowerCase();
    
    const runtime = runtimes.find((r: any) => 
      r.language === langAlias || r.aliases.includes(langAlias)
    );

    if (!runtime) {
      throw new Error(`Language '${languageName}' not supported by Piston.`);
    }

    const payload = {
      language: runtime.language,
      version: runtime.version,
      files: [
        {
          content: code
        }
      ],
      stdin: stdin,
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1
    };

    console.log(`[Piston] Executing ${runtime.language} (${runtime.version})...`);
    
    const res = await fetch(`${PISTON_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Piston API Error: ${err}`);
    }

    const data = await res.json();
    
    // Normalize response to match our internal expectation
    return {
      stdout: data.run.stdout || "",
      stderr: data.run.stderr || data.compile?.stderr || "",
      output: (data.run.stdout || "") + (data.run.stderr || "") + (data.compile?.stderr || ""),
      status: { 
        id: data.run.code === 0 ? 3 : 4, 
        description: data.run.code === 0 ? "Success" : "Runtime Error" 
      }
    };
  } catch (error: any) {
    console.error("[Piston] Execution failed:", error.message);
    return {
      stdout: "",
      stderr: error.message,
      output: `ERROR: ${error.message}`,
      status: { id: 4, description: "Execution Failed" }
    };
  }
}
