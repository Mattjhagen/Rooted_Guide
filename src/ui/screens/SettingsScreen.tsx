import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRightIcon } from '@/ui/components/FallbackIcons';
import { spacing, typography } from '@/ui/theme';
import { useTheme } from '@/features/preferences/ThemeContext';
import { PlumbLineLogo } from '@/ui/components/PlumbLineLogo';
import { ThemePreference } from '@/domain/models/Preferences';

/**
 * Settings Screen
 *
 * Quiet entry point for app settings, appearance theme selection, and data management.
 */
export function SettingsScreen() {
  const { preference, theme, setPreference } = useTheme();
  const router = useRouter();

  const themeOptions: { key: ThemePreference; label: string }[] = [
    { key: 'system', label: 'System' },
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* APPEARANCE SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APPEARANCE</Text>
            <PlumbLineLogo size={22} />
          </View>

          <View style={styles.themeSelectorRow}>
            {themeOptions.map((option) => {
              const isSelected = preference === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.themeChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setPreference(option.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Set theme to ${option.label}`}
                >
                  <Text
                    style={[styles.themeChipText, { color: isSelected ? '#FFFFFF' : theme.text }]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* DATA SECTION */}
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

        {/* ABOUT SECTION */}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingHorizontal: spacing.lg,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  themeChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeChipText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
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
