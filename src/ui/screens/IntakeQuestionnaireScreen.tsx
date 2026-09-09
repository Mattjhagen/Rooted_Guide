import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  INTAKE_QUESTIONS,
  UserIntakeAnswers,
  SeasonFocus,
  ReadingDepth,
  ScriptureGenre,
} from '@/domain/models/IntakeQuestionnaire';
import { getTheme, spacing, typography } from '@/ui/theme';

interface IntakeQuestionnaireScreenProps {
  onComplete: (answers: UserIntakeAnswers) => void;
}

export function IntakeQuestionnaireScreen({ onComplete }: IntakeQuestionnaireScreenProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  const [currentStep, setCurrentStep] = useState(0);
  const [focus, setFocus] = useState<SeasonFocus | null>(null);
  const [depth, setDepth] = useState<ReadingDepth | null>(null);
  const [genre, setGenre] = useState<ScriptureGenre | null>(null);

  const question = INTAKE_QUESTIONS[currentStep];

  const getSelectedValue = () => {
    switch (currentStep) {
      case 0:
        return focus;
      case 1:
        return depth;
      case 2:
        return genre;
      default:
        return null;
    }
  };

  const handleSelectOption = (value: any) => {
    switch (currentStep) {
      case 0:
        setFocus(value as SeasonFocus);
        break;
      case 1:
        setDepth(value as ReadingDepth);
        break;
      case 2:
        setGenre(value as ScriptureGenre);
        break;
    }
  };

  const handleNextStep = () => {
    if (currentStep < INTAKE_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      if (focus && depth && genre) {
        onComplete({ focus, depth, genre });
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const selectedValue = getSelectedValue();
  const progressPercent = ((currentStep + 1) / INTAKE_QUESTIONS.length) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress header */}
      <View style={styles.header}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: theme.primary, width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text style={[styles.stepText, { color: theme.textSecondary }]}>
          Question {currentStep + 1} of {INTAKE_QUESTIONS.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={[styles.questionTitle, { color: theme.text }]}>{question.title}</Text>
          <Text style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
            {question.subtitle}
          </Text>
        </View>

        <View style={styles.optionsList}>
          {question.options.map((opt) => {
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
                    isSelected && { fontWeight: '700' },
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

      {/* Navigation Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        {currentStep > 0 ? (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.border }]}
            onPress={handlePreviousStep}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

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
            {currentStep === INTAKE_QUESTIONS.length - 1 ? 'Generate My Plan' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  stepText: {
    ...typography.caption,
    fontSize: 12,
    textAlign: 'right',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xl,
  },
  questionContainer: {
    gap: spacing.xs,
  },
  questionTitle: {
    ...typography.display,
    fontSize: 28,
  },
  questionSubtitle: {
    ...typography.bodyLarge,
    fontSize: 16,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  optionLabel: {
    ...typography.body,
    fontSize: 17,
    fontWeight: '600',
  },
  optionDescription: {
    ...typography.caption,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  primaryButton: {
    flex: 2,
    height: 52,
    borderRadius: 12,
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
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '500',
  },
});
