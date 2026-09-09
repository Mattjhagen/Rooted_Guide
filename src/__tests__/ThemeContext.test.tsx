import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import { ThemeProvider, useTheme } from '@/features/preferences/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

function TestConsumer() {
  const { preference, resolvedScheme, theme, setPreference } = useTheme();

  return (
    <>
      <Text testID="preference">{preference}</Text>
      <Text testID="scheme">{resolvedScheme}</Text>
      <Text testID="bgColor">{theme.background}</Text>
      <TouchableOpacity testID="setDark" onPress={() => setPreference('dark')} />
      <TouchableOpacity testID="setLight" onPress={() => setPreference('light')} />
    </>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides default system preference when no stored theme', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('preference').children[0]).toBe('system');
    });
  });

  it('loads stored theme preference from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('preference').children[0]).toBe('dark');
      expect(getByTestId('scheme').children[0]).toBe('dark');
    });
  });

  it('updates preference and saves to AsyncStorage when setPreference called', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('light');

    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('preference').children[0]).toBe('light');
    });

    await act(async () => {
      fireEvent.press(getByTestId('setDark'));
    });

    expect(getByTestId('preference').children[0]).toBe('dark');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@plumb_line_theme_preference', 'dark');
  });
});
