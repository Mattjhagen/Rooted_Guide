import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useBibleRepository } from '@/infrastructure/scripture/useBibleRepository';
import { useUserDatabase } from '@/infrastructure/persistence/useUserDatabase';
import { PassageRef } from '@/domain/models/VerseRef';
import { Verse, HighlightColor } from '@/domain/models';
import { getTheme, spacing, typography } from '@/ui/theme';
import { VerseActions } from './VerseActions';

import { TypewriterText } from './TypewriterText';

interface PassageViewProps {
  passageRef: PassageRef;
  onVersePress?: (verse: Verse) => void;
  enableTypewriter?: boolean;
  onTypewriterComplete?: () => void;
}

interface VerseState {
  isBookmarked: boolean;
  highlightColor?: HighlightColor;
}

export function PassageView({
  passageRef,
  onVersePress,
  enableTypewriter,
  onTypewriterComplete,
}: PassageViewProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const bibleRepository = useBibleRepository();
  const { bookmarkRepository, highlightRepository } = useUserDatabase();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [verseStates, setVerseStates] = useState<Map<string, VerseState>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  const loadVerseStates = React.useCallback(
    async (verseList: Verse[]) => {
      const states = new Map<string, VerseState>();
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
    async function loadPassage() {
      try {
        const result = await bibleRepository.getPassage(passageRef);
        setVerses(result);
        await loadVerseStates(result);
      } catch (error) {
        console.error('Failed to load passage:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPassage();
  }, [bibleRepository, bookmarkRepository, highlightRepository, passageRef, loadVerseStates]);

  const handleActionComplete = React.useCallback(async () => {
    // Refresh verse states after action
    if (verses.length > 0) {
      await loadVerseStates(verses);
    }
  }, [verses, loadVerseStates]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loading, { color: theme.textSecondary }]}>Loading passage...</Text>
      </View>
    );
  }

  if (verses.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.error, { color: theme.textSecondary }]}>Passage not found</Text>
      </View>
    );
  }

  if (enableTypewriter) {
    const fullText = verses.map((v) => `${v.ref.verse}. ${v.text}`).join('\n\n');
    return (
      <View style={styles.container}>
        <Text style={[styles.reference, { color: theme.textSecondary }]}>
          {passageRef.book} {passageRef.chapter}:{passageRef.verseStart}
          {passageRef.verseEnd > passageRef.verseStart && `-${passageRef.verseEnd}`}
        </Text>
        <TypewriterText
          text={fullText}
          speed={20}
          style={[styles.verseText, { color: theme.text }]}
          onComplete={onTypewriterComplete}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.reference, { color: theme.textSecondary }]}>
        {passageRef.book} {passageRef.chapter}:{passageRef.verseStart}
        {passageRef.verseEnd > passageRef.verseStart && `-${passageRef.verseEnd}`}
      </Text>

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
              onPress={() => {
                if (onVersePress) {
                  onVersePress(verse);
                } else {
                  setSelectedVerse(verse);
                }
              }}
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

      {/* Verse actions modal */}
      {selectedVerse && (
        <VerseActions
          verse={selectedVerse}
          visible={!!selectedVerse}
          onClose={() => setSelectedVerse(null)}
          onActionComplete={handleActionComplete}
        />
      )}
    </View>
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
    paddingVertical: spacing.md,
  },
  loading: {
    ...typography.body,
    textAlign: 'center',
  },
  error: {
    ...typography.body,
    textAlign: 'center',
  },
  reference: {
    ...typography.caption,
    marginBottom: spacing.md,
    fontWeight: '600',
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
    minWidth: 24,
  },
  verseNumber: {
    ...typography.caption,
    fontWeight: '600',
  },
  bookmarkIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  verseText: {
    ...typography.body,
    flex: 1,
    lineHeight: 24,
  },
});
