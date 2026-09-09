import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  INTAKE_QUESTIONS,
  UserIntakeAnswers,
  SeasonFocus,
  ReadingDepth,
  ScriptureGenre,
} from '@/domain/models/IntakeQuestionnaire';
import { spacing, typography } from '@/ui/theme';
import { useTheme } from '@/features/preferences/ThemeContext';
import { PlumbLineLogo } from '@/ui/components/PlumbLineLogo';
import { TypewriterText } from '@/ui/components/TypewriterText';

interface IntakeQuestionnaireScreenProps {
  onComplete: (answers: UserIntakeAnswers) => void;
}

export function IntakeQuestionnaireScreen({ onComplete }: IntakeQuestionnaireScreenProps) {
  const { theme } = useTheme();

  // Step 0: Name input
  // Step 1: Season Focus
  // Step 2: Reading Depth
  // Step 3: Scripture Genre
  // Step 4: Personalizing loading state
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [greetingComplete, setGreetingComplete] = useState(false);

  const [focus, setFocus] = useState<SeasonFocus | null>(null);
  const [depth, setDepth] = useState<ReadingDepth | null>(null);
  const [genre, setGenre] = useState<ScriptureGenre | null>(null);

  // Spinner animation for personalizing state
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentStep === 4) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      const timer = setTimeout(() => {
        if (focus && depth && genre) {
          onComplete({
            userName: userName.trim() || undefined,
            focus,
            depth,
            genre,
          });
        }
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [currentStep, focus, depth, genre, userName, onComplete, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleNameSubmit = () => {
    if (userName.trim().length > 0) {
      setNameSubmitted(true);
    }
  };

  const handleSelectOption = (value: any) => {
    if (currentStep === 1) setFocus(value as SeasonFocus);
    if (currentStep === 2) setDepth(value as ReadingDepth);
    if (currentStep === 3) setGenre(value as ScriptureGenre);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 3) {
      // Move to personalizing loading state
      setCurrentStep(4);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const totalSteps = 4; // Name + 3 questions
  const activeProgressStep = nameSubmitted ? currentStep : 0;
  const progressPercent = (activeProgressStep / totalSteps) * 100;

  const getQuestionTitle = () => {
    const displayName = userName.trim() ? `, ${userName.trim()}` : '';
    if (currentStep === 1) return `What is on your heart in this season${displayName}?`;
    if (currentStep === 2) return `How would you like to engage Scripture today?`;
    if (currentStep === 3) return `Where would you like to begin first?`;
    return '';
  };

  const currentQuestionObj =
    currentStep >= 1 && currentStep <= 3 ? INTAKE_QUESTIONS[currentStep - 1] : null;
  const selectedValue =
    currentStep === 1 ? focus : currentStep === 2 ? depth : currentStep === 3 ? genre : null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top', 'bottom']}
    >
      {/* Top Header with Seamless Logo & Progress Line */}
      <View style={styles.headerContainer}>
        <View style={styles.logoBadge}>
          <PlumbLineLogo size={36} />
        </View>
        <View style={[styles.progressBarTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressBarFill,
              { backgroundColor: theme.primary, width: `${progressPercent}%` },
            ]}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Step 0: Conversational Name Input */}
        {currentStep === 0 && !nameSubmitted && (
          <View style={styles.conversationalStep}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.typewriterPromptContainer}>
                <TypewriterText
                  text="Welcome to Plumb Line. To start, what can I call you?"
                  speed={28}
                  style={[styles.serifPromptText, { color: theme.text }]}
                />
              </View>
            </ScrollView>

            <View
              style={[
                styles.nameInputContainer,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
            >
              <TextInput
                style={[styles.nameInput, { color: theme.text }]}
                placeholder="Enter your name..."
                placeholderTextColor={theme.textTertiary}
                value={userName}
                onChangeText={setUserName}
                onSubmitEditing={handleNameSubmit}
                returnKeyType="done"
                autoFocus
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: userName.trim().length > 0 ? theme.primary : theme.border },
                ]}
                disabled={userName.trim().length === 0}
                onPress={handleNameSubmit}
                accessibilityLabel="Submit name"
              >
                <Text style={styles.sendButtonArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 0 Response: Greetings before questions */}
        {currentStep === 0 && nameSubmitted && (
          <View style={styles.conversationalStep}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.typewriterPromptContainer}>
                <TypewriterText
                  text={`Grace and peace to you, ${userName.trim()}! I'm here to support and guide you on your spiritual journey.`}
                  speed={25}
                  style={[styles.serifPromptText, { color: theme.text }]}
                  onComplete={() => setGreetingComplete(true)}
                />
              </View>
            </ScrollView>

            {greetingComplete && (
              <View style={styles.singleFooter}>
                <TouchableOpacity
                  style={[styles.glowingButton, { backgroundColor: theme.primary }]}
                  onPress={() => setCurrentStep(1)}
                  accessibilityLabel="Continue to questionnaire"
                >
                  <Text style={styles.glowingButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Steps 1-3: Question Options */}
        {currentStep >= 1 && currentStep <= 3 && currentQuestionObj && (
          <View style={styles.conversationalStep}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.questionHeader}>
                <Text style={[styles.stepLabel, { color: theme.textTertiary }]}>
                  QUESTION {currentStep} OF 3
                </Text>
                <TypewriterText
                  key={`question-${currentStep}`}
                  text={getQuestionTitle()}
                  speed={22}
                  style={[styles.serifPromptText, { color: theme.text }]}
                />
              </View>

              <View style={styles.optionsList}>
                {currentQuestionObj.options.map((opt) => {
                  const isSelected = selectedValue === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.optionCard,
                        {
                          backgroundColor: isSelected ? theme.surface : theme.background,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => handleSelectOption(opt.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: theme.text },
                          isSelected && { color: theme.primary, fontWeight: '700' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                        {opt.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Footer Navigation */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.border }]}
                onPress={handlePreviousStep}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: selectedValue ? theme.primary : theme.border },
                ]}
                disabled={!selectedValue}
                onPress={handleNextStep}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: selectedValue ? '#FFFFFF' : theme.textTertiary },
                  ]}
                >
                  {currentStep === 3 ? 'Personalize Practice' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 4: Personalizing Loading Screen */}
        {currentStep === 4 && (
          <View style={styles.loadingContainer}>
            <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}>
              <View
                style={[
                  styles.spinnerRing,
                  { borderColor: theme.border, borderTopColor: theme.primary },
                ]}
              />
            </Animated.View>

            <Text style={[styles.loadingTitle, { color: theme.text }]}>
              Personalizing your daily practice
            </Text>
            {userName.trim() ? (
              <Text style={[styles.loadingSub, { color: theme.textSecondary }]}>
                Preparing Scripture guidance for {userName.trim()}...
              </Text>
            ) : null}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  logoBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  progressBarTrack: {
    width: '85%',
    height: 2.5,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  keyboardView: {
    flex: 1,
  },
  conversationalStep: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  typewriterPromptContainer: {
    marginTop: spacing.md,
  },
  serifPromptText: {
    ...typography.display,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '400',
  },
  questionHeader: {
    gap: spacing.xs,
  },
  stepLabel: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 28,
    borderWidth: 1,
  },
  nameInput: {
    ...typography.body,
    flex: 1,
    fontSize: 17,
    paddingVertical: 12,
    paddingHorizontal: spacing.xs,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  optionLabel: {
    ...typography.body,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 18,
    fontWeight: '500',
  },
  optionDescription: {
    ...typography.caption,
    fontSize: 14,
    lineHeight: 20,
  },
  singleFooter: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  glowingButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5E9C76',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  glowingButtonText: {
    ...typography.body,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  primaryButton: {
    flex: 2,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  spinnerContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
  },
  loadingTitle: {
    ...typography.title,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    textAlign: 'center',
  },
  loadingSub: {
    ...typography.body,
    fontSize: 15,
    textAlign: 'center',
  },
});
