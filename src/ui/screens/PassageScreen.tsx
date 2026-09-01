import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PassageView } from '@/ui/components/PassageView';
import { PassageRef } from '@/domain/models/VerseRef';
import { getTheme, spacing, typography } from '@/ui/theme';

/**
 * PassageScreen displays a Scripture passage in isolation
 *
 * Used when reopening saved items (bookmarks, highlights, notes, reflections).
 * Shows the passage with full verse action capabilities.
 */
export function PassageScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const router = useRouter();
  const params = useLocalSearchParams<{
    book: string;
    chapter: string;
    verseStart: string;
    verseEnd?: string;
  }>();

  const passageRef: PassageRef = {
    book: params.book as any,
    chapter: parseInt(params.chapter, 10),
    verseStart: parseInt(params.verseStart, 10),
    verseEnd: params.verseEnd ? parseInt(params.verseEnd, 10) : parseInt(params.verseStart, 10),
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.backButton, { color: theme.primary }]} onPress={() => router.back()}>
          Back
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PassageView passageRef={passageRef} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    ...typography.body,
    fontWeight: '500',
  },
  content: {
    padding: spacing.lg,
  },
});
