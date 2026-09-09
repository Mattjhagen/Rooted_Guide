import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { safeStorage } from '../../infrastructure/storage/safeStorage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../infrastructure/sync/supabaseClient';
import { SyncEngine } from '../../infrastructure/sync/syncEngine';

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

  const redirectUri = useMemo(() => {
    try {
      return makeRedirectUri({ scheme: 'plumbline' });
    } catch {
      return 'plumbline://';
    }
  }, []);

  // Expo Google Auth Request configuration
  const [_request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'missing-android-client-id',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'missing-ios-client-id',
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'missing-web-client-id',
    redirectUri,
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
      if (authentication?.accessToken && authentication?.idToken) {
        handleSupabaseLogin(authentication.idToken, authentication.accessToken);
      } else if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const handleSupabaseLogin = async (idToken: string, accessToken: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
        access_token: accessToken,
      });
      if (error) throw error;
      
      if (data.session) {
        const userProfile: UserProfile = {
          id: data.session.user.id,
          name: data.session.user.user_metadata?.full_name || 'Friend',
          email: data.session.user.email,
          photoUrl: data.session.user.user_metadata?.avatar_url,
          isOffline: false,
        };
        setUser(userProfile);
        await safeStorage.setItem(ASYNC_STORAGE_AUTH_KEY, JSON.stringify(userProfile));
        
        // Trigger Sync Down!
        SyncEngine.syncDown(data.session.user.id);
      }
    } catch (e) {
      console.error('Supabase Login Error:', e);
      // Fallback to offline mode
      fetchUserInfo(accessToken);
    }
  };

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
