import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PassageView } from '@/ui/components/PassageView';
import { PassageRef } from '@/domain/models/VerseRef';
import { getTheme, spacing, typography } from '@/ui/theme';

/**
 * PassageScreen displays a Scripture passage in isolation
 *
 * Used when reopening saved items (bookmarks, highlights, notes, reflections).
 * Shows the passage with full verse action capabilities and option to open full chapter.
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

  const handleOpenFullChapter = () => {
    router.push(
      `/reader?book=${encodeURIComponent(passageRef.book)}&chapter=${passageRef.chapter}`
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.primary }]}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PassageView passageRef={passageRef} />

        <TouchableOpacity
          style={[
            styles.openChapterButton,
            { borderColor: theme.border, backgroundColor: theme.surface },
          ]}
          onPress={handleOpenFullChapter}
          accessibilityLabel="Open full chapter"
        >
          <Text style={[styles.openChapterText, { color: theme.primary }]}>Open full chapter</Text>
        </TouchableOpacity>
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
  openChapterButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openChapterText: {
    ...typography.body,
    fontWeight: '600',
  },
});
