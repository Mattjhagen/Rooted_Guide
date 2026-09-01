import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TODAYS_PASSAGE } from '@/domain/models/TodaysPassage';
import { createGuideGateway, getGuideConfig } from '@/infrastructure/config/guideConfig';
import { useBibleRepository } from '@/infrastructure/scripture/useBibleRepository';
import { getTheme, spacing, typography } from '@/ui/theme';

interface ForTodaySummaryProps {
  arriveResponse: string;
  onContinue: () => void;
  onAskQuestion?: () => void;
}

export function ForTodaySummaryScreen({
  arriveResponse,
  onContinue,
  onAskQuestion,
}: ForTodaySummaryProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const bibleRepository = useBibleRepository();
  const [summary, setSummary] = useState<string>('');
  const [invitation, setInvitation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [guideAvailable, setGuideAvailable] = useState(false);

  useEffect(() => {
    async function generateSummary() {
      try {
        const config = getGuideConfig();
        setGuideAvailable(config.isAvailable);

        if (config.isAvailable) {
          // Use guide service for personalized summary
          const gateway = createGuideGateway(bibleRepository);
          if (gateway) {
            try {
              const response = await gateway.sendMessage({
                userInput: `Create a brief, warm summary for today's Scripture time. The person shared: "${arriveResponse}". Keep it to 2-3 sentences, non-diagnostic, and Scripture-centered. Then offer a brief invitation related to today's passage: ${TODAYS_PASSAGE.ref.book} ${TODAYS_PASSAGE.ref.chapter}:${TODAYS_PASSAGE.ref.verseStart}-${TODAYS_PASSAGE.ref.verseEnd}.`,
                context: {
                  previousTurns: [],
                },
              });

              if (response.text) {
                // Split response into summary and invitation
                const parts = response.text.split('\n\n');
                setSummary(parts[0] || response.text);
                setInvitation(parts[1] || '');
              }
            } catch (error) {
              console.error('Guide service error:', error);
              // Fall through to local fallback
              setGuideAvailable(false);
            }
          }
        }

        if (!config.isAvailable || !guideAvailable) {
          // Local fallback - warm but not AI-generated
          const localSummary = generateLocalSummary(arriveResponse);
          setSummary(localSummary);
          setInvitation(
            `Today's passage is ${TODAYS_PASSAGE.ref.book} ${TODAYS_PASSAGE.ref.chapter}:${TODAYS_PASSAGE.ref.verseStart}-${TODAYS_PASSAGE.ref.verseEnd}. Take your time reading and notice what speaks to you.`
          );
        }
      } catch (error) {
        console.error('Failed to generate summary:', error);
        // Fallback to simple local summary
        const localSummary = generateLocalSummary(arriveResponse);
        setSummary(localSummary);
        setInvitation(
          `Today's passage is ${TODAYS_PASSAGE.ref.book} ${TODAYS_PASSAGE.ref.chapter}:${TODAYS_PASSAGE.ref.verseStart}-${TODAYS_PASSAGE.ref.verseEnd}. Take your time reading and notice what speaks to you.`
        );
        setGuideAvailable(false);
      } finally {
        setLoading(false);
      }
    }

    generateSummary();
  }, [arriveResponse, bibleRepository, guideAvailable]);

  if (loading) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Preparing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>For today</Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={[styles.summaryText, { color: theme.text }]}>{summary}</Text>
        </View>

        <View style={styles.invitationSection}>
          <Text style={[styles.invitationText, { color: theme.textSecondary }]}>{invitation}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={onContinue}
          >
            <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
              Continue to passage
            </Text>
          </TouchableOpacity>

          {guideAvailable && onAskQuestion && (
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { borderWidth: 1, borderColor: theme.border, backgroundColor: 'transparent' },
              ]}
              onPress={onAskQuestion}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                Ask a question first
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function generateLocalSummary(arriveResponse: string): string {
  // Simple local fallback that reflects what they shared without AI
  const lowerResponse = arriveResponse.toLowerCase();

  if (
    lowerResponse.includes('stress') ||
    lowerResponse.includes('anxious') ||
    lowerResponse.includes('worry')
  ) {
    return "You're bringing some weight into this time. Thank you for being honest about where you are. Let's see what Scripture offers today.";
  }

  if (
    lowerResponse.includes('grateful') ||
    lowerResponse.includes('thankful') ||
    lowerResponse.includes('blessed')
  ) {
    return "You're coming with gratitude. That's a good place to begin. Let's see how today's passage meets that openness.";
  }

  if (lowerResponse.includes('question') || lowerResponse.includes('wondering')) {
    return "You're bringing questions. Good. Scripture often speaks most clearly when we come with honest questions. Let's see what today's passage offers.";
  }

  // Default warm summary
  return "Thank you for taking this time. Whatever you're bringing today, you're welcome here. Let's turn to Scripture together.";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    fontSize: 32,
    textAlign: 'center',
  },
  summarySection: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  summaryText: {
    ...typography.body,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
  invitationSection: {
    marginBottom: spacing.xl * 2,
    paddingHorizontal: spacing.md,
  },
  invitationText: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.body,
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    fontSize: 17,
    fontWeight: '500',
  },
});
