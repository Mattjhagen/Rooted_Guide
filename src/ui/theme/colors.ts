export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    primary: '#2563EB',
    guide: '#F3F4F6',
    citation: '#EFF6FF',
    citationBorder: '#BFDBFE',
  },
  dark: {
    background: '#000000',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    border: '#374151',
    primary: '#3B82F6',
    guide: '#1F2937',
    citation: '#1E293B',
    citationBorder: '#334155',
  },
};

export type Theme = typeof colors.light;

/**
 * Get theme for current color scheme (handles null, undefined, and 'unspecified')
 */
export function getTheme(scheme: 'light' | 'dark' | 'unspecified' | null | undefined): Theme {
  return colors[scheme === 'dark' ? 'dark' : 'light'];
}
