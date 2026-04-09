/**
 * @fileOverview Server-side utility for interacting with the Hindsight API using the official SDK.
 */

import { HindsightClient } from '@vectorize-io/hindsight-client';

const API_KEY = process.env.HINDSIGHT_API_KEY || '';
const BANK_ID = 'abhimanu';

// Initialize the official Hindsight client defensively
let client: any = null;
try {
  if (API_KEY) {
    client = new HindsightClient({
      apiKey: API_KEY,
      baseUrl: 'https://api.hindsight.vectorize.io',
    });
  }
} catch (e) {
  console.error('[Hindsight SDK] Initialization failed:', e);
}

export interface HindsightMemory {
  id: string;
  content: string;
  metadata: any;
  timestamp: string;
}

/**
 * Centralized hindsight utility object using the SDK.
 */
export const hindsight = {
  /**
   * Retain a new memory document.
   * Automatically triggers reflection in the background.
   */
  retain: async (content: string, metadata: any = {}) => {
    if (!API_KEY || !client) {
      console.warn('[Hindsight SDK] Missing configuration. Retention skipped.');
      return null;
    }

    try {
      console.log('[Hindsight SDK] Retaining memory directly via client...');
      const result = await client.retain(BANK_ID, content, {
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      });

      // --- Background Automation Logic (Non-Blocking) ---
      const practiceTypes = ['success', 'failure', 'free_practice', 'quiz_result'];
      if (metadata.type && practiceTypes.includes(metadata.type)) {
        // Fire and forget to prevent main thread blocking/timeout
        setTimeout(async () => {
          try {
            const memories = await hindsight.getHistory();
            const practiceCount = Array.isArray(memories) 
              ? memories.filter(m => m.metadata?.type && practiceTypes.includes(m.metadata.type)).length 
              : 0;

            if (practiceCount > 0 && practiceCount % 5 === 0) {
              await hindsight.reflect('summarize user learning patterns').catch(() => {});
            }

            if (practiceCount > 0 && practiceCount % 10 === 0) {
              await client.createMentalModel(BANK_ID, {
                name: 'User Learning Profile',
                source_query: 'What are key learning patterns and weak areas?'
              }).catch(() => {});
            }
          } catch (e: any) {
            console.warn('[Hindsight SDK] Background automation non-critical failure:', e.message);
          }
        }, 100);
      }

      return JSON.parse(JSON.stringify(result));
    } catch (error: any) {
      console.error('[Hindsight SDK] Retain Failed:', error.message);
      return null;
    }
  },

  /**
   * Recall memories based on semantic similarity.
   */
  recall: async (query: string, topK: number = 5) => {
    if (!API_KEY || !client) return [];

    try {
      console.log('[Hindsight SDK] Recalling memory directly via client...');
      const result = await client.recall(BANK_ID, { query, topK });
      const memories = Array.isArray(result.memories) ? result.memories : [];
      return JSON.parse(JSON.stringify(memories));
    } catch (error: any) {
      console.error('[Hindsight SDK] Recall Failed:', error.message);
      return [];
    }
  },

  /**
   * List recent memory history.
   */
  getHistory: async (): Promise<HindsightMemory[]> => {
    if (!API_KEY || !client) return [];

    try {
      console.log('[Hindsight SDK] Fetching memory history...');
      const result = await client.listMemories(BANK_ID);
      const memories = (result.memories || []) as HindsightMemory[];
      return JSON.parse(JSON.stringify(memories));
    } catch (error: any) {
      console.error('[Hindsight SDK] History Failed:', error.message);
      return [];
    }
  },

  /**
   * Trigger a reflection task to identify patterns.
   */
  reflect: async (task?: string) => {
    if (!API_KEY || !client) return null;

    try {
      const taskDescription = task || 'summarize user learning patterns';
      console.log(`[Hindsight SDK] Triggering reflection: "${taskDescription}"`);
      const result = await client.reflect(BANK_ID, taskDescription);
      return JSON.parse(JSON.stringify(result));
    } catch (error: any) {
      console.warn('[Hindsight SDK] Reflect Task non-critical failure:', error.message);
      return null;
    }
  },

  /**
   * Create a mental model based on a source query.
   */
  createMentalModel: async (name: string, sourceQuery: string) => {
    if (!API_KEY || !client) return null;
    try {
      console.log(`[Hindsight SDK] Creating mental model: "${name}"`);
      const result = await client.createMentalModel(BANK_ID, {
        name,
        source_query: sourceQuery
      });
      return JSON.parse(JSON.stringify(result));
    } catch (error: any) {
      console.warn('[Hindsight SDK] Create Mental Model failed:', error.message);
      return null;
    }
  }
};