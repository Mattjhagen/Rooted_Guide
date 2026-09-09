import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { safeStorage } from '../../infrastructure/storage/safeStorage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const ASYNC_STORAGE_AUTH_KEY = '@plumb_line_user_session';

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  photoUrl?: string;
  isOffline?: boolean;
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  skipAuth: (name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Expo Google Auth Request configuration
  const [_request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    async function loadStoredUser() {
      try {
        const stored = await safeStorage.getItem(ASYNC_STORAGE_AUTH_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredUser();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const fetchUserInfo = async (token: string) => {
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await userInfoResponse.json();

      const userProfile: UserProfile = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        photoUrl: userInfo.picture,
        isOffline: false,
      };

      setUser(userProfile);
      await safeStorage.setItem(ASYNC_STORAGE_AUTH_KEY, JSON.stringify(userProfile));
    } catch (error) {
      console.error('Failed to fetch Google user info:', error);
    }
  };

  const signInWithGoogle = useCallback(async () => {
    try {
      if (promptAsync) {
        await promptAsync();
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  }, [promptAsync]);

  const skipAuth = useCallback(async (name?: string) => {
    const offlineProfile: UserProfile = {
      id: 'local_offline_user',
      name: name || 'Friend',
      isOffline: true,
    };
    setUser(offlineProfile);
    await safeStorage.setItem(ASYNC_STORAGE_AUTH_KEY, JSON.stringify(offlineProfile));
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    await safeStorage.removeItem(ASYNC_STORAGE_AUTH_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signInWithGoogle,
      skipAuth,
      signOut,
    }),
    [user, isLoading, signInWithGoogle, skipAuth, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isLoading: false,
      signInWithGoogle: async () => {},
      skipAuth: async () => {},
      signOut: async () => {},
    };
  }
  return context;
}
