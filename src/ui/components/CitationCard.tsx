import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { ScriptureCitation } from '@/domain/models';
import { BibleRepository } from '@/domain/repositories';
import { getTheme, spacing, typography } from '@/ui/theme';
import { formatVerseRef } from '@/domain/models/VerseRef';
import { PassageContextView } from './PassageContextView';

interface CitationCardProps {
  citation: ScriptureCitation;
  bibleRepository: BibleRepository;
}

export function CitationCard({ citation, bibleRepository }: CitationCardProps) {
  const [verseText, setVerseText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContext, setShowContext] = useState(false);
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  useEffect(() => {
    async function loadVerse() {
      try {
        const verse = await bibleRepository.getVerse({
          book: citation.book,
          chapter: citation.chapter,
          verse: citation.verse,
        });
        setVerseText(verse?.text || null);
      } catch (error) {
        console.error('Failed to load verse:', error);
        setVerseText(null);
      } finally {
        setLoading(false);
      }
    }

    loadVerse();
  }, [citation, bibleRepository]);

  const ref = formatVerseRef({
    book: citation.book,
    chapter: citation.chapter,
    verse: citation.verse,
  });

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.citation,
            borderColor: theme.citationBorder,
          },
        ]}
        accessibilityRole="text"
        accessibilityLabel={`Scripture citation: ${ref}`}
      >
        <View style={styles.header}>
          <Text style={[styles.reference, { color: theme.primary }]}>{ref}</Text>
          <Text style={[styles.translation, { color: theme.textTertiary }]}>WEB</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={theme.textSecondary} style={styles.loader} />
        ) : verseText ? (
          <>
            <Text style={[styles.text, { color: theme.text }]}>{verseText}</Text>
            <TouchableOpacity
              style={[styles.contextButton, { borderTopColor: theme.border }]}
              onPress={() => setShowContext(true)}
              accessibilityRole="button"
              accessibilityLabel="View passage context"
              accessibilityHint="Opens a view showing surrounding verses"
            >
              <Text style={[styles.contextButtonText, { color: theme.primary }]}>
                View passage context
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.error, { color: theme.textSecondary }]}>
            Verse not found in local WEB corpus
          </Text>
        )}
      </View>

      <PassageContextView
        citation={citation}
        bibleRepository={bibleRepository}
        visible={showContext}
        onClose={() => setShowContext(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reference: {
    ...typography.label,
  },
  translation: {
    ...typography.bodySmall,
    fontSize: 11,
  },
  text: {
    ...typography.body,
  },
  error: {
    ...typography.bodySmall,
    fontStyle: 'italic',
  },
  loader: {
    marginVertical: spacing.sm,
  },
  contextButton: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  contextButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});
