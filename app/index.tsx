import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  SafeAreaView,
  useWindowDimensions,
  AccessibilityInfo,
} from 'react-native';
import { useGuide } from '@/features/guide/useGuide';
import { useDraftPersistence } from '@/features/guide/useDraftPersistence';
import { MockGuideGateway, MockBibleRepository } from '@/infrastructure/adapters';
import { Composer, GuideMessage } from '@/ui/components';
import { getTheme, spacing, typography } from '@/ui/theme';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const { height } = useWindowDimensions();

  const [draft, setDraft] = useState('');
  const { saveDraft, loadDraft, clearDraft } = useDraftPersistence();

  // Initialize mock implementations for vertical slice
  const guideGateway = useMemo(() => new MockGuideGateway(), []);
  const bibleRepository = useMemo(() => new MockBibleRepository(), []);

  const { turns, state, sendMessage } = useGuide(guideGateway);

  const isEmpty = turns.length === 0;

  // Load saved draft on mount
  useEffect(() => {
    async function restoreDraft() {
      const saved = await loadDraft();
      if (saved && isEmpty) {
        setDraft(saved);
      }
    }
    restoreDraft();
  }, [loadDraft, isEmpty]);

  // Announce app ready for screen readers
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility('Plumb Line guide ready');
  }, []);

  const handleDraftChange = (text: string) => {
    setDraft(text);
    saveDraft(text);
  };

  const handleSubmit = async (text: string) => {
    await sendMessage(text);
    await clearDraft();
  };

  const handleSuggestionPress = (text: string) => {
    setDraft(text);
    saveDraft(text);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, isEmpty && { minHeight: height * 0.5 }]}
          keyboardShouldPersistTaps="handled"
          accessibilityRole="scrollbar"
        >
          {isEmpty ? (
            <View style={styles.emptyState}>
              <Text style={[styles.invitation, { color: theme.text }]} accessibilityRole="header">
                Let's begin with where you are.
              </Text>
            </View>
          ) : (
            <View style={styles.conversation}>
              {turns.map((turn) => (
                <GuideMessage
                  key={turn.id}
                  turn={turn}
                  bibleRepository={bibleRepository}
                  onSuggestionPress={handleSuggestionPress}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <Composer
          onSubmit={handleSubmit}
          onDraftChange={handleDraftChange}
          disabled={state.type === 'offline' || state.type === 'error'}
          placeholder={isEmpty ? '' : 'Continue...'}
          autoFocus={isEmpty}
          state={state}
          initialDraft={draft}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  invitation: {
    ...typography.title,
    fontSize: 28,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  conversation: {
    paddingVertical: spacing.md,
  },
});
