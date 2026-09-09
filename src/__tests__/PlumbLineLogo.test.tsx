import React from 'react';
import { render } from '@testing-library/react-native';
import { PlumbLineLogo } from '@/ui/components/PlumbLineLogo';
import { ThemeProvider } from '@/features/preferences/ThemeContext';

describe('PlumbLineLogo', () => {
  it('renders without crashing with default size', () => {
    const { UNSAFE_getByType } = render(
      <ThemeProvider>
        <PlumbLineLogo />
      </ThemeProvider>
    );

    expect(UNSAFE_getByType(PlumbLineLogo)).toBeTruthy();
  });

  it('renders with custom size and explicit theme variant', () => {
    const { UNSAFE_getByType } = render(
      <ThemeProvider>
        <PlumbLineLogo size={64} variant="dark" />
      </ThemeProvider>
    );

    const logo = UNSAFE_getByType(PlumbLineLogo);
    expect(logo.props.size).toBe(64);
    expect(logo.props.variant).toBe('dark');
  });
});
