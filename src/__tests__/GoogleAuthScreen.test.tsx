import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GoogleAuthScreen } from '@/ui/screens/GoogleAuthScreen';
import { ThemeProvider } from '@/features/preferences/ThemeContext';
import { AuthProvider } from '@/features/auth/AuthContext';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn().mockReturnValue([null, null, jest.fn()]),
}));

describe('GoogleAuthScreen', () => {
  it('renders personalized title with user name', () => {
    const { getByText } = render(
      <AuthProvider>
        <ThemeProvider>
          <GoogleAuthScreen userName="Matthew" onComplete={jest.fn()} />
        </ThemeProvider>
      </AuthProvider>
    );

    expect(getByText(/Save & sync your practice, Matthew/)).toBeTruthy();
  });

  it('handles offline continue action', async () => {
    const onCompleteMock = jest.fn();
    const { getByLabelText } = render(
      <AuthProvider>
        <ThemeProvider>
          <GoogleAuthScreen userName="Matthew" onComplete={onCompleteMock} />
        </ThemeProvider>
      </AuthProvider>
    );

    const skipBtn = getByLabelText('Continue offline');
    fireEvent.press(skipBtn);

    await waitFor(() => {
      expect(onCompleteMock).toHaveBeenCalled();
    });
  });
});
