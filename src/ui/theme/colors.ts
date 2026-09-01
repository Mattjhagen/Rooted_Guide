export const colors = {
  light: {
    background: '#FAF8F4',
    backgroundSecondary: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#1A1512',
    textSecondary: '#6B5744',
    textTertiary: '#9B8B7E',
    border: '#E5DDD5',
    borderFocus: '#8B7355',
    primary: '#6B5744',
    guide: '#F5F2EE',
    citation: '#F9F6F1',
    citationBorder: '#D9CEC1',
    error: '#B84644',
    warning: '#FFF9E6',
    success: '#5A7A63',
  },
  dark: {
    background: '#000000',
    backgroundSecondary: '#0D0B09',
    surface: '#1A1512',
    text: '#F0EDE8',
    textSecondary: '#B9A991',
    textTertiary: '#8B7A68',
    border: '#2D2824',
    borderFocus: '#8B7355',
    primary: '#8B7355',
    guide: '#1A1512',
    citation: '#231F1C',
    citationBorder: '#3D352E',
    error: '#D47270',
    warning: '#4A3F1A',
    success: '#7A9A84',
  },
};

export type Theme = typeof colors.light;

/**
 * Get theme for current color scheme (handles null, undefined, and 'unspecified')
 */
export function getTheme(scheme: 'light' | 'dark' | 'unspecified' | null | undefined): Theme {
  return colors[scheme === 'dark' ? 'dark' : 'light'];
}
