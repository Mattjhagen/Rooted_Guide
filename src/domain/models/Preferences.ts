export interface ReaderPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: 'system' | 'serif' | 'sans-serif';
  lineSpacing: 'compact' | 'normal' | 'relaxed';
}

export interface AccountPreferences {
  syncEnabled: boolean;
  notificationsEnabled: boolean;
}

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  fontSize: 'medium',
  fontFamily: 'system',
  lineSpacing: 'normal',
};
