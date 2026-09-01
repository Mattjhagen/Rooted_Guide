import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useUserDatabase } from '@/infrastructure/persistence/useUserDatabase';
import { getTheme, spacing, typography } from '@/ui/theme';

export function DataControlsScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const router = useRouter();
  const { dataManager } = useUserDatabase();
  const [stats, setStats] = useState({
    bookmarks: 0,
    highlights: 0,
    notes: 0,
    guideThreads: 0,
    dailySessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const dataStats = await dataManager.getDataStats();
        setStats(dataStats);
      } catch (error) {
        console.error('Failed to load data stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [dataManager]);

  const handleExport = async () => {
    try {
      setExporting(true);

      const jsonData = await dataManager.exportData();
      const filename = `plumb-line-export-${new Date().toISOString().split('T')[0]}.json`;
      const file = new File(Paths.document, filename);

      await file.write(jsonData);

      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Plumb Line Data',
          UTI: 'public.json',
        });
      } else {
        await Share.share({
          url: file.uri,
          title: 'Export Plumb Line Data',
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Unable to export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete All Data',
      "This will permanently delete all your reflections, prayers, notes, bookmarks, highlights, and guide conversations.\n\nYour Bible content and today's passage will not be affected.\n\nThis cannot be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Data',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await dataManager.deleteAllData();

      Alert.alert('Data Deleted', 'All your local data has been deleted.', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/');
          },
        },
      ]);
    } catch (error) {
      console.error('Delete failed:', error);
      Alert.alert('Delete Failed', 'Unable to delete your data. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const totalItems =
    stats.bookmarks + stats.highlights + stats.notes + stats.guideThreads + stats.dailySessions;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Data Controls</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats section */}
        <View style={[styles.section, { borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Local Data</Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            All data is stored privately on your device.
          </Text>

          {loading ? (
            <Text style={[styles.statsLoading, { color: theme.textSecondary }]}>Loading...</Text>
          ) : (
            <View style={styles.stats}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Daily sessions
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{stats.dailySessions}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Notes & reflections
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{stats.notes}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Bookmarks</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{stats.bookmarks}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Highlights</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{stats.highlights}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Guide conversations
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{stats.guideThreads}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Export section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Export</Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Download a complete copy of your data as a readable JSON file. Use this to back up your
            reflections, prayers, and notes.
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.primary },
              exporting && styles.actionButtonDisabled,
            ]}
            onPress={handleExport}
            disabled={exporting || totalItems === 0}
          >
            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
              {exporting ? 'Exporting...' : 'Export Data'}
            </Text>
          </TouchableOpacity>

          {totalItems === 0 && (
            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
              No data to export yet.
            </Text>
          )}
        </View>

        {/* Delete section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Delete All Data</Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Permanently delete all your local Plumb Line data. Your Bible content and today's
            passage will not be affected. This cannot be undone.
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              deleting && styles.actionButtonDisabled,
            ]}
            onPress={handleDelete}
            disabled={deleting || totalItems === 0}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              {deleting ? 'Deleting...' : 'Delete All Data'}
            </Text>
          </TouchableOpacity>

          {totalItems === 0 && (
            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
              No data to delete.
            </Text>
          )}
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.md,
    zIndex: 1,
  },
  backText: {
    ...typography.body,
    fontWeight: '500',
  },
  title: {
    ...typography.title,
    fontSize: 28,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl * 2,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 20,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  stats: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  statsLoading: {
    ...typography.body,
    paddingTop: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  statLabel: {
    ...typography.body,
  },
  statValue: {
    ...typography.body,
    fontWeight: '600',
  },
  actionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
  helperText: {
    ...typography.caption,
    fontStyle: 'italic',
  },
});
