import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { ScriptureCitation } from '@/domain/models';
import { BibleRepository } from '@/domain/repositories';
import { getTheme, spacing, typography } from '@/ui/theme';
import { formatVerseRef } from '@/domain/models/VerseRef';

interface CitationCardProps {
  citation: ScriptureCitation;
  bibleRepository: BibleRepository;
}

export function CitationCard({ citation, bibleRepository }: CitationCardProps) {
  const [verseText, setVerseText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
      <Text style={[styles.reference, { color: theme.primary }]}>{ref}</Text>
      {loading ? (
        <ActivityIndicator size="small" color={theme.textSecondary} style={styles.loader} />
      ) : verseText ? (
        <Text style={[styles.text, { color: theme.text }]}>{verseText}</Text>
      ) : (
        <Text style={[styles.error, { color: theme.textSecondary }]}>
          Verse not found in test corpus
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: spacing.sm,
  },
  reference: {
    ...typography.label,
    marginBottom: spacing.xs,
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
});
