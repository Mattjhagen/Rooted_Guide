import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { getTheme, spacing, typography } from '@/ui/theme';
import { GuideState } from '@/features/guide/guideStateMachine';

interface ComposerProps {
  onSubmit: (text: string) => void;
  onDraftChange?: (draft: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  state?: GuideState;
  initialDraft?: string;
}

export function Composer({
  onSubmit,
  onDraftChange,
  disabled,
  placeholder,
  autoFocus = false,
  state,
  initialDraft,
}: ComposerProps) {
  const [text, setText] = useState(initialDraft || '');
  const inputRef = useRef<TextInput>(null);
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Delay focus to ensure keyboard animation is smooth
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onDraftChange?.(newText);
  };

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
      setText('');
      onDraftChange?.('');
    }
  };

  const isSubmitting = state?.type === 'submitting' || state?.type === 'responding';
  const canSend = text.trim() && !disabled && !isSubmitting;

  // Announce state changes for screen readers
  useEffect(() => {
    if (state?.type === 'responding') {
      AccessibilityInfo.announceForAccessibility('Plumb Line is responding');
    } else if (state?.type === 'completed') {
      AccessibilityInfo.announceForAccessibility('Response received');
    } else if (state?.type === 'error') {
      AccessibilityInfo.announceForAccessibility(`Error: ${state.message}`);
    }
  }, [state]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}
    >
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.background,
            borderColor: theme.border,
          },
        ]}
        value={text}
        onChangeText={handleTextChange}
        placeholder={placeholder || "What's on your heart?"}
        placeholderTextColor={theme.textTertiary}
        multiline
        maxLength={1000}
        editable={!disabled && !isSubmitting}
        accessibilityLabel="Message input"
        accessibilityHint="Type your thoughts, questions, or feelings"
        accessibilityValue={{ text: text || 'empty' }}
        returnKeyType="default"
        blurOnSubmit={false}
      />
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: canSend ? theme.primary : theme.border,
          },
        ]}
        onPress={handleSubmit}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel={isSubmitting ? 'Sending message' : 'Send message'}
        accessibilityState={{ disabled: !canSend }}
      >
        <Text style={[styles.buttonText, { color: canSend ? '#FFFFFF' : theme.textTertiary }]}>
          {isSubmitting ? 'Sending...' : 'Send'}
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
