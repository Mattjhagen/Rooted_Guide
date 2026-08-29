/**
 * Service unavailable component
 *
 * Gentle, clear message when the guide service is unavailable.
 * Ensures the Scripture path remains fully usable.
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { getTheme, spacing, typography } from '@/ui/theme';

interface ServiceUnavailableProps {
  message?: string;
}

export function ServiceUnavailable({
  message = 'The conversational guide is temporarily unavailable. You can still explore Scripture directly.',
}: ServiceUnavailableProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      accessibilityRole="alert"
    >
      <Text style={[styles.message, { color: theme.textSecondary }]} accessibilityRole="text">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
