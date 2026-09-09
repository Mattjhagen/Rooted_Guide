import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBibleRepository } from '@/infrastructure/scripture/useBibleRepository';
import { getVerseOfTheDay, formatVerseReference } from '@/domain/services/VerseOfTheDay';
import { PassageRef } from '@/domain/models/VerseRef';
import { Verse } from '@/domain/models';
import { spacing, typography, getTheme } from '@/ui/theme';

interface LaunchScreenProps {
  onContinue: () => void;
}

/**
 * LaunchScreen displays a verse of the day with a calm animation
 *
 * Shows once per cold app launch before routing to onboarding or main screen.
 */
export function LaunchScreen({ onContinue }: LaunchScreenProps) {
  const bibleRepository = useBibleRepository();
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  const [verseRef, setVerseRef] = useState<PassageRef | null>(null);
  const [verseText, setVerseText] = useState<string>('');
  const [showContinue, setShowContinue] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const animationProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check accessibility preferences
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    async function loadVerse() {
      try {
        const todayVerse = getVerseOfTheDay();
        setVerseRef(todayVerse);

        // Load verse text from local Bible
        const verses: Verse[] = await bibleRepository.getPassage(todayVerse);

        if (verses.length > 0) {
          const text = verses.map((v) => v.text).join(' ');
          setVerseText(text);
        } else {
          // Fallback to local default verse
          loadFallbackVerse();
        }
      } catch (error) {
        console.error('Failed to load verse of the day:', error);
        loadFallbackVerse();
      }
    }

    async function loadFallbackVerse() {
      // Fallback: John 3:16
      const fallbackRef: PassageRef = {
        book: 'John',
        chapter: 3,
        verseStart: 16,
        verseEnd: 16,
      };
      setVerseRef(fallbackRef);

      try {
        const verses = await bibleRepository.getPassage(fallbackRef);
        if (verses.length > 0) {
          setVerseText(verses[0].text);
        }
      } catch {
        // Ultimate fallback text
        setVerseText(
          'For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.'
        );
      }
    }

    loadVerse();
  }, [bibleRepository]);

  useEffect(() => {
    if (!verseText) return;

    // Start line animation after content loads
    const animationDuration = reduceMotion ? 0 : 2000;

    Animated.timing(animationProgress, {
      toValue: 1,
      duration: animationDuration,
      useNativeDriver: false,
    }).start(() => {
      // Show Continue button after animation completes
      setShowContinue(true);
    });

    // Fallback: show Continue button after 2 seconds regardless
    const fallbackTimer = setTimeout(() => {
      setShowContinue(true);
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [verseText, animationProgress, reduceMotion]);

  const lineWidth = animationProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Brand header */}
        <View style={styles.brandHeader}>
          <View style={[styles.plumbIndicator, { backgroundColor: theme.primary }]} />
          <Text style={[styles.brandTitle, { color: theme.textSecondary }]}>PLUMB LINE</Text>
        </View>

        {/* Animated line */}
        <View style={[styles.lineContainer, { backgroundColor: theme.border }]}>
          <Animated.View
            style={[styles.line, { width: lineWidth, backgroundColor: theme.primary }]}
          />
        </View>

        {/* Verse content */}
        <View style={styles.verseContainer}>
          <Text style={[styles.label, { color: theme.textTertiary }]}>Verse of the Day</Text>

          {verseRef && (
            <Text style={[styles.reference, { color: theme.text }]} accessibilityRole="header">
              {formatVerseReference(verseRef)}
            </Text>
          )}

          {verseText ? (
            <Text style={[styles.verseText, { color: theme.text }]}>{verseText}</Text>
          ) : (
            <Text style={[styles.loading, { color: theme.textTertiary }]}>Loading...</Text>
          )}
        </View>

        {/* Continue button */}
        {showContinue && (
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: theme.text, borderColor: theme.border },
            ]}
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue to app"
          >
            <Text style={[styles.continueText, { color: theme.background }]}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  plumbIndicator: {
    width: 2,
    height: 14,
    borderRadius: 1,
  },
  brandTitle: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  lineContainer: {
    height: 1,
    marginBottom: spacing.xl * 2,
    overflow: 'hidden',
  },
  line: {
    height: 1,
  },
  verseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  label: {
    ...typography.caption,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  reference: {
    ...typography.title,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  verseText: {
    ...typography.body,
    fontSize: 17,
    lineHeight: 28,
    textAlign: 'center',
    maxWidth: 480,
  },
  loading: {
    ...typography.body,
    fontSize: 17,
  },
  continueButton: {
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignSelf: 'center',
    borderRadius: 26,
    minWidth: 180,
    borderWidth: 1,
  },
  continueText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
