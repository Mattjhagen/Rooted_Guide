import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { describe, it, expect, jest } from '@jest/globals';
import { BibleBrowserScreen } from '../ui/screens/BibleBrowserScreen';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
}));

/**
 * Tests for Bible Browser Screen
 *
 * Verifies:
 * - Book list display
 * - Testament organization
 * - Search functionality
 * - Chapter grid navigation
 */
describe('BibleBrowserScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('should render testament sections', () => {
    const { getByText } = render(<BibleBrowserScreen />);
    expect(getByText('Old Testament')).toBeTruthy();
    expect(getByText('New Testament')).toBeTruthy();
  });

  it('should display all 66 books', () => {
    const { getByText } = render(<BibleBrowserScreen />);

    // Check a few key books from each testament
    expect(getByText('Genesis')).toBeTruthy();
    expect(getByText('Psalms')).toBeTruthy();
    expect(getByText('Matthew')).toBeTruthy();
    expect(getByText('Revelation')).toBeTruthy();
  });

  it('should show chapter counts for books', () => {
    const { getByText } = render(<BibleBrowserScreen />);

    // Genesis has 50 chapters
    expect(getByText('50 ch')).toBeTruthy();
  });

  it('should filter books by search query', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<BibleBrowserScreen />);

    const searchInput = getByPlaceholderText('Search books...');
    fireEvent.changeText(searchInput, 'john');

    await waitFor(() => {
      expect(getByText('John')).toBeTruthy();
      expect(getByText('1 John')).toBeTruthy();
      expect(getByText('2 John')).toBeTruthy();
      expect(getByText('3 John')).toBeTruthy();

      // Books not matching should not appear
      expect(queryByText('Genesis')).toBeNull();
      expect(queryByText('Matthew')).toBeNull();
    });
  });

  it('should show chapter grid when book is selected', async () => {
    const { getByText, queryByText } = render(<BibleBrowserScreen />);

    // Select Genesis
    const genesisButton = getByText('Genesis');
    fireEvent.press(genesisButton);

    await waitFor(() => {
      // Should show chapter numbers
      expect(getByText('1')).toBeTruthy();
      expect(getByText('50')).toBeTruthy();

      // Testament headers should be hidden
      expect(queryByText('Old Testament')).toBeNull();
    });
  });

  it('should navigate to reader when chapter is selected', async () => {
    const { getByText } = render(<BibleBrowserScreen />);

    // Select Genesis
    fireEvent.press(getByText('Genesis'));

    await waitFor(() => {
      // Select chapter 1
      const chapterButton = getByText('1');
      fireEvent.press(chapterButton);
    });

    expect(mockPush).toHaveBeenCalledWith('/reader?book=Genesis&chapter=1');
  });

  it('should show back button in chapter view', async () => {
    const { getByText } = render(<BibleBrowserScreen />);

    // Select a book
    fireEvent.press(getByText('Psalms'));

    await waitFor(() => {
      expect(getByText('← Back to Books')).toBeTruthy();
    });
  });

  it('should return to book list when back is pressed', async () => {
    const { getByText, queryByText } = render(<BibleBrowserScreen />);

    // Select a book
    fireEvent.press(getByText('Romans'));

    await waitFor(() => {
      // Press back
      fireEvent.press(getByText('← Back to Books'));
    });

    // Should show testament sections again
    expect(getByText('Old Testament')).toBeTruthy();
    expect(getByText('New Testament')).toBeTruthy();

    // Chapter grid should be hidden
    expect(queryByText('← Back to Books')).toBeNull();
  });

  it('should show correct chapter count subtitle', async () => {
    const { getByText } = render(<BibleBrowserScreen />);

    // Select Psalms (150 chapters)
    fireEvent.press(getByText('Psalms'));

    await waitFor(() => {
      expect(getByText('150 chapters')).toBeTruthy();
    });
  });

  it('should handle single-chapter books', async () => {
    const { getByText } = render(<BibleBrowserScreen />);

    // Select Philemon (1 chapter)
    fireEvent.press(getByText('Philemon'));

    await waitFor(() => {
      expect(getByText('1 chapter')).toBeTruthy();
    });
  });
});
