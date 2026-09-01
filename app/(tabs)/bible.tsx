import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BibleBrowserScreen } from '@/ui/screens';
import { useUserDatabase } from '@/infrastructure/persistence/useUserDatabase';
import { ChevronRight } from 'lucide-react-native';
import { spacing, typography, getTheme } from '@/ui/theme';

/**
 * Bible Tab
 *
 * Main entry point for Bible reading.
 * Shows "Continue reading" if user has a last read position,
 * otherwise shows the book browser.
 */
export default function BibleTab() {
  const router = useRouter();
  const scheme = useColorScheme();
  const { preferencesRepository } = useUserDatabase();
  const [lastReadRef, setLastReadRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLastRead() {
      try {
        const prefs = await preferencesRepository.getReaderPreferences();
        setLastReadRef(prefs.lastReadRef);
      } catch (error) {
        console.error('Failed to load last read position:', error);
      } finally {
        setLoading(false);
      }
    }

    loadLastRead();
  }, [preferencesRepository]);

  const handleContinueReading = () => {
    if (lastReadRef) {
      // Parse the lastReadRef (e.g., "Genesis 1" -> book: "Genesis", chapter: 1)
      const match = lastReadRef.match(/^(.+)\s(\d+)$/);
      if (match) {
        const [, book, chapter] = match;
        router.push(`/reader?book=${encodeURIComponent(book)}&chapter=${chapter}`);
      }
    }
  };

  if (loading) {
    return <BibleBrowserScreen />;
  }

  if (!lastReadRef) {
    return <BibleBrowserScreen />;
  }

  // Show "Continue reading" card above the browser
  const theme = getTheme(scheme);
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top']}
      >
        <View style={styles.continueContainer}>
          <TouchableOpacity
            style={[
              styles.continueCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={handleContinueReading}
          >
            <View style={styles.continueContent}>
              <Text style={[styles.continueLabel, { color: theme.textSecondary }]}>
                Continue reading
              </Text>
              <Text style={[styles.continueRef, { color: theme.text }]}>{lastReadRef}</Text>
            </View>
            <ChevronRight size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <BibleBrowserScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  continueContainer: {
    marginBottom: spacing.md,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  continueContent: {
    flex: 1,
  },
  continueLabel: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  continueRef: {
    ...typography.title,
    fontSize: 18,
    fontWeight: '600',
  },
});
