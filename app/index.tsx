import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { useGuide } from '@/features/guide/useGuide';
import { MockGuideGateway, MockBibleRepository } from '@/infrastructure/adapters';
import { Composer, GuideMessage } from '@/ui/components';
import { getTheme, spacing, typography } from '@/ui/theme';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  // Initialize mock implementations for vertical slice
  const guideGateway = useMemo(() => new MockGuideGateway(), []);
  const bibleRepository = useMemo(() => new MockBibleRepository(), []);

  const { turns, isLoading, sendMessage } = useGuide(guideGateway);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {turns.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
                Plumb Line
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                A personal Bible guide
              </Text>
            </View>
          ) : (
            <View style={styles.conversation}>
              {turns.map((turn) => (
                <GuideMessage key={turn.id} turn={turn} bibleRepository={bibleRepository} />
              ))}
            </View>
          )}
        </ScrollView>

        <Composer
          onSubmit={sendMessage}
          disabled={isLoading}
          placeholder={
            turns.length === 0 ? "What's on your heart?" : 'Continue the conversation...'
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
  },
  conversation: {
    paddingTop: spacing.md,
  },
});
