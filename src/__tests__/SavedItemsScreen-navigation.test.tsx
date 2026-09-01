/**
 * SavedItemsScreen Navigation Tests
 *
 * Verifies that tapping saved item cards properly navigates to passage context.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SavedItemsScreen } from '@/ui/screens/SavedItemsScreen';
import { useUserDatabase } from '@/infrastructure/persistence/useUserDatabase';

// Mock dependencies
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

jest.mock('@/infrastructure/persistence/useUserDatabase');

const mockUserDatabase = {
  reflectionRepository: {
    getAllReflections: jest.fn(),
  },
  notesRepository: {
    getAllNotes: jest.fn(),
  },
  bookmarkRepository: {
    getAllBookmarks: jest.fn(),
  },
  highlightRepository: {
    getAllHighlights: jest.fn(),
  },
  guideThreadRepository: {
    getAllThreads: jest.fn(),
  },
};

describe('SavedItemsScreen Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockBack.mockClear();
    (useUserDatabase as jest.Mock).mockReturnValue(mockUserDatabase);
  });

  it('navigates to passage when reflection card is pressed', async () => {
    mockUserDatabase.reflectionRepository.getAllReflections.mockResolvedValue([
      {
        id: 'reflection_1',
        kind: 'reflection',
        content: 'My reflection on this verse',
        verseRef: {
          book: 'John',
          chapter: 3,
          verse: 16,
        },
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
    ]);
    mockUserDatabase.notesRepository.getAllNotes.mockResolvedValue([]);
    mockUserDatabase.bookmarkRepository.getAllBookmarks.mockResolvedValue([]);
    mockUserDatabase.highlightRepository.getAllHighlights.mockResolvedValue([]);
    mockUserDatabase.guideThreadRepository.getAllThreads.mockResolvedValue([]);

    const { getByText } = render(<SavedItemsScreen />);

    await waitFor(() => {
      expect(getByText('Reflection')).toBeTruthy();
    });

    const reflectionCard = getByText('Reflection');
    fireEvent.press(reflectionCard.parent!);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/passage',
      params: {
        book: 'John',
        chapter: '3',
        verseStart: '16',
      },
    });
  });

  it('navigates to passage when bookmark card is pressed', async () => {
    mockUserDatabase.reflectionRepository.getAllReflections.mockResolvedValue([]);
    mockUserDatabase.notesRepository.getAllNotes.mockResolvedValue([]);
    mockUserDatabase.bookmarkRepository.getAllBookmarks.mockResolvedValue([
      {
        id: 'bookmark_1',
        verseRef: {
          book: 'Romans',
          chapter: 8,
          verse: 28,
        },
        createdAt: new Date('2026-01-02'),
      },
    ]);
    mockUserDatabase.highlightRepository.getAllHighlights.mockResolvedValue([]);
    mockUserDatabase.guideThreadRepository.getAllThreads.mockResolvedValue([]);

    const { getByText } = render(<SavedItemsScreen />);

    await waitFor(() => {
      expect(getByText('Bookmark')).toBeTruthy();
    });

    const bookmarkCard = getByText('Bookmark');
    fireEvent.press(bookmarkCard.parent!);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/passage',
      params: {
        book: 'Romans',
        chapter: '8',
        verseStart: '28',
      },
    });
  });

  it('navigates to passage when highlight card is pressed', async () => {
    mockUserDatabase.reflectionRepository.getAllReflections.mockResolvedValue([]);
    mockUserDatabase.notesRepository.getAllNotes.mockResolvedValue([]);
    mockUserDatabase.bookmarkRepository.getAllBookmarks.mockResolvedValue([]);
    mockUserDatabase.highlightRepository.getAllHighlights.mockResolvedValue([
      {
        id: 'highlight_1',
        verseRef: {
          book: 'Psalm',
          chapter: 23,
          verse: 1,
        },
        color: 'yellow',
        createdAt: new Date('2026-01-03'),
      },
    ]);
    mockUserDatabase.guideThreadRepository.getAllThreads.mockResolvedValue([]);

    const { getByText } = render(<SavedItemsScreen />);

    await waitFor(() => {
      expect(getByText('Highlight')).toBeTruthy();
    });

    const highlightCard = getByText('Highlight');
    fireEvent.press(highlightCard.parent!);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/passage',
      params: {
        book: 'Psalm',
        chapter: '23',
        verseStart: '1',
      },
    });
  });

  it('navigates to passage with range when guide thread card is pressed', async () => {
    mockUserDatabase.reflectionRepository.getAllReflections.mockResolvedValue([]);
    mockUserDatabase.notesRepository.getAllNotes.mockResolvedValue([]);
    mockUserDatabase.bookmarkRepository.getAllBookmarks.mockResolvedValue([]);
    mockUserDatabase.highlightRepository.getAllHighlights.mockResolvedValue([]);
    mockUserDatabase.guideThreadRepository.getAllThreads.mockResolvedValue([
      {
        id: 'thread_1',
        passageRef: {
          book: 'John',
          chapter: 3,
          verseStart: 16,
          verseEnd: 21,
        },
        turns: [],
        createdAt: new Date('2026-01-04'),
        updatedAt: new Date('2026-01-04'),
      },
    ]);

    const { getByText } = render(<SavedItemsScreen />);

    await waitFor(() => {
      expect(getByText('Guide conversation')).toBeTruthy();
    });

    const threadCard = getByText('Guide conversation');
    fireEvent.press(threadCard.parent!);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/passage',
      params: {
        book: 'John',
        chapter: '3',
        verseStart: '16',
        verseEnd: '21',
      },
    });
  });

  it('does not navigate when reflection has no verseRef', async () => {
    mockUserDatabase.reflectionRepository.getAllReflections.mockResolvedValue([
      {
        id: 'reflection_2',
        kind: 'arrive',
        content: 'Opening reflection without verse',
        verseRef: undefined,
        createdAt: new Date('2026-01-05'),
        updatedAt: new Date('2026-01-05'),
      },
    ]);
    mockUserDatabase.notesRepository.getAllNotes.mockResolvedValue([]);
    mockUserDatabase.bookmarkRepository.getAllBookmarks.mockResolvedValue([]);
    mockUserDatabase.highlightRepository.getAllHighlights.mockResolvedValue([]);
    mockUserDatabase.guideThreadRepository.getAllThreads.mockResolvedValue([]);

    const { getByText } = render(<SavedItemsScreen />);

    await waitFor(() => {
      expect(getByText('Reflection')).toBeTruthy();
    });

    const reflectionCard = getByText('Reflection');
    fireEvent.press(reflectionCard.parent!);

    // Should not navigate when no verseRef
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays Scripture reference in card subtitle', async () => {
    mockUserDatabase.reflectionRepository.getAllReflections.mockResolvedValue([
      {
        id: 'reflection_3',
        kind: 'reflection',
        content: 'My reflection',
        verseRef: {
          book: 'John',
          chapter: 3,
          verse: 16,
        },
        createdAt: new Date('2026-01-06'),
        updatedAt: new Date('2026-01-06'),
      },
    ]);
    mockUserDatabase.notesRepository.getAllNotes.mockResolvedValue([]);
    mockUserDatabase.bookmarkRepository.getAllBookmarks.mockResolvedValue([]);
    mockUserDatabase.highlightRepository.getAllHighlights.mockResolvedValue([]);
    mockUserDatabase.guideThreadRepository.getAllThreads.mockResolvedValue([]);

    const { getByText } = render(<SavedItemsScreen />);

    await waitFor(() => {
      expect(getByText('John 3:16')).toBeTruthy();
    });
  });
});
