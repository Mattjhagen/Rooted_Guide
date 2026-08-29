/**
 * Safety alert component
 *
 * Displays compassionate safety messages and resources for crisis scenarios
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { SafetyMessage } from '@/domain/services/SafetyRouter';
import { getTheme, spacing, typography } from '@/ui/theme';

interface SafetyAlertProps {
  safetyMessage: SafetyMessage;
  onDismiss?: () => void;
}

export function SafetyAlert({ safetyMessage, onDismiss }: SafetyAlertProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  const handleContactPress = (phone?: string, text?: string, url?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else if (text) {
      Linking.openURL(`sms:${text}`);
    } else if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.warning }]} accessibilityRole="alert">
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={[styles.message, { color: theme.text }]} accessibilityRole="text">
          {safetyMessage.message}
        </Text>

        {safetyMessage.resources && (
          <View style={styles.resources}>
            <Text style={[styles.resourcesTitle, { color: theme.text }]} accessibilityRole="header">
              {safetyMessage.resources.title}
            </Text>

            {safetyMessage.resources.description && (
              <Text style={[styles.resourcesDescription, { color: theme.textSecondary }]}>
                {safetyMessage.resources.description}
              </Text>
            )}

            {safetyMessage.resources.contacts.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.contactCard, { backgroundColor: theme.background }]}
                onPress={() => handleContactPress(contact.phone, contact.text, contact.url)}
                accessibilityRole="button"
                accessibilityLabel={`Contact ${contact.name}`}
                accessibilityHint={
                  contact.phone
                    ? `Call ${contact.phone}`
                    : contact.text
                      ? `Text ${contact.text}`
                      : 'Open link'
                }
              >
                <Text style={[styles.contactName, { color: theme.text }]}>{contact.name}</Text>

                {(contact.phone || contact.text) && (
                  <Text style={[styles.contactDetail, { color: theme.primary }]}>
                    {contact.phone || contact.text}
                  </Text>
                )}

                <Text style={[styles.contactAvailability, { color: theme.textSecondary }]}>
                  {contact.availability}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {safetyMessage.allowContinue && onDismiss && (
          <TouchableOpacity
            style={[styles.dismissButton, { borderColor: theme.border }]}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text style={[styles.dismissButtonText, { color: theme.text }]}>Continue</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  message: {
    ...typography.body,
    fontSize: 17,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  resources: {
    marginTop: spacing.md,
  },
  resourcesTitle: {
    ...typography.title,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  resourcesDescription: {
    ...typography.body,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  contactCard: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  contactName: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  contactDetail: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  contactAvailability: {
    ...typography.bodySmall,
    fontSize: 13,
  },
  dismissButton: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  dismissButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '500',
  },
});
