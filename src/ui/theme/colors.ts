export const colors = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    surface: '#F8F9FA',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    borderFocus: '#2563EB',
    primary: '#2563EB',
    guide: '#F3F4F6',
    citation: '#EFF6FF',
    citationBorder: '#BFDBFE',
    error: '#DC2626',
    warning: '#FFF9E6',
    success: '#059669',
  },
  dark: {
    background: '#000000',
    backgroundSecondary: '#1A1A1A',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    border: '#374151',
    borderFocus: '#3B82F6',
    primary: '#3B82F6',
    guide: '#1F2937',
    citation: '#1E293B',
    citationBorder: '#334155',
    error: '#EF4444',
    warning: '#4A3F1A',
    success: '#10B981',
  },
};

export type Theme = typeof colors.light;

/**
 * Get theme for current color scheme (handles null, undefined, and 'unspecified')
 */
export function getTheme(scheme: 'light' | 'dark' | 'unspecified' | null | undefined): Theme {
  return colors[scheme === 'dark' ? 'dark' : 'light'];
}
