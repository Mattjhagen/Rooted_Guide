import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserDatabase } from '@/infrastructure/persistence/useUserDatabase';
import { Reflection, Note, Bookmark, Highlight, GuideThread } from '@/domain/models';
import { getTheme, spacing, typography } from '@/ui/theme';

type SavedItemType = 'reflection' | 'prayer' | 'note' | 'bookmark' | 'highlight' | 'guide';
type FilterCategory =
  'all' | 'reflections' | 'prayers' | 'notes' | 'bookmarks' | 'highlights' | 'conversations';

interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  subtitle?: string;
  preview?: string;
  createdAt: Date;
  data: Reflection | Note | Bookmark | Highlight | GuideThread;
}

interface DateGroup {
  date: string;
  label: string;
  items: SavedItem[];
}

export function SavedItemsScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const router = useRouter();
  const {
    reflectionRepository,
    notesRepository,
    bookmarkRepository,
    highlightRepository,
    guideThreadRepository,
  } = useUserDatabase();

  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterCategory>('all');

  const loadItems = useCallback(async () => {
    try {
      const [reflections, notes, bookmarks, highlights, threads] = await Promise.all([
        reflectionRepository.getAllReflections(),
        notesRepository.getAllNotes(),
        bookmarkRepository.getAllBookmarks(),
        highlightRepository.getAllHighlights(),
        guideThreadRepository.getAllThreads(),
      ]);

      const allItems: SavedItem[] = [
        ...reflections.map((r): SavedItem => {
          const verseRef = r.verseRef
            ? `${r.verseRef.book} ${r.verseRef.chapter}:${r.verseRef.verse}`
            : '';
          const isPrayer = r.kind === 'prayer';
          return {
            id: r.id,
            type: isPrayer ? 'prayer' : 'reflection',
            title: isPrayer ? 'Prayer' : 'Reflection',
            subtitle: verseRef || undefined,
            preview: r.content.substring(0, 100),
            createdAt: r.createdAt,
            data: r,
          };
        }),
        ...notes.map((n): SavedItem => {
          const verseRef = n.verseRef
            ? `${n.verseRef.book} ${n.verseRef.chapter}:${n.verseRef.verse}`
            : '';
          const isPrayer = n.kind === 'prayer';
          return {
            id: n.id,
            type: isPrayer ? 'prayer' : 'note',
            title: isPrayer ? 'Prayer' : 'Note',
            subtitle: verseRef || undefined,
            preview: n.content.substring(0, 100),
            createdAt: n.createdAt,
            data: n,
          };
        }),
        ...bookmarks.map((b): SavedItem => ({
          id: b.id,
          type: 'bookmark',
          title: 'Bookmark',
          subtitle: `${b.verseRef.book} ${b.verseRef.chapter}:${b.verseRef.verse}`,
          createdAt: b.createdAt,
          data: b,
        })),
        ...highlights.map((h): SavedItem => ({
          id: h.id,
          type: 'highlight',
          title: 'Highlight',
          subtitle: `${h.verseRef.book} ${h.verseRef.chapter}:${h.verseRef.verse}`,
          createdAt: h.createdAt,
          data: h,
        })),
        ...threads.map((t): SavedItem => {
          const passageRef = t.passageRef
            ? `${t.passageRef.book} ${t.passageRef.chapter}:${t.passageRef.verseStart}${
                t.passageRef.verseEnd > t.passageRef.verseStart ? `-${t.passageRef.verseEnd}` : ''
              }`
            : undefined;
          return {
            id: t.id,
            type: 'guide',
            title: 'Guide conversation',
            subtitle: passageRef,
            createdAt: t.createdAt,
            data: t,
          };
        }),
      ];

      allItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setItems(allItems);
    } catch (error) {
      console.error('Failed to load saved items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    reflectionRepository,
    notesRepository,
    bookmarkRepository,
    highlightRepository,
    guideThreadRepository,
  ]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const getFilteredItems = useCallback(() => {
    switch (filter) {
      case 'all':
        return items;
      case 'reflections':
        return items.filter((item) => item.type === 'reflection');
      case 'prayers':
        return items.filter((item) => item.type === 'prayer');
      case 'notes':
        return items.filter((item) => item.type === 'note');
      case 'bookmarks':
        return items.filter((item) => item.type === 'bookmark');
      case 'highlights':
        return items.filter((item) => item.type === 'highlight');
      case 'conversations':
        return items.filter((item) => item.type === 'guide');
      default:
        return items;
    }
  }, [items, filter]);

  const getGroupedItems = useCallback((): DateGroup[] => {
    const filtered = getFilteredItems();
    const groups = new Map<string, SavedItem[]>();

    filtered.forEach((item) => {
      const dateKey = item.createdAt.toISOString().split('T')[0];
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(item);
    });

    const dateGroups: DateGroup[] = [];
    groups.forEach((groupItems, dateKey) => {
      dateGroups.push({
        date: dateKey,
        label: formatDateGroupLabel(new Date(dateKey)),
        items: groupItems,
      });
    });

    // Sort groups by date (newest first)
    dateGroups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return dateGroups;
  }, [getFilteredItems]);

  const handleItemPress = (item: SavedItem) => {
    // Navigate to Scripture passage context
    if (item.type === 'reflection' || item.type === 'prayer') {
      // Could be Reflection or Note - check for verseRef
      const data = item.data as Reflection | Note;
      if (data.verseRef) {
        router.push({
          pathname: '/passage',
          params: {
            book: data.verseRef.book,
            chapter: data.verseRef.chapter.toString(),
            verseStart: data.verseRef.verse.toString(),
          },
        });
      }
    } else if (item.type === 'note') {
      const note = item.data as Note;
      if (note.verseRef) {
        router.push({
          pathname: '/passage',
          params: {
            book: note.verseRef.book,
            chapter: note.verseRef.chapter.toString(),
            verseStart: note.verseRef.verse.toString(),
          },
        });
      }
    } else if (item.type === 'bookmark') {
      const bookmark = item.data as Bookmark;
      router.push({
        pathname: '/passage',
        params: {
          book: bookmark.verseRef.book,
          chapter: bookmark.verseRef.chapter.toString(),
          verseStart: bookmark.verseRef.verse.toString(),
        },
      });
    } else if (item.type === 'highlight') {
      const highlight = item.data as Highlight;
      router.push({
        pathname: '/passage',
        params: {
          book: highlight.verseRef.book,
          chapter: highlight.verseRef.chapter.toString(),
          verseStart: highlight.verseRef.verse.toString(),
        },
      });
    } else if (item.type === 'guide') {
      const thread = item.data as GuideThread;
      if (thread.passageRef) {
        router.push({
          pathname: '/passage',
          params: {
            book: thread.passageRef.book,
            chapter: thread.passageRef.chapter.toString(),
            verseStart: thread.passageRef.verseStart.toString(),
            verseEnd: thread.passageRef.verseEnd.toString(),
          },
        });
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.loading, { color: theme.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const groupedItems = getGroupedItems();
  const filteredItems = getFilteredItems();

  const filters: { key: FilterCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'reflections', label: 'Reflections' },
    { key: 'prayers', label: 'Prayers' },
    { key: 'notes', label: 'Notes' },
    { key: 'bookmarks', label: 'Bookmarks' },
    { key: 'highlights', label: 'Highlights' },
    { key: 'conversations', label: 'Conversations' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Saved</Text>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={[styles.filterScroll, { borderBottomColor: theme.border }]}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && { backgroundColor: theme.border }]}
            onPress={() => setFilter(f.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === f.key }}
          >
            <Text
              style={[
                styles.filterText,
                { color: theme.text },
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {getEmptyStateMessage(filter)}
            </Text>
          </View>
        ) : (
          <View style={styles.items}>
            {groupedItems.map((group) => (
              <View key={group.date} style={styles.dateGroup}>
                <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>
                  {group.label}
                </Text>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.item, { borderColor: theme.border }]}
                    onPress={() => handleItemPress(item)}
                  >
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                      <Text style={[styles.itemDate, { color: theme.textSecondary }]}>
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>
                    {item.subtitle && (
                      <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                        {item.subtitle}
                      </Text>
                    )}
                    {item.preview && (
                      <Text
                        style={[styles.itemPreview, { color: theme.textSecondary }]}
                        numberOfLines={2}
                      >
                        {item.preview}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

function formatDateGroupLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today.getTime() - itemDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  // For older items, show weekday and full date
  const weekday = date.toLocaleString('default', { weekday: 'long' });
  const month = date.toLocaleString('default', { month: 'long' });
  const day = date.getDate();
  return `${weekday}, ${month} ${day}`;
}

function getEmptyStateMessage(filter: FilterCategory): string {
  switch (filter) {
    case 'all':
      return 'Your saved reflections, prayers, and notes will appear here.';
    case 'reflections':
      return 'No saved reflections yet.';
    case 'prayers':
      return 'No saved prayers yet.';
    case 'notes':
      return 'No saved notes yet.';
    case 'bookmarks':
      return 'No bookmarked verses yet.';
    case 'highlights':
      return 'No highlighted verses yet.';
    case 'conversations':
      return 'No saved conversations yet.';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    ...typography.body,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    ...typography.title,
    fontSize: 28,
  },
  filterScroll: {
    borderBottomWidth: 1,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
  },
  filterText: {
    ...typography.body,
    fontSize: 14,
  },
  filterTextActive: {
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
  },
  emptyState: {
    paddingVertical: spacing.xl * 3,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  items: {
    gap: spacing.lg,
  },
  dateGroup: {
    gap: spacing.sm,
  },
  dateLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  item: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  itemDate: {
    ...typography.caption,
  },
  itemSubtitle: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  itemPreview: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
