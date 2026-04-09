"use server";

import { callGroq } from "@/lib/ai";
import { safeParse } from "@/lib/ai-utils";

/**
 * Generate a personalized coding problem.
 */
export async function generateProblem(params: any) {
  const systemPrompt = `You are a professional coding challenge architect. 
Generate a comprehensive ${params.difficulty} level coding problem for the ${params.language} language.
User history context: ${params.weaknesses || 'Focus on fundamentals.'}

Return ONLY a JSON object:
{
  "title": "string",
  "description": "Full problem statement with constraints and examples",
  "difficulty": "Easy/Medium/Hard",
  "topic": "Algorithmic topic",
  "testCases": [{"input": "string", "expectedOutput": "string", "explanation": "string"}],
  "timeLimit": "string",
  "starterCode": {"${params.language}": "string"}
}`;

  try {
    const response = await callGroq("Generate a new coding challenge.", systemPrompt, true);
    return safeParse(response, { title: "Challenge Initialization Failed" });
  } catch (e: any) {
    console.error("[AI Action] generateProblem fatal error:", e.message);
    return { 
      error: true,
      title: "Neural Path Interrupted", 
      description: `Analysis: ${e.message || "Unknown saturation point."}` 
    };
  }
}

/**
 * Assessment action for code evaluation.
 */
export async function getCodeFeedback(params: {
  code: string;
  language: string;
  problem: any;
  testResults: any[];
}) {
  const systemPrompt = `You are a strict code evaluator. Analyze the code for the problem: ${params.problem.title}.
Perform a rigorous verification for syntax, logic, and output correctness.
Output ONLY JSON:
{
  "passed": boolean,
  "feedback": "string summary explaining results",
  "correctCode": "full rectified working solution if passed is false",
  "mistakes": ["specific mistake strings"],
  "rootCauseAnalysis": "technical explanation of where the logic failed"
}`;

  const userPrompt = `Problem: ${params.problem.description}\nLanguage: ${params.language}\nCode:\n${params.code}\nTest Results: ${JSON.stringify(params.testResults)}`;

  try {
    const response = await callGroq(userPrompt, systemPrompt, true);
    return safeParse(response, { passed: false, feedback: "Neural evaluation timed out.", correctCode: "", mistakes: ["Timeout"] });
  } catch (e) {
    return { passed: false, feedback: "AI evaluation unavailable at this moment.", correctCode: "", mistakes: ["Service Error"] };
  }
}

/**
 * Explain code line by line.
 */
export async function explainCode(params: { code: string; language: string }) {
  const systemPrompt = `Explain this ${params.language} code line by line. 
Focus on the architectural purpose of each segment.
Output ONLY JSON: { "explanation": "detailed step by step breakdown", "summary": "high level logic goal" }`;

  try {
    const response = await callGroq(params.code, systemPrompt, true);
    return safeParse(response, { explanation: "Line-by-line analysis failed.", summary: "Scan Error" });
  } catch (e) {
    return { explanation: "Service interrupted.", summary: "Network Error" };
  }
}

/**
 * Convert code logic to other languages.
 */
export async function convertCode(params: { code: string; fromLanguage: string }) {
  const targets = ["Python", "JavaScript", "Go", "Rust", "C++"];
  const systemPrompt = `Convert this ${params.fromLanguage} code to these languages: ${targets.join(", ")}.
Maintain exact logic parity. Return ONLY a JSON object where keys are the language names.`;

  try {
    const response = await callGroq(params.code, systemPrompt, true);
    return safeParse(response, {});
  } catch (e) {
    return {};
  }
}

/**
 * Analyze free practice code for errors and patterns.
 */
export async function analyzeFreeCode(params: { code: string; language: string; description: string }) {
  const systemPrompt = `Analyze this ${params.language} code for errors, complexity, and best practices.
Context: ${params.description || "General practice"}
Output ONLY JSON: { "errors": [{"message": "string", "fix": "string"}], "complexity": {"time": "string", "space": "string"}, "summary": "detailed technical analysis" }`;
  
  try {
    const response = await callGroq(params.code, systemPrompt, true);
    return safeParse(response, { summary: "Analysis complete with default values.", errors: [] });
  } catch (e) {
    return { summary: "AI analysis service is currently busy.", errors: [] };
  }
}

/**
 * Provide contextual assistance/hints.
 */
export async function getAssistance(params: {
  code: string;
  language: string;
  problemDescription: string;
  hintLevel: number;
}) {
  const systemPrompt = `You are a helpful coding mentor. Provide a Level ${params.hintLevel} hint.
Level 1: General strategy (don't give code)
Level 2: Structural hint (conceptual structure)
Level 3: Edge case hint (specific check)
Output ONLY JSON: { "guidance": "string", "recommendation": "string" }`;

  const userPrompt = `Problem: ${params.problemDescription}\nLanguage: ${params.language}\nCode: ${params.code}`;

  try {
    const response = await callGroq(userPrompt, systemPrompt, true);
    return safeParse(response, { guidance: "Think about the problem constraints.", recommendation: "Check your logic flow." });
  } catch (e) {
    return { guidance: "AI busy.", recommendation: "Try again." };
  }
}

export async function getSmartTips(historyContext: string) {
  const systemPrompt = `Based on this user history, provide 3 punchy, technically specific tips. 
Output ONLY JSON: { "tips": ["string"] }`;
  try {
    const response = await callGroq(historyContext, systemPrompt, true);
    return safeParse(response, { tips: ["Analyze your logic errors carefully."] });
  } catch (e) {
    return { tips: ["Review your recent session history."] };
  }
}

export async function getJourneyStory(historyContext: string) {
  const systemPrompt = `Summarize journey in one quote.
Output ONLY JSON: { "story": "string" }`;
  try {
    const response = await callGroq(historyContext, systemPrompt, true);
    return safeParse(response, { story: "Your coding path is being paved with every line." });
  } catch (e) {
    return { story: "Keep building, keep learning." };
  }
}

export async function getProgressSummary(input: any) {
  const systemPrompt = `Identify strengths/weaknesses from history.
Output ONLY JSON: { "strengths": ["string"], "weaknesses": ["string"], "personalizedRecommendations": ["string"] }`;
  try {
    const response = await callGroq(JSON.stringify(input), systemPrompt, true);
    return safeParse(response, { strengths: ["Logic Implementation"], weaknesses: ["Complexity Analysis"], personalizedRecommendations: ["Focus on Medium difficulty"] });
  } catch (e) {
    return { strengths: ["Consistency"], weaknesses: ["Pattern Recognition"], personalizedRecommendations: ["Perform more sessions."] };
  }
}

export async function generateQuiz(params: any) {
  const systemPrompt = `Generate a ${params.type} quiz in ${params.language} with ${params.count || 5} questions.
Output ONLY JSON: { "questions": [{"q": "string", "code": "optional string", "options": ["string"], "answer": number, "explanation": "string", "topic": "string", "hint": "string"}] }`;
  try {
    const response = await callGroq("Generate quiz.", systemPrompt, true);
    return safeParse(response, { questions: [] });
  } catch (e) {
    return { questions: [] };
  }
}
