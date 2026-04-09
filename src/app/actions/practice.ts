"use server";

import { hindsight } from "@/lib/hindsight";
import { executeCode } from "@/lib/judge0";
import { generateProblem, getCodeFeedback, getAssistance, analyzeFreeCode } from "@/app/actions/ai";

/**
 * High-quality fallback problems for when AI paths are interrupted (e.g. missing API keys).
 */
const STATIC_CHALLENGES: Record<string, any[]> = {
  "Python": [
    {
      id: "calibration-py-001",
      title: "Binary Logic Gate",
      description: "Implement a function `is_even(n)` that returns True if a number is even, and False otherwise.\n\nConstraints:\n- n is an integer between -10^9 and 10^9.",
      difficulty: "Easy",
      topic: "Basics",
      testCases: [{ input: "4", expectedOutput: "True", explanation: "4 is divisible by 2." }],
      starterCode: { "Python": "def is_even(n):\n    # Write logic here\n    pass" }
    }
  ],
  "JavaScript": [
    {
      id: "calibration-js-001",
      title: "Array Reversal Vector",
      description: "Write a function `reverseArray(arr)` that takes an array and returns it in reverse order without using the built-in .reverse() method.",
      difficulty: "Easy",
      topic: "Arrays",
      testCases: [{ input: "[1, 2, 3]", expectedOutput: "[3, 2, 1]", explanation: "Elements moved to opposite indices." }],
      starterCode: { "JavaScript": "function reverseArray(arr) {\n  // Write logic here\n}" }
    }
  ]
};

const DEFAULT_FALLBACK = {
  id: "fail-safe-001",
  title: "Logic Calibration",
  description: "Provide a function that returns the sum of two integers `a` and `b`.",
  difficulty: "Easy",
  topic: "Basics",
  testCases: [{ input: "5, 10", expectedOutput: "15", explanation: "5 + 10 = 15" }],
  starterCode: { "Python": "def add(a, b):\n    return a + b", "JavaScript": "function add(a, b) {\n  return a + b;\n}" }
};

export async function getPersonalizedProblem(difficulty: 'Easy' | 'Medium' | 'Hard', language: any) {
  try {
    console.log(`[Practice Action] Protocol: Difficulty=${difficulty}, Language=${language}`);

    let weaknessSummary = "Focus on fundamentals.";
    let recentTitles: string[] = [];

    try {
      const memories = await hindsight.getHistory();
      if (memories && Array.isArray(memories)) {
        const historyArray = memories.slice(0, 20);
        weaknessSummary = historyArray.map((m: any) => m.content).join("\n");
        recentTitles = historyArray
          .filter((m: any) => m.metadata?.type === 'success' || m.metadata?.type === 'failure')
          .map((m: any) => m.metadata?.title)
          .filter(Boolean)
          .slice(0, 5);
      }
    } catch (e) {
      console.warn("[Practice Action] Hindsight recall bypassed.");
    }

    const problem = await generateProblem({
      difficulty,
      language,
      weaknesses: weaknessSummary,
      excludeTitles: recentTitles
    });

    // Detect if AI generation failed (Error object or malformed result)
    if (!problem || !problem.title || problem.error) {
      const isAuthError = problem?.description?.includes("AUTHENTICATION_ERROR");
      console.warn(`[Practice Action] AI Path Interrupted. ${isAuthError ? 'Auth failure detected.' : 'Saturation detected.'}`);
      
      // Select appropriate static challenge
      const langFallbacks = STATIC_CHALLENGES[language] || [];
      const fallback = langFallbacks[0] || DEFAULT_FALLBACK;
      
      // Ensure the fallback has the correct structure for the UI
      return {
        ...fallback,
        isDemoMode: true,
        error: problem?.error ? problem : null // Keep the error context if present
      };
    }

    // Archival
    await hindsight.retain('AI recommended a problem based on user weak areas', {
      type: 'experience',
      difficulty,
      language,
      timestamp: new Date().toISOString()
    }).catch(() => {});

    return JSON.parse(JSON.stringify(problem));
  } catch (e) {
    console.error("[Practice Action] Fatal exception:", e);
    return { ...DEFAULT_FALLBACK, isDemoMode: true };
  }
}

export async function submitSolution(params: {
  code: string;
  language: string;
  problem: any;
  timeTaken: number;
}) {
  const { code, language, problem, timeTaken } = params;

  let testResults = [];
  try {
    const mainTestCase = problem.testCases?.[0];
    if (mainTestCase) {
      const execution = await executeCode(code, language, mainTestCase.input || '');
      
      const passed = (execution.stdout || '').trim() === (mainTestCase.expectedOutput || '').trim();
      testResults.push({
        passed,
        input: mainTestCase.input,
        expectedOutput: mainTestCase.expectedOutput,
        actualOutput: execution.stdout,
        error: execution.stderr || execution.compile_output
      });
    }
  } catch (e) {
    console.warn("Simulation Error:", e);
  }

  try {
    const feedback = await getCodeFeedback({
      code,
      language,
      problem,
      testResults
    });

    const timestamp = new Date().toISOString();
    const status = feedback.passed ? 'success' : 'failure';
    const errorDesc = feedback.passed ? 'None' : (feedback.rootCauseAnalysis || 'Logic error');
    const memoryContent = `User practiced ${problem.topic} in ${language}. Result: ${status}. Error: ${errorDesc}`;

    await hindsight.retain(
      memoryContent,
      { topic: problem.topic, language, difficulty: problem.difficulty, type: status, timestamp, title: problem.title }
    ).catch(() => {});

    await hindsight.createMentalModel('Learning Progress', 'What are latest learning patterns of this user?').catch(() => {});

    return JSON.parse(JSON.stringify({ ...feedback, timestamp }));
  } catch (e) {
    console.error("[Practice Action] submitSolution feedback error:", e);
    return {
      passed: false,
      feedback: "Neural assessment failed. Please try again.",
      mistakes: ["Logic analysis service unavailable"],
      rootCauseAnalysis: "System Error",
      correctCode: "",
      lineByLineAnalysis: [],
      timestamp: new Date().toISOString()
    };
  }
}

export async function getHint(params: {
  code: string;
  language: string;
  problemDescription: string;
  hintLevel: number;
}) {
  try {
    const result = await getAssistance(params);
    await hindsight.retain(
      `User requested a hint for problem: ${params.problemDescription.substring(0, 50)}...`,
      { type: 'hint_request', hintLevel: params.hintLevel, timestamp: new Date().toISOString() }
    ).catch(() => {});
    return result;
  } catch (e) {
    return { 
      guidance: "Try simplifying the problem logic.", 
      recommendation: "Check the base cases again." 
    };
  }
}

export async function submitFreePractice(params: {
  code: string;
  language: string;
  description: string;
}) {
  try {
    const analysis = await analyzeFreeCode(params);
    const timestamp = new Date().toISOString();

    const topic = params.description || "General";
    const errorDesc = analysis.errors?.length > 0 ? analysis.errors[0].message : "None";
    const memoryContent = `User practiced ${topic} in ${params.language}. Result: free_practice. Error: ${errorDesc}`;

    await hindsight.retain(
      memoryContent,
      { 
        type: 'free_practice', 
        topic: topic, 
        language: params.language, 
        timestamp,
        analysis: JSON.stringify(analysis)
      }
    ).catch(() => {});

    await hindsight.createMentalModel('Learning Progress', 'What are latest learning patterns of this user?').catch(() => {});

    return JSON.parse(JSON.stringify({ ...analysis, timestamp }));
  } catch (e) {
    console.error("[Practice Action] submitFreePractice error:", e);
    return {
      errors: [],
      improvedCode: params.code,
      complexity: { time: "O(?)", space: "O(?)" },
      bestPractices: [],
      summary: "AI analysis is currently offline. Review your code patterns manually.",
      timestamp: new Date().toISOString()
    };
  }
}
