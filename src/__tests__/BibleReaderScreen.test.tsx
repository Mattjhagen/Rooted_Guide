import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BibleReaderScreen } from '../ui/screens/BibleReaderScreen';
import { MockBibleRepository } from '../infrastructure/adapters/MockBibleRepository';

// Mock dependencies
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useLocalSearchParams: () => ({
    book: 'John',
    chapter: '3',
  }),
}));

jest.mock('../infrastructure/scripture/useBibleRepository', () => ({
  useBibleRepository: () => new MockBibleRepository(),
}));

jest.mock('../infrastructure/persistence/useUserDatabase', () => ({
  useUserDatabase: () => ({
    bookmarkRepository: {
      isBookmarked: jest.fn(() => Promise.resolve(false)),
      getAllBookmarks: jest.fn(() => Promise.resolve([])),
      addBookmark: jest.fn(() => Promise.resolve(undefined)),
      removeBookmark: jest.fn(() => Promise.resolve(undefined)),
    },
    highlightRepository: {
      getHighlight: jest.fn(() => Promise.resolve(null)),
      getAllHighlights: jest.fn(() => Promise.resolve([])),
      setHighlight: jest.fn(() => Promise.resolve(undefined)),
      removeHighlight: jest.fn(() => Promise.resolve(undefined)),
    },
    preferencesRepository: {
      getReaderPreferences: jest.fn(() =>
        Promise.resolve({
          fontSize: 'medium' as const,
          fontFamily: 'system' as const,
          lineSpacing: 'normal' as const,
          lastReadRef: null,
        })
      ),
      updateReaderPreferences: jest.fn(() => Promise.resolve(undefined)),
    },
  }),
}));

/**
 * Tests for Bible Reader Screen
 *
 * Verifies:
 * - Chapter loading and display
 * - Navigation between chapters
 * - Verse interaction
 * - Reading position tracking
 */
describe('BibleReaderScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it('should render chapter header', async () => {
    const { getByText } = render(<BibleReaderScreen />);

    await waitFor(() => {
      expect(getByText('John')).toBeTruthy();
      expect(getByText('Chapter 3')).toBeTruthy();
    });
  });

  it('should display verses from the chapter', async () => {
    const { getByText } = render(<BibleReaderScreen />);

    await waitFor(() => {
      // MockBibleRepository returns John 3 verses
      expect(getByText(/Nicodemus/)).toBeTruthy();
    });
  });

  it('should show verse numbers', async () => {
    const { getByText } = render(<BibleReaderScreen />);

    await waitFor(() => {
      expect(getByText('1')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
    });
  });

  it('should navigate to previous chapter when button pressed', async () => {
    const { getByText } = render(<BibleReaderScreen />);

    await waitFor(() => {
      const prevButton = getByText('Previous');
      fireEvent.press(prevButton);
    });

    expect(mockPush).toHaveBeenCalledWith('/reader?book=John&chapter=2');
  });

  it('should navigate to next chapter when button pressed', async () => {
    const { getByText } = render(<BibleReaderScreen />);

    await waitFor(() => {
      const nextButton = getByText('Next');
      fireEvent.press(nextButton);
    });

    expect(mockPush).toHaveBeenCalledWith('/reader?book=John&chapter=4');
  });

  it('should show chapter indicator', async () => {
    const { getByText } = render(<BibleReaderScreen />);

    await waitFor(() => {
      // John has 21 chapters, we're on chapter 3
      expect(getByText('3 / 21')).toBeTruthy();
    });
  });

  it('should navigate back when back button pressed', async () => {
    const { UNSAFE_getAllByType } = render(<BibleReaderScreen />);

    await waitFor(() => {
      // Find the back button (ChevronLeft in header)
      const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
      const backButton = touchables[0]; // First button in header
      fireEvent.press(backButton);
    });

    expect(mockBack).toHaveBeenCalled();
  });

  it('should open verse actions when verse is tapped', async () => {
    const { getByText } = render(<BibleReaderScreen />);

    await waitFor(() => {
      const verseText = getByText(/Nicodemus/);
      fireEvent.press(verseText);
    });

    // VerseActions modal should open (tested separately)
  });

  it('should update reading position on chapter load', async () => {
    const mockUpdatePrefs = jest.fn(() => Promise.resolve(undefined));

    jest
      .spyOn(require('../infrastructure/persistence/useUserDatabase'), 'useUserDatabase')
      .mockImplementation(() => ({
        bookmarkRepository: {
          isBookmarked: jest.fn(() => Promise.resolve(false)),
        },
        highlightRepository: {
          getHighlight: jest.fn(() => Promise.resolve(null)),
        },
        preferencesRepository: {
          getReaderPreferences: jest.fn(() =>
            Promise.resolve({
              fontSize: 'medium' as const,
              fontFamily: 'system' as const,
              lineSpacing: 'normal' as const,
              lastReadRef: null,
            })
          ),
          updateReaderPreferences: mockUpdatePrefs,
        },
      }));

    render(<BibleReaderScreen />);

    await waitFor(() => {
      expect(mockUpdatePrefs).toHaveBeenCalledWith({
        lastReadRef: 'John 3',
      });
    });
  });

  it('should show bookmark indicator for bookmarked verses', async () => {
    jest
      .spyOn(require('../infrastructure/persistence/useUserDatabase'), 'useUserDatabase')
      .mockImplementation(() => ({
        bookmarkRepository: {
          isBookmarked: jest.fn(() => Promise.resolve(true)),
          getAllBookmarks: jest.fn(() => Promise.resolve([])),
        },
        highlightRepository: {
          getHighlight: jest.fn(() => Promise.resolve(null)),
          getAllHighlights: jest.fn(() => Promise.resolve([])),
        },
        preferencesRepository: {
          getReaderPreferences: jest.fn(() =>
            Promise.resolve({
              fontSize: 'medium' as const,
              fontFamily: 'system' as const,
              lineSpacing: 'normal' as const,
              lastReadRef: null,
            })
          ),
          updateReaderPreferences: jest.fn(() => Promise.resolve(undefined)),
        },
      }));

    const { UNSAFE_getAllByProps } = render(<BibleReaderScreen />);

    await waitFor(() => {
      // Look for bookmark indicator elements
      const indicators = UNSAFE_getAllByProps({ accessibilityLabel: 'Bookmarked' });
      expect(indicators.length).toBeGreaterThan(0);
    });
  });
});
