"use client";

import { useEffect } from "react";
import axios from "axios";

/**
 * A small invisible component to verify Hindsight backend connection on app load.
 */
export function HindsightConnectionCheck() {
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        console.log("[Hindsight Connection Check] Testing backend retain route...");
        await axios.post('/api/hindsight/retain', {
          content: "System Check: App initialized.",
          metadata: { type: 'system_check', timestamp: new Date().toISOString() }
        });
        console.log("[Hindsight Connection Check] Connection verified and check memory saved.");
      } catch (e) {
        console.warn("[Hindsight Connection Check] Failed. Make sure HINDSIGHT_API_KEY is correct in .env");
      }
    };
    
    // Only run once per session to avoid clutter
    const checkKey = 'hindsight_last_check';
    const lastCheck = sessionStorage.getItem(checkKey);
    const now = Date.now();
    
    if (!lastCheck || (now - parseInt(lastCheck)) > 1000 * 60 * 60) {
      verifyConnection();
      sessionStorage.setItem(checkKey, now.toString());
    }
  }, []);

  return null;
}
