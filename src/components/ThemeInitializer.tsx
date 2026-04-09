'use client';

import { useEffect } from 'react';

/**
 * Client-side component to initialize and react to app theme (dark/light) changes.
 */
export function ThemeInitializer() {
  const applyTheme = () => {
    try {
      const savedProfile = localStorage.getItem('codementor_profile');
      const profile = savedProfile ? JSON.parse(savedProfile) : {};
      const theme = profile.theme || 'dark';

      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch (error) {
      console.error('Failed to initialize theme from localStorage:', error);
      document.documentElement.classList.add('dark');
    }
  };

  useEffect(() => {
    applyTheme();
    // Listen for storage changes to update theme in real-time across tabs/components
    window.addEventListener('storage', applyTheme);
    return () => window.removeEventListener('storage', applyTheme);
  }, []);

  return null;
}
