/**
 * Theme preference hook
 * Manages theme preference state and resolves to actual color scheme
 */

import { useState } from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';
import { ThemePreference, DEFAULT_THEME_PREFERENCE } from '@/domain/models/Preferences';

/**
 * Resolve theme preference to actual color scheme
 */
function resolveColorScheme(
  preference: ThemePreference,
  systemScheme: ColorSchemeName
): 'light' | 'dark' {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

/**
 * Hook to manage theme preference
 * Returns current preference and resolved color scheme
 */
export function useThemePreference() {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(DEFAULT_THEME_PREFERENCE);

  // Resolve preference to actual scheme
  const resolvedScheme = resolveColorScheme(preference, systemScheme);

  return {
    preference,
    resolvedScheme,
    setPreference,
  };
}
