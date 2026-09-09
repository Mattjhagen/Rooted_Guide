import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme, Appearance } from 'react-native';
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
  const [activeSystemScheme, setActiveSystemScheme] = useState<'light' | 'dark'>(() => {
    const current = Appearance.getColorScheme();
    return current === 'dark' ? 'dark' : 'light';
  });
  const [preference, setPreferenceState] = useState<ThemePreference>(DEFAULT_THEME_PREFERENCE);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme === 'dark' || colorScheme === 'light') {
        setActiveSystemScheme(colorScheme);
      }
    });
    return () => subscription.remove();
  }, []);

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
      return activeSystemScheme;
    }
    return preference;
  }, [preference, activeSystemScheme]);

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
    const defaultScheme = 'dark';
    return {
      preference: 'dark',
      resolvedScheme: defaultScheme,
      theme: getTheme(defaultScheme),
      setPreference: async () => {},
    };
  }
  return context;
}
