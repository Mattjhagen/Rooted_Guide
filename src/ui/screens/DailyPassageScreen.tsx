import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useBibleRepository } from '@/infrastructure/scripture/useBibleRepository';
import { BibleBook } from '@/domain/models/BibleBook';
import { Verse } from '@/domain/models';
import { getTheme, spacing, typography } from '@/ui/theme';

interface DailyPassageScreenProps {
  onAskAboutThis?: (passageContext: {
    book: string;
    chapter: number;
    verses: number[];
    text: string;
  }) => void;
  guideAvailable: boolean;
}

/**
 * Daily Passage Screen - The main entry point
 *
 * Shows today's Scripture passage without requiring any AI service.
 * Optionally offers "Ask about this" if guide service is available.
 */
export function DailyPassageScreen({ onAskAboutThis, guideAvailable }: DailyPassageScreenProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const bibleRepository = useBibleRepository();

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  // For now, use Psalm 23 as the daily passage
  // In Prompt 6, this will be replaced with actual daily module system
  const dailyPassage = {
    book: BibleBook.Psalms,
    chapter: 23,
    verseStart: 1,
    verseEnd: 6,
  };

  useEffect(() => {
    async function loadPassage() {
      try {
        const passageVerses = await bibleRepository.getPassage({
          book: dailyPassage.book,
          chapter: dailyPassage.chapter,
          verseStart: dailyPassage.verseStart,
          verseEnd: dailyPassage.verseEnd,
        });
        setVerses(passageVerses);
      } catch (error) {
        console.error('Failed to load daily passage:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPassage();
  }, [
    bibleRepository,
    dailyPassage.book,
    dailyPassage.chapter,
    dailyPassage.verseStart,
    dailyPassage.verseEnd,
  ]);

  const handleAskAboutThis = () => {
    if (!onAskAboutThis || !guideAvailable) return;

    onAskAboutThis({
      book: dailyPassage.book,
      chapter: dailyPassage.chapter,
      verses: verses.map((v) => v.ref.verse),
      text: verses.map((v) => `${v.ref.verse}. ${v.text}`).join(' '),
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading today's passage...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Today's Passage</Text>
          <Text style={[styles.reference, { color: theme.textSecondary }]}>
            {dailyPassage.book} {dailyPassage.chapter}:{dailyPassage.verseStart}-
            {dailyPassage.verseEnd}
          </Text>
        </View>

        <View style={styles.passage}>
          {verses.map((verse) => (
            <View key={`${verse.ref.chapter}:${verse.ref.verse}`} style={styles.verseContainer}>
              <Text style={[styles.verseNumber, { color: theme.textTertiary }]}>
                {verse.ref.verse}
              </Text>
              <Text style={[styles.verseText, { color: theme.text }]}>{verse.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.translationNote}>
          <Text style={[styles.translationText, { color: theme.textTertiary }]}>
            World English Bible
          </Text>
        </View>

        {guideAvailable && onAskAboutThis && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.askButton, { backgroundColor: theme.primary }]}
              onPress={handleAskAboutThis}
              accessibilityRole="button"
              accessibilityLabel="Ask about this passage"
            >
              <Text style={styles.askButtonText}>Ask about this</Text>
            </TouchableOpacity>
            <Text style={[styles.askHint, { color: theme.textTertiary }]}>
              Reflect on this passage with guidance
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  reference: {
    ...typography.body,
    fontSize: 16,
  },
  passage: {
    marginBottom: spacing.lg,
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  verseNumber: {
    ...typography.body,
    fontSize: 14,
    minWidth: 32,
    marginRight: spacing.sm,
  },
  verseText: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  translationNote: {
    marginBottom: spacing.xl,
  },
  translationText: {
    ...typography.body,
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  askButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  askButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  askHint: {
    ...typography.body,
    fontSize: 14,
  },
});
