import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRightIcon } from '@/ui/components/FallbackIcons';
import { getTheme, spacing, typography } from '@/ui/theme';

/**
 * Settings Screen
 *
 * Quiet entry point for app settings and data management.
 * Not part of primary devotional flow.
 */
export function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DATA</Text>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={() => router.push('/data')}
          >
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Manage data</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Export or delete your reflections, notes, and bookmarks
              </Text>
            </View>
            <ChevronRightIcon size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ABOUT</Text>

          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Version</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                0.1.0 (Development)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  title: {
    ...typography.title,
    fontSize: 32,
  },
  content: {
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    ...typography.body,
    fontSize: 17,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    fontSize: 14,
    lineHeight: 20,
  },
});
