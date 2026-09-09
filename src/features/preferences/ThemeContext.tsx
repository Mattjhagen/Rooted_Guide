import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { safeStorage } from '@/infrastructure/storage/safeStorage';
import { ThemePreference, DEFAULT_THEME_PREFERENCE } from '@/domain/models/Preferences';
import { getTheme, Theme } from '@/ui/theme/colors';

const ASYNC_STORAGE_THEME_KEY = '@plumb_line_theme_preference';

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedScheme: 'light' | 'dark';
  theme: Theme;
  setPreference: (pref: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(DEFAULT_THEME_PREFERENCE);

  useEffect(() => {
    async function loadStoredPreference() {
      try {
        const stored = await safeStorage.getItem(ASYNC_STORAGE_THEME_KEY);
        if (stored === 'system' || stored === 'light' || stored === 'dark') {
          setPreferenceState(stored as ThemePreference);
        }
      } catch (error) {
        console.error('Failed to load theme preference from storage:', error);
      }
    }
    loadStoredPreference();
  }, []);

  const setPreference = async (newPref: ThemePreference) => {
    try {
      setPreferenceState(newPref);
      await safeStorage.setItem(ASYNC_STORAGE_THEME_KEY, newPref);
    } catch (error) {
      console.error('Failed to save theme preference to storage:', error);
    }
  };

  const resolvedScheme: 'light' | 'dark' = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return preference;
  }, [preference, systemScheme]);

  const theme = useMemo(() => getTheme(resolvedScheme), [resolvedScheme]);

  const value = useMemo(
    () => ({
      preference,
      resolvedScheme,
      theme,
      setPreference,
    }),
    [preference, resolvedScheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if rendered outside provider (e.g. unit tests)
    const defaultScheme = 'light';
    return {
      preference: 'system',
      resolvedScheme: defaultScheme,
      theme: getTheme(defaultScheme),
      setPreference: async () => {},
    };
  }
  return context;
}
