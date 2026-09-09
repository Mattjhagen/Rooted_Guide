import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpenIcon, BookmarkIcon } from '@/ui/components/FallbackIcons';
import { useDailyPath } from '@/features/dailyPath/useDailyPath';
import { formatTimeRemaining } from '@/features/dailyPath/formatTimeRemaining';
import { DAILY_PATH_MODULES, getModuleIndex } from '@/domain/models/DailyPath';
import { PassageView } from '@/ui/components/PassageView';
import { TODAYS_PASSAGE } from '@/domain/models/TodaysPassage';
import { getTheme, spacing, typography } from '@/ui/theme';
import { ForTodaySummaryScreen } from './ForTodaySummaryScreen';
import { useUserDatabase } from '@/infrastructure/persistence/useUserDatabase';
import { PlumbLineLogo } from '@/ui/components/PlumbLineLogo';
import { TypewriterText } from '@/ui/components/TypewriterText';

import { IntakeQuestionnaireScreen } from './IntakeQuestionnaireScreen';
import { GoogleAuthScreen } from './GoogleAuthScreen';
import { generateAdaptivePlan, GeneratedPlan } from '@/features/dailyPath/AdaptivePlanEngine';
import { UserIntakeAnswers } from '@/domain/models/IntakeQuestionnaire';

export function DailyPathScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const router = useRouter();
  const { preferencesRepository } = useUserDatabase();
  const {
    session,
    currentModule,
    draft,
    updateDraft,
    loading,
    completeModule,
    isComplete,
    isLocked,
    timeUntilUnlock,
    startFromBeginning,
  } = useDailyPath();
  const [showForTodaySummary, setShowForTodaySummary] = React.useState(false);
  const [arriveResponse, setArriveResponse] = React.useState<string>('');
  const [lastReadRef, setLastReadRef] = React.useState<string | null>(null);
  const [hasStarted, setHasStarted] = React.useState(true);
  const [showIntake, setShowIntake] = React.useState(false);
  const [showAuth, setShowAuth] = React.useState(false);
  const [intakeUserName, setIntakeUserName] = React.useState<string | undefined>(undefined);
  const [pendingPlan, setPendingPlan] = React.useState<GeneratedPlan | null>(null);
  const [adaptivePlan, setAdaptivePlan] = React.useState<GeneratedPlan | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(24)).current;

  const triggerEntranceAnimation = React.useCallback(() => {
    fadeAnim.setValue(0);
    slideUpAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideUpAnim]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideUpAnim.setValue(24);
  }, [currentModule, fadeAnim, slideUpAnim]);

  const currentModuleData = DAILY_PATH_MODULES.find((m) => m.type === currentModule);
  const moduleIndex = getModuleIndex(currentModule);
  const progress = ((moduleIndex + 1) / DAILY_PATH_MODULES.length) * 100;

  const hasInProgressSession = session && session.lastModule && !isComplete;

  // Load last reading position
  React.useEffect(() => {
    async function loadLastRead() {
      try {
        const prefs = await preferencesRepository.getReaderPreferences();
        setLastReadRef(prefs.lastReadRef);
      } catch (error) {
        console.error('Failed to load reading position:', error);
      }
    }
    if (isComplete || isLocked) {
      loadLastRead();
    }
  }, [isComplete, isLocked, preferencesRepository]);

  // Show "For Today" summary after completing arrive module
  const shouldShowSummary = showForTodaySummary && currentModule === 'read' && arriveResponse;

  const handleSummaryContinue = () => {
    setShowForTodaySummary(false);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}
      >
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleContinueReading = () => {
    if (lastReadRef) {
      const match = lastReadRef.match(/^(.+)\s(\d+)$/);
      if (match) {
        const [, book, chapter] = match;
        router.push(`/reader?book=${encodeURIComponent(book)}&chapter=${chapter}`);
      } else {
        router.push('/browse');
      }
    } else {
      router.push('/browse');
    }
  };

  // Completion state (with optional 12-hour gate)
  if (isComplete || isLocked) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}
      >
        <ScrollView contentContainerStyle={styles.completeContent}>
          <View style={styles.completeState}>
            <Text style={[styles.completeTitle, { color: theme.text }]}>Path complete</Text>

            {isLocked && timeUntilUnlock ? (
              <>
                <Text style={[styles.completeMessage, { color: theme.textSecondary }]}>
                  A new practice opens in {formatTimeRemaining(timeUntilUnlock)}.
                </Text>
                <Text style={[styles.completeMessage, { color: theme.textSecondary }]}>
                  Until then, continue in Scripture.
                </Text>
              </>
            ) : (
              <Text style={[styles.completeMessage, { color: theme.textSecondary }]}>
                You've completed today's practice.
              </Text>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={handleContinueReading}
            >
              <Text style={styles.primaryButtonText}>Continue reading</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show "For Today" summary
  if (shouldShowSummary) {
    return (
      <ForTodaySummaryScreen arriveResponse={arriveResponse} onContinue={handleSummaryContinue} />
    );
  }

  const handleIntakeComplete = (answers: UserIntakeAnswers) => {
    const plan = generateAdaptivePlan(answers);
    setPendingPlan(plan);
    setIntakeUserName(answers.userName);
    setShowIntake(false);
    setShowAuth(true);
  };

  const handleAuthComplete = () => {
    if (pendingPlan) {
      setAdaptivePlan(pendingPlan);
    }
    setShowAuth(false);
    setHasStarted(true);
  };

  // 3-Question Intake Questionnaire
  if (showIntake) {
    return <IntakeQuestionnaireScreen onComplete={handleIntakeComplete} />;
  }

  // Google Sign-In step after opening questions
  if (showAuth) {
    return <GoogleAuthScreen userName={intakeUserName} onComplete={handleAuthComplete} />;
  }

  // Before practice: show simple "Begin today's path"
  if (!hasStarted && currentModule === 'arrive' && !draft && !hasInProgressSession) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}
      >
        <ScrollView contentContainerStyle={styles.completeContent}>
          <View style={styles.completeState}>
            <Text style={[styles.completeTitle, { color: theme.text }]}>Today's path</Text>
            <Text style={[styles.completeMessage, { color: theme.textSecondary }]}>
              A 15-minute guided journey into Scripture.
            </Text>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShowIntake(true);
              }}
            >
              <Text style={styles.primaryButtonText}>Begin today's path</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const handleNext = async () => {
    if (!currentModuleData) return;

    // Special handling for arrive module - show summary before continuing
    if (currentModuleData.type === 'arrive') {
      setArriveResponse(draft);
      await completeModule(currentModuleData.type, draft);
      setShowForTodaySummary(true);
      return;
    }

    await completeModule(currentModuleData.type, draft);
  };

  const getModulePrompt = () => {
    if (adaptivePlan) {
      if (currentModule === 'arrive') return adaptivePlan.arrivePrompt;
      if (currentModule === 'reflect') return adaptivePlan.reflectPrompt;
      if (currentModule === 'respond') return adaptivePlan.respondPrompt;
    }
    return currentModuleData?.prompt;
  };

  // During practice: show module with progress
  return (
    <SafeAreaView
      style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}
      edges={['top']}
    >
      {/* Top Header Navigation */}
      <View style={styles.topHeaderNav}>
        <TouchableOpacity
          onPress={() => router.push('/saved')}
          style={styles.headerIconButton}
          accessibilityLabel="Open saved collection"
        >
          <BookmarkIcon size={22} color={theme.textSecondary} />
        </TouchableOpacity>

        <View style={styles.brandHeaderGroup}>
          <PlumbLineLogo size={18} />
          <Text style={[styles.brandTitle, { color: theme.textSecondary }]}>PLUMB LINE</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/browse')}
          style={styles.headerIconButton}
          accessibilityLabel="Open Bible reader"
        >
          <BookOpenIcon size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.moduleContent}>
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: theme.primary, width: `${progress}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.textTertiary }]}>
              {moduleIndex + 1} of {DAILY_PATH_MODULES.length}
            </Text>
          </View>

          {/* Module title and prompt */}
          <View style={styles.moduleHeader}>
            <Text style={[styles.moduleTitle, { color: theme.text }]}>
              {currentModuleData?.title}
            </Text>
            {currentModule !== 'read' ? (
              <TypewriterText
                key={`prompt-${currentModule}`}
                text={getModulePrompt() || ''}
                speed={22}
                style={[styles.modulePrompt, { color: theme.textSecondary }]}
                onComplete={triggerEntranceAnimation}
              />
            ) : (
              <Text style={[styles.modulePrompt, { color: theme.textSecondary }]}>
                {getModulePrompt()}
              </Text>
            )}
          </View>

          {/* Show passage on "read" module with Typewriter */}
          {currentModule === 'read' && (
            <View style={styles.passageContainer}>
              {adaptivePlan && (
                <View
                  style={[
                    styles.planBadge,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <Text style={[styles.planBadgeTitle, { color: theme.text }]}>
                    {adaptivePlan.title}
                  </Text>
                  <Text style={[styles.planBadgeSub, { color: theme.textSecondary }]}>
                    {adaptivePlan.subtitle}
                  </Text>
                </View>
              )}
              <PassageView
                passageRef={adaptivePlan ? adaptivePlan.passageRef : TODAYS_PASSAGE.ref}
                enableTypewriter={true}
                onTypewriterComplete={triggerEntranceAnimation}
              />
            </View>
          )}

          {/* Animated entrance for response input */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }}
          >
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
              placeholder={currentModuleData?.placeholder}
              placeholderTextColor={theme.textTertiary}
              value={draft}
              onChangeText={updateDraft}
              multiline
              textAlignVertical="top"
              autoFocus={currentModule !== 'read'}
            />
          </Animated.View>
        </ScrollView>

        {/* Continue button - fixed at bottom with animated entrance */}
        <SafeAreaView
          style={[
            styles.footer,
            { backgroundColor: theme.background, borderTopColor: theme.border },
          ]}
          edges={['bottom']}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }}
          >
            <TouchableOpacity
              style={[
                styles.footerButton,
                { backgroundColor: draft.trim() ? theme.primary : theme.border },
              ]}
              onPress={handleNext}
              disabled={!draft.trim()}
            >
              <Text
                style={[
                  styles.footerButtonText,
                  { color: draft.trim() ? '#FFFFFF' : theme.textTertiary },
                ]}
              >
                {moduleIndex === DAILY_PATH_MODULES.length - 1 ? 'Complete' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
  },
  completeContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  completeState: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  completeTitle: {
    ...typography.display,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  completeMessage: {
    ...typography.bodyLarge,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 400,
  },
  topHeaderNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerIconButton: {
    padding: spacing.xs,
  },
  brandHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandTitle: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  primaryButtonText: {
    ...typography.body,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    fontSize: 17,
    fontWeight: '600',
  },
  moduleContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  progressText: {
    ...typography.caption,
    fontSize: 12,
    textAlign: 'right',
  },
  moduleHeader: {
    marginBottom: spacing.xl,
  },
  moduleTitle: {
    ...typography.display,
    fontSize: 32,
    marginBottom: spacing.md,
  },
  modulePrompt: {
    ...typography.bodyLarge,
    lineHeight: 28,
  },
  passageContainer: {
    marginBottom: spacing.xl,
  },
  planBadge: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  planBadgeTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
  },
  planBadgeSub: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    ...typography.body,
    minHeight: 160,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  footerButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    ...typography.body,
    fontSize: 17,
    fontWeight: '600',
  },
});
