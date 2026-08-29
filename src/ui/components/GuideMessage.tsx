import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { GuideTurn } from '@/domain/models';
import { BibleRepository } from '@/domain/repositories';
import { getTheme, spacing, typography } from '@/ui/theme';
import { CitationCard } from './CitationCard';

interface GuideMessageProps {
  turn: GuideTurn;
  bibleRepository?: BibleRepository;
  onSuggestionPress?: (suggestionText: string) => void;
}

export function GuideMessage({ turn, bibleRepository, onSuggestionPress }: GuideMessageProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  const isUser = turn.role === 'user';

  return (
    <View style={styles.container}>
      {!isUser && (
        <Text style={[styles.roleLabel, { color: theme.textTertiary }]} accessibilityRole="text">
          Plumb Line
        </Text>
      )}

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
          accessibilityLabel={isUser ? 'Your message' : 'Plumb Line response'}
        >
          {turn.content}
        </Text>
      </View>

      {!isUser && turn.citations && turn.citations.length > 0 && bibleRepository && (
        <View
          style={styles.citations}
          accessibilityRole="list"
          accessibilityLabel="Scripture citations"
        >
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
            <TouchableOpacity
              key={index}
              style={styles.suggestionLink}
              onPress={() => onSuggestionPress?.(suggestion.text)}
              accessibilityRole="button"
              accessibilityLabel={suggestion.text}
              accessibilityHint="Optional: continue reflecting on this passage"
            >
              <Text style={[styles.suggestionLinkText, { color: theme.textTertiary }]}>
                {suggestion.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  roleLabel: {
    ...typography.bodySmall,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
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
    lineHeight: 24,
  },
  citations: {
    marginTop: spacing.md,
  },
  suggestions: {
    marginTop: spacing.lg,
    alignItems: 'flex-start',
  },
  suggestionLink: {
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  suggestionLinkText: {
    ...typography.bodySmall,
    fontSize: 14,
  },
});
