import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { spacing, typography } from '@/ui/theme';
import { useTheme } from '@/features/preferences/ThemeContext';
import { useAuth } from '@/features/auth/AuthContext';
import { PlumbLineLogo } from '@/ui/components/PlumbLineLogo';

interface GoogleAuthScreenProps {
  userName?: string;
  onComplete: () => void;
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function GoogleAuthScreen({ userName, onComplete }: GoogleAuthScreenProps) {
  const { theme } = useTheme();
  const { signInWithGoogle, skipAuth } = useAuth();

  const displayName = userName?.trim() ? `, ${userName.trim()}` : '';

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    onComplete();
  };

  const handleSkip = async () => {
    await skipAuth(userName);
    onComplete();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top', 'bottom']}
    >
      {/* Top Header */}
      <View style={styles.headerContainer}>
        <PlumbLineLogo size={36} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            Save & sync your practice{displayName}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign in with Google to keep your daily reflections, notes, and bookmarks safely backed
            up and synced.
          </Text>
        </View>

        <View style={styles.actions}>
          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={handleGoogleSignIn}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
          >
            <GoogleIcon size={20} />
            <Text style={[styles.googleButtonText, { color: theme.text }]}>
              Sign in with Google
            </Text>
          </TouchableOpacity>

          {/* Skip / Offline Button */}
          <TouchableOpacity
            style={[styles.skipButton, { borderColor: theme.border }]}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Continue offline"
          >
            <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>
              Continue offline
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  titleContainer: {
    gap: spacing.md,
    alignItems: 'center',
  },
  title: {
    ...typography.display,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 26,
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 340,
  },
  actions: {
    gap: spacing.md,
    width: '100%',
  },
  googleButton: {
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  googleButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '500',
  },
});
