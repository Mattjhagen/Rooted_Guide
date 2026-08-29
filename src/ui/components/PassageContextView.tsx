import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Modal,
  AccessibilityInfo,
} from 'react-native';
import { ScriptureCitation } from '@/domain/models';
import { BibleRepository } from '@/domain/repositories';
import { formatVerseRef } from '@/domain/models/VerseRef';
import { getTheme, spacing, typography } from '@/ui/theme';

interface PassageContextViewProps {
  citation: ScriptureCitation;
  bibleRepository: BibleRepository;
  visible: boolean;
  onClose: () => void;
}

/**
 * Minimal passage context view for Prompt 4
 *
 * Shows the cited verse plus surrounding context (3 verses before and after).
 * This is NOT the full reader experience (that's Prompt 7).
 */
export function PassageContextView({
  citation,
  bibleRepository,
  visible,
  onClose,
}: PassageContextViewProps) {
  const [verses, setVerses] = useState<{ verse: number; text: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  useEffect(() => {
    if (!visible) return;

    async function loadContext() {
      setLoading(true);
      try {
        const contextVerses = [];
        // Load 3 verses before and after for context
        const startVerse = Math.max(1, citation.verse - 3);
        const endVerse = citation.verse + 3;

        for (let v = startVerse; v <= endVerse; v++) {
          const verse = await bibleRepository.getVerse({
            book: citation.book,
            chapter: citation.chapter,
            verse: v,
          });
          if (verse) {
            contextVerses.push({ verse: v, text: verse.text });
          }
        }

        setVerses(contextVerses);

        // Announce loaded content for screen readers
        AccessibilityInfo.announceForAccessibility(
          `Passage context loaded: ${contextVerses.length} verses`
        );
      } catch (error) {
        console.error('Failed to load passage context:', error);
        setVerses([]);
      } finally {
        setLoading(false);
      }
    }

    loadContext();
  }, [visible, citation, bibleRepository]);

  const ref = formatVerseRef({
    book: citation.book,
    chapter: citation.chapter,
    verse: citation.verse,
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]} accessibilityRole="header">
            {ref}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close passage context"
            accessibilityHint="Dismiss and return to conversation"
          >
            <Text style={[styles.closeButtonText, { color: theme.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          accessibilityRole="scrollbar"
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading passage...
              </Text>
            </View>
          ) : verses.length > 0 ? (
            verses.map(({ verse, text }) => (
              <View
                key={verse}
                style={[
                  styles.verseContainer,
                  verse === citation.verse && {
                    backgroundColor: theme.citation,
                    borderLeftColor: theme.primary,
                    borderLeftWidth: 3,
                  },
                ]}
                accessibilityRole="text"
                accessibilityLabel={`Verse ${verse}${verse === citation.verse ? ', highlighted' : ''}`}
              >
                <Text style={[styles.verseNumber, { color: theme.textSecondary }]}>{verse}</Text>
                <Text style={[styles.verseText, { color: theme.text }]}>{text}</Text>
              </View>
            ))
          ) : (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.textSecondary }]}>
                Could not load passage context
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            World English Bible
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...typography.title,
  },
  closeButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.label,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  verseNumber: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginRight: spacing.md,
    marginTop: 2,
    minWidth: 24,
  },
  verseText: {
    ...typography.body,
    flex: 1,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  errorText: {
    ...typography.body,
    fontStyle: 'italic',
  },
  footer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...typography.bodySmall,
  },
});
