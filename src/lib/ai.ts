import Groq from "groq-sdk";

// Defensive API Key Loading
const apiKey = process.env.GROQ_API_KEY;

const groq = new Groq({
  apiKey: apiKey || "MISSING_KEY",
});

/**
 * Robust Groq call with multi-model fallback and detailed error logging.
 */
export async function callGroq(
  prompt: string,
  systemPrompt: string = "You are CodeMentor AI, an expert coding mentor.",
  json: boolean = false
) {
  if (!apiKey || apiKey === "undefined" || apiKey === "MISSING_KEY" || apiKey.trim() === "") {
    throw new Error("AUTHENTICATION_ERROR: Your GROQ_API_KEY is not configured. Please add your key to .env.local.");
  }

  const models = [
    "llama-3.3-70b-versatile",
    "llama3-70b-8192",
    "mixtral-8x7b-32768"
  ];

  for (const model of models) {
    try {
      console.log(`[Groq] Requesting ${model}`);
      
      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        model: model,
        response_format: json ? { type: "json_object" } : undefined,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response");

      return content;
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      if (status === 401 || error.message?.includes("invalid_api_key")) {
        throw new Error("AUTHENTICATION_ERROR: Your GROQ_API_KEY is invalid. Verify it in .env.local.");
      }
      console.warn(`[Groq] ${model} failed, trying next...`);
    }
  }
  
  throw new Error("NEURAL_PATH_SATURATED: All models are currently occupied. Please retry in 30 seconds.");
}
