import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookIcon, SearchIcon, ChevronRightIcon } from '@/ui/components/FallbackIcons';
import { CANONICAL_BOOKS } from '@/infrastructure/scripture/schema';
import { useTheme } from '@/features/preferences/ThemeContext';

/**
 * Bible Browser Screen
 *
 * Allows users to browse all 66 books and select chapters.
 * Organized by testament with search capability.
 */
export function BibleBrowserScreen() {
  const router = useRouter();
  const { theme, resolvedScheme } = useTheme();
  const isDark = resolvedScheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  // Group books by testament
  const oldTestament = CANONICAL_BOOKS.filter((b) => b.testament === 'OT');
  const newTestament = CANONICAL_BOOKS.filter((b) => b.testament === 'NT');

  // Filter books based on search
  const allBooks = [...oldTestament, ...newTestament];
  const filteredBooks = searchQuery
    ? allBooks.filter((book) => book.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  // Chapter counts per book (simplified - using known chapter counts)
  const getChapterCount = (bookName: string): number => {
    const chapterCounts: Record<string, number> = {
      Genesis: 50,
      Exodus: 40,
      Leviticus: 27,
      Numbers: 36,
      Deuteronomy: 34,
      Joshua: 24,
      Judges: 21,
      Ruth: 4,
      '1 Samuel': 31,
      '2 Samuel': 24,
      '1 Kings': 22,
      '2 Kings': 25,
      '1 Chronicles': 29,
      '2 Chronicles': 36,
      Ezra: 10,
      Nehemiah: 13,
      Esther: 10,
      Job: 42,
      Psalms: 150,
      Proverbs: 31,
      Ecclesiastes: 12,
      'Song of Solomon': 8,
      Isaiah: 66,
      Jeremiah: 52,
      Lamentations: 5,
      Ezekiel: 48,
      Daniel: 12,
      Hosea: 14,
      Joel: 3,
      Amos: 9,
      Obadiah: 1,
      Jonah: 4,
      Micah: 7,
      Nahum: 3,
      Habakkuk: 3,
      Zephaniah: 3,
      Haggai: 2,
      Zechariah: 14,
      Malachi: 4,
      Matthew: 28,
      Mark: 16,
      Luke: 24,
      John: 21,
      Acts: 28,
      Romans: 16,
      '1 Corinthians': 16,
      '2 Corinthians': 13,
      Galatians: 6,
      Ephesians: 6,
      Philippians: 4,
      Colossians: 4,
      '1 Thessalonians': 5,
      '2 Thessalonians': 3,
      '1 Timothy': 6,
      '2 Timothy': 4,
      Titus: 3,
      Philemon: 1,
      Hebrews: 13,
      James: 5,
      '1 Peter': 5,
      '2 Peter': 3,
      '1 John': 5,
      '2 John': 1,
      '3 John': 1,
      Jude: 1,
      Revelation: 22,
    };
    return chapterCounts[bookName] || 1;
  };

  const handleBookSelect = (bookName: string) => {
    setSelectedBook(bookName);
  };

  const handleChapterSelect = (bookName: string, chapter: number) => {
    router.push(`/reader?book=${encodeURIComponent(bookName)}&chapter=${chapter}`);
  };

  const renderChapterGrid = () => {
    if (!selectedBook) return null;

    const chapterCount = getChapterCount(selectedBook);
    const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

    return (
      <View style={styles.chapterContainer}>
        <View style={styles.chapterHeader}>
          <TouchableOpacity onPress={() => setSelectedBook(null)} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: isDark ? '#8B7355' : '#6B5744' }]}>
              ← Back to Books
            </Text>
          </TouchableOpacity>
          <Text style={[styles.selectedBookTitle, { color: isDark ? '#F0EDE8' : '#1A1512' }]}>
            {selectedBook}
          </Text>
          <Text style={[styles.chapterSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
          </Text>
        </View>
        <FlatList
          data={chapters}
          numColumns={5}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chapterButton,
                {
                  backgroundColor: isDark ? '#1A1512' : '#FFFFFF',
                  borderColor: isDark ? '#2D2824' : '#E5DDD5',
                },
              ]}
              onPress={() => handleChapterSelect(selectedBook, item)}
            >
              <Text style={[styles.chapterText, { color: isDark ? '#F0EDE8' : '#1A1512' }]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chapterGrid}
        />
      </View>
    );
  };

  const renderBookItem = (book: (typeof CANONICAL_BOOKS)[0]) => (
    <TouchableOpacity
      key={book.name}
      style={[
        styles.bookItem,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
      onPress={() => handleBookSelect(book.name)}
    >
      <BookIcon size={20} color={theme.primary} />
      <Text style={[styles.bookText, { color: theme.text }]}>{book.name}</Text>
      <View style={styles.bookRight}>
        <Text style={[styles.chapterCount, { color: theme.textSecondary }]}>
          {getChapterCount(book.name)} ch
        </Text>
        <ChevronRightIcon size={16} color={theme.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderTestamentSection = (testament: 'OT' | 'NT') => {
    const books = testament === 'OT' ? oldTestament : newTestament;
    const title = testament === 'OT' ? 'Old Testament' : 'New Testament';

    return (
      <View key={testament} style={styles.testamentSection}>
        <Text style={[styles.testamentTitle, { color: theme.textSecondary }]}>{title}</Text>
        {books.map((book) => renderBookItem(book))}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FAF8F4' }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#F0EDE8' : '#1A1512' }]}>
          {selectedBook ? selectedBook : 'Bible'}
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {selectedBook ? 'Select a chapter' : 'Choose a book to begin'}
        </Text>
      </View>

      {!selectedBook && (
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark ? '#1A1512' : '#FFFFFF',
              borderColor: isDark ? '#2D2824' : '#E5DDD5',
            },
          ]}
        >
          <SearchIcon size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#F0EDE8' : '#1A1512' }]}
            placeholder="Search books..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {selectedBook ? (
        renderChapterGrid()
      ) : filteredBooks ? (
        <FlatList
          data={filteredBooks}
          renderItem={({ item }) => renderBookItem(item)}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={['OT', 'NT'] as const}
          renderItem={({ item }) => renderTestamentSection(item)}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    fontWeight: '400',
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 28,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'System',
    fontSize: 15,
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  testamentSection: {
    marginBottom: 32,
  },
  testamentTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  bookText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 12,
  },
  bookRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chapterCount: {
    fontFamily: 'System',
    fontSize: 13,
  },
  chapterContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chapterHeader: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedBookTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 26,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  chapterSubtitle: {
    fontFamily: 'System',
    fontSize: 14,
    marginTop: 4,
  },
  chapterGrid: {
    paddingBottom: 40,
  },
  chapterButton: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0,
  },
  chapterText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
  },
});
