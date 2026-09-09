import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';

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

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides default fallback values when used outside AuthProvider', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('allows user to skip auth and create offline profile', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.skipAuth('Matthew');
    });

    expect(result.current.user).toEqual({
      id: 'local_offline_user',
      name: 'Matthew',
      isOffline: true,
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@plumb_line_user_session',
      JSON.stringify({
        id: 'local_offline_user',
        name: 'Matthew',
        isOffline: true,
      })
    );
  });

  it('clears user session on signOut', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.skipAuth('Matthew');
    });

    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@plumb_line_user_session');
  });
});
