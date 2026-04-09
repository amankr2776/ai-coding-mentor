'use server';
/**
 * @fileOverview Server actions for Hindsight interaction, proxying requests to the core library.
 */
import { hindsight } from '@/lib/hindsight';

/**
 * Recall memories based on semantic similarity.
 * Returns an array of memories.
 */
export async function recallHindsight(query: string, topK: number = 5) {
  try {
    const memories = await hindsight.recall(query, topK);
    // Ensure plain serializable array
    return JSON.parse(JSON.stringify(memories || []));
  } catch (error) {
    console.error('[Hindsight Action] Recall failed:', error);
    return [];
  }
}

/**
 * Retain a new memory document.
 */
export async function retainHindsight(content: string, metadata: any = {}) {
  try {
    const result = await hindsight.retain(content, metadata);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('[Hindsight Action] Retain failed:', error);
    return null;
  }
}

/**
 * List recent memory history.
 * Returns an array of memories.
 */
export async function getHindsightHistory() {
  try {
    const memories = await hindsight.getHistory();
    // Ensure return is always a valid JSON serializable array
    return JSON.parse(JSON.stringify(memories || []));
  } catch (error) {
    console.error('[Hindsight Action] History failed:', error);
    return [];
  }
}