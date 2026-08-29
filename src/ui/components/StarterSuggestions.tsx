import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  AccessibilityInfo,
} from 'react-native';
import { getTheme, spacing, typography } from '@/ui/theme';

interface StarterSuggestion {
  id: string;
  text: string;
  accessibilityHint: string;
}

const STARTERS: StarterSuggestion[] = [
  {
    id: 'feeling',
    text: "Share what you're feeling",
    accessibilityHint: 'Tap to share your current feelings',
  },
  {
    id: 'question',
    text: 'Ask a question about faith',
    accessibilityHint: 'Tap to ask a question',
  },
  {
    id: 'scripture',
    text: 'Explore a Bible passage',
    accessibilityHint: 'Tap to explore Scripture',
  },
];

interface StarterSuggestionsProps {
  onSelect: (text: string) => void;
}

export function StarterSuggestions({ onSelect }: StarterSuggestionsProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  const handleSelect = (text: string) => {
    // Announce selection for screen readers
    AccessibilityInfo.announceForAccessibility(`Selected: ${text}`);
    onSelect(text);
  };

  return (
    <View
      style={styles.container}
      accessibilityRole="list"
      accessibilityLabel="Starter suggestions"
    >
      {STARTERS.map((starter) => (
        <TouchableOpacity
          key={starter.id}
          style={[
            styles.suggestion,
            {
              borderColor: theme.border,
              backgroundColor: theme.surface,
            },
          ]}
          onPress={() => handleSelect(starter.text)}
          accessibilityRole="button"
          accessibilityLabel={starter.text}
          accessibilityHint={starter.accessibilityHint}
        >
          <Text style={[styles.suggestionText, { color: theme.textSecondary }]}>
            {starter.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  suggestion: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  suggestionText: {
    ...typography.body,
    textAlign: 'center',
  },
});
