import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { GuideTurn } from '@/domain/models';
import { BibleRepository } from '@/domain/repositories';
import { getTheme, spacing, typography } from '@/ui/theme';
import { CitationCard } from './CitationCard';

interface GuideMessageProps {
  turn: GuideTurn;
  bibleRepository?: BibleRepository;
}

export function GuideMessage({ turn, bibleRepository }: GuideMessageProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  const isUser = turn.role === 'user';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.message,
          isUser ? styles.userMessage : styles.guideMessage,
          {
            backgroundColor: isUser ? theme.primary : theme.guide,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: isUser ? '#FFFFFF' : theme.text,
            },
          ]}
          accessibilityRole="text"
        >
          {turn.content}
        </Text>
      </View>

      {!isUser && turn.citations && turn.citations.length > 0 && bibleRepository && (
        <View style={styles.citations}>
          {turn.citations.map((citation, index) => (
            <CitationCard
              key={`${citation.book}-${citation.chapter}-${citation.verse}-${index}`}
              citation={citation}
              bibleRepository={bibleRepository}
            />
          ))}
        </View>
      )}

      {!isUser && turn.suggestions && turn.suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {turn.suggestions.map((suggestion, index) => (
            <View
              key={index}
              style={[styles.suggestion, { borderColor: theme.border }]}
              accessibilityRole="button"
            >
              <Text style={[styles.suggestionText, { color: theme.textSecondary }]}>
                {suggestion.text}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  message: {
    padding: spacing.md,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  guideMessage: {
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.body,
  },
  citations: {
    marginTop: spacing.sm,
    paddingLeft: spacing.md,
  },
  suggestions: {
    marginTop: spacing.sm,
    paddingLeft: spacing.md,
  },
  suggestion: {
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  suggestionText: {
    ...typography.bodySmall,
  },
});
