import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { getTheme, spacing, typography } from '@/ui/theme';

interface ComposerProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function Composer({ onSubmit, disabled, placeholder }: ComposerProps) {
  const [text, setText] = useState('');
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.background,
            borderColor: theme.border,
          },
        ]}
        value={text}
        onChangeText={setText}
        placeholder={placeholder || "What's on your heart?"}
        placeholderTextColor={theme.textTertiary}
        multiline
        maxLength={1000}
        editable={!disabled}
        accessibilityLabel="Message input"
        accessibilityHint="Type your thoughts, questions, or feelings"
      />
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: text.trim() && !disabled ? theme.primary : theme.border,
          },
        ]}
        onPress={handleSubmit}
        disabled={!text.trim() || disabled}
        accessibilityLabel="Send message"
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.buttonText,
            { color: text.trim() && !disabled ? '#FFFFFF' : theme.textTertiary },
          ]}
        >
          Send
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        paddingBottom: spacing.lg,
      },
      android: {
        paddingBottom: spacing.md,
      },
    }),
  },
  input: {
    ...typography.body,
    minHeight: 80,
    maxHeight: 160,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    textAlignVertical: 'top',
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  buttonText: {
    ...typography.label,
  },
});
