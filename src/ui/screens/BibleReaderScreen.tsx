import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeftIcon, ChevronRightIcon, BookOpenIcon } from '@/ui/components/FallbackIcons';
import { useBibleRepository } from '@/infrastructure/scripture/useBibleRepository';
import { useUserDatabase } from '@/infrastructure/persistence/useUserDatabase';
import { Verse, ChapterRef, HighlightColor } from '@/domain/models';
import { spacing, typography } from '@/ui/theme';
import { useTheme } from '@/features/preferences/ThemeContext';
import { VerseActions } from '@/ui/components/VerseActions';

/**
 * Bible Reader Screen
 *
 * Displays a full chapter with verse-level actions.
 * Remembers last reading position and shows saved-state indicators.
 */
export function BibleReaderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const bibleRepository = useBibleRepository();
  const { bookmarkRepository, highlightRepository, preferencesRepository } = useUserDatabase();

  const bookParam = params.book as string;
  const chapterParam = parseInt(params.chapter as string, 10);

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [verseStates, setVerseStates] = useState<
    Map<string, { isBookmarked: boolean; highlightColor?: HighlightColor }>
  >(new Map());

  // Get chapter count for the current book
  const getChapterCount = (bookName: string): number => {
    const chapterCounts: Record<string, number> = {
      Genesis: 50,
      Exodus: 40,
      Leviticus: 27,
      Numbers: 36,
      Deuteronomy: 34,
      Joshua: 24,
      Judges: 21,
      Ruth: 4,
      '1 Samuel': 31,
      '2 Samuel': 24,
      '1 Kings': 22,
      '2 Kings': 25,
      '1 Chronicles': 29,
      '2 Chronicles': 36,
      Ezra: 10,
      Nehemiah: 13,
      Esther: 10,
      Job: 42,
      Psalms: 150,
      Proverbs: 31,
      Ecclesiastes: 12,
      'Song of Solomon': 8,
      Isaiah: 66,
      Jeremiah: 52,
      Lamentations: 5,
      Ezekiel: 48,
      Daniel: 12,
      Hosea: 14,
      Joel: 3,
      Amos: 9,
      Obadiah: 1,
      Jonah: 4,
      Micah: 7,
      Nahum: 3,
      Habakkuk: 3,
      Zephaniah: 3,
      Haggai: 2,
      Zechariah: 14,
      Malachi: 4,
      Matthew: 28,
      Mark: 16,
      Luke: 24,
      John: 21,
      Acts: 28,
      Romans: 16,
      '1 Corinthians': 16,
      '2 Corinthians': 13,
      Galatians: 6,
      Ephesians: 6,
      Philippians: 4,
      Colossians: 4,
      '1 Thessalonians': 5,
      '2 Thessalonians': 3,
      '1 Timothy': 6,
      '2 Timothy': 4,
      Titus: 3,
      Philemon: 1,
      Hebrews: 13,
      James: 5,
      '1 Peter': 5,
      '2 Peter': 3,
      '1 John': 5,
      '2 John': 1,
      '3 John': 1,
      Jude: 1,
      Revelation: 22,
    };
    return chapterCounts[bookName] || 1;
  };

  const currentChapterCount = getChapterCount(bookParam);
  const hasPreviousChapter = chapterParam > 1;
  const hasNextChapter = chapterParam < currentChapterCount;

  const loadVerseStates = useCallback(
    async (verseList: Verse[]) => {
      const states = new Map<string, { isBookmarked: boolean; highlightColor?: HighlightColor }>();
      await Promise.all(
        verseList.map(async (verse) => {
          const verseKey = `${verse.ref.book}-${verse.ref.chapter}-${verse.ref.verse}`;
          const isBookmarked = await bookmarkRepository.isBookmarked(verse.ref);
          const highlight = await highlightRepository.getHighlight(verse.ref);

          states.set(verseKey, {
            isBookmarked,
            highlightColor: highlight?.color,
          });
        })
      );
      setVerseStates(states);
    },
    [bookmarkRepository, highlightRepository]
  );

  useEffect(() => {
    async function loadChapter() {
      if (!bookParam || isNaN(chapterParam)) {
        setLoading(false);
        return;
      }

      try {
        const chapterRef: ChapterRef = {
          book: bookParam as any,
          chapter: chapterParam,
        };

        const result = await bibleRepository.getChapter(chapterRef);
        setVerses(result);
        await loadVerseStates(result);

        // Update reading position
        await preferencesRepository.updateReaderPreferences({
          lastReadRef: `${bookParam} ${chapterParam}`,
        });
      } catch (error) {
        console.error('Failed to load chapter:', error);
      } finally {
        setLoading(false);
      }
    }

    loadChapter();
  }, [bookParam, chapterParam, bibleRepository, preferencesRepository, loadVerseStates]);

  const handleActionComplete = useCallback(async () => {
    if (verses.length > 0) {
      await loadVerseStates(verses);
    }
  }, [verses, loadVerseStates]);

  const handlePreviousChapter = () => {
    if (hasPreviousChapter) {
      router.push(`/reader?book=${encodeURIComponent(bookParam)}&chapter=${chapterParam - 1}`);
    }
  };

  const handleNextChapter = () => {
    if (hasNextChapter) {
      router.push(`/reader?book=${encodeURIComponent(bookParam)}&chapter=${chapterParam + 1}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading chapter...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bookParam || isNaN(chapterParam) || verses.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>Chapter not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ChevronLeftIcon size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={[styles.bookName, { color: theme.text }]}>{bookParam}</Text>
          <Text style={[styles.chapterNumber, { color: theme.textSecondary }]}>
            Chapter {chapterParam}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/browse')} style={styles.headerButton}>
          <BookOpenIcon size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Chapter content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.verses}>
          {verses.map((verse) => {
            const verseKey = `${verse.ref.book}-${verse.ref.chapter}-${verse.ref.verse}`;
            const state = verseStates.get(verseKey);
            const highlightBgColor = state?.highlightColor
              ? getHighlightBackgroundColor(state.highlightColor)
              : undefined;

            return (
              <TouchableOpacity
                key={verseKey}
                onPress={() => setSelectedVerse(verse)}
                accessibilityLabel={`${verse.ref.book} ${verse.ref.chapter}:${verse.ref.verse}${
                  state?.isBookmarked ? ', bookmarked' : ''
                }${state?.highlightColor ? `, highlighted ${state.highlightColor}` : ''}`}
              >
                <View
                  style={[
                    styles.verseContainer,
                    highlightBgColor && { backgroundColor: highlightBgColor },
                  ]}
                >
                  <View style={styles.verseNumberContainer}>
                    <Text style={[styles.verseNumber, { color: theme.textSecondary }]}>
                      {verse.ref.verse}
                    </Text>
                    {state?.isBookmarked && (
                      <View
                        style={[styles.bookmarkIndicator, { backgroundColor: theme.primary }]}
                        accessibilityLabel="Bookmarked"
                      />
                    )}
                  </View>
                  <Text style={[styles.verseText, { color: theme.text }]}>{verse.text}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation footer */}
      <View
        style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}
      >
        <TouchableOpacity
          onPress={handlePreviousChapter}
          disabled={!hasPreviousChapter}
          style={[styles.navButton, !hasPreviousChapter && styles.navButtonDisabled]}
        >
          <ChevronLeftIcon
            size={24}
            color={hasPreviousChapter ? theme.text : theme.textSecondary}
          />
          <Text
            style={[
              styles.navText,
              { color: hasPreviousChapter ? theme.text : theme.textSecondary },
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <Text style={[styles.chapterIndicator, { color: theme.textSecondary }]}>
          {chapterParam} / {currentChapterCount}
        </Text>

        <TouchableOpacity
          onPress={handleNextChapter}
          disabled={!hasNextChapter}
          style={[styles.navButton, !hasNextChapter && styles.navButtonDisabled]}
        >
          <Text
            style={[styles.navText, { color: hasNextChapter ? theme.text : theme.textSecondary }]}
          >
            Next
          </Text>
          <ChevronRightIcon size={24} color={hasNextChapter ? theme.text : theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Verse actions modal */}
      {selectedVerse && (
        <VerseActions
          verse={selectedVerse}
          visible={!!selectedVerse}
          onClose={() => setSelectedVerse(null)}
          onActionComplete={handleActionComplete}
        />
      )}
    </SafeAreaView>
  );
}

function getHighlightBackgroundColor(color: HighlightColor): string {
  switch (color) {
    case 'yellow':
      return 'rgba(254, 243, 199, 0.3)';
    case 'green':
      return 'rgba(209, 250, 229, 0.3)';
    case 'blue':
      return 'rgba(219, 234, 254, 0.3)';
    case 'pink':
      return 'rgba(252, 231, 243, 0.3)';
    case 'purple':
      return 'rgba(237, 233, 254, 0.3)';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
  },
  errorText: {
    ...typography.body,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  bookName: {
    ...typography.title,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 19,
    fontWeight: '600',
  },
  chapterNumber: {
    ...typography.caption,
    fontSize: 13,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  verses: {
    gap: spacing.sm,
  },
  verseContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: 4,
  },
  verseNumberContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 28,
    paddingTop: 2,
  },
  verseNumber: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
  },
  bookmarkIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  verseText: {
    ...typography.body,
    flex: 1,
    lineHeight: 26,
    fontSize: 17,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navText: {
    ...typography.body,
    fontWeight: '500',
  },
  chapterIndicator: {
    ...typography.caption,
    fontWeight: '600',
  },
});
