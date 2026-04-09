/**
 * Hyper-robust helper to extract JSON from AI responses.
 * Handles markdown backticks, prefix text, suffixes, and malformed characters.
 */
export function cleanJsonResponse(raw: string): string {
  if (!raw) return "{}";
  let cleaned = raw.trim();
  
  // 1. Try to find content within JSON code blocks
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    cleaned = jsonMatch[1].trim();
  }
  
  // 2. If parsing still likely to fail, find the first '{' or '[' and matching last brace
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  } else {
    // Try arrays
    const aStart = cleaned.indexOf('[');
    const aEnd = cleaned.lastIndexOf(']');
    if (aStart !== -1 && aEnd !== -1 && aEnd > aStart) {
      cleaned = cleaned.substring(aStart, aEnd + 1);
    }
  }
  
  // Remove non-printable characters and control characters except common whitespace
  return cleaned.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "").trim();
}

/**
 * Safe JSON parse with normalization for React rendering.
 * Recursively stringifies objects in known text fields to prevent React child errors.
 */
export function safeParse(raw: string, fallback: any = {}) {
  try {
    if (!raw || typeof raw !== 'string') return fallback;
    
    const cleaned = cleanJsonResponse(raw);
    if (!cleaned || cleaned === "{}") {
      // If it looks like raw text, try to wrap it if fallback allows
      if (raw.length > 0 && fallback.feedback) {
        return { ...fallback, feedback: raw };
      }
      return fallback;
    }
    
    const parsed = JSON.parse(cleaned);
    
    if (parsed && typeof parsed === 'object') {
      // Normalize known text fields to strings to prevent React object child errors
      const textFields = ['explanation', 'feedback', 'summary', 'rootCauseAnalysis', 'correctCode', 'description', 'guidance', 'recommendation', 'q', 'story', 'guidance'];
      
      for (const key in parsed) {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) {
          const isTextField = textFields.includes(key);
          const isObjectVal = parsed[key] !== null && typeof parsed[key] === 'object';
          
          if (isObjectVal && (isTextField || key.length > 15)) {
            parsed[key] = JSON.stringify(parsed[key], null, 2);
          }
        }
      }
    }
    
    return parsed;
  } catch (e) {
    console.error("[AI Utility] JSON Parse failure:", e);
    // Final fail-safe: if we have raw text, try to put it in a primary field
    if (typeof raw === 'string' && raw.length > 0) {
      const keys = Object.keys(fallback);
      if (keys.includes('feedback')) return { ...fallback, feedback: raw };
      if (keys.includes('explanation')) return { ...fallback, explanation: raw };
      if (keys.includes('summary')) return { ...fallback, summary: "Note: AI returned unstructured text." };
    }
    return fallback;
  }
}
