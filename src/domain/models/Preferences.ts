/**
 * Theme preference values
 * - system: Follow device appearance (default)
 * - light: Always use light theme
 * - dark: Always use dark theme
 */
export type ThemePreference = 'system' | 'light' | 'dark';

export interface ReaderPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: 'system' | 'serif' | 'sans-serif';
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  lastReadRef: string | null;
}

export interface AccountPreferences {
  theme: ThemePreference;
  syncEnabled: boolean;
  notificationsEnabled: boolean;
}

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'dark';

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  fontSize: 'medium',
  fontFamily: 'system',
  lineSpacing: 'normal',
  lastReadRef: null,
};

export const DEFAULT_ACCOUNT_PREFERENCES: AccountPreferences = {
  theme: DEFAULT_THEME_PREFERENCE,
  syncEnabled: false,
  notificationsEnabled: false,
};
