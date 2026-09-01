import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { DailyPathScreen } from '../ui/screens/DailyPathScreen';

// Mock dependencies
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

const mockGetReaderPreferences: any = jest.fn();
const mockGetChapter: any = jest.fn();

jest.mock('../infrastructure/scripture/useBibleRepository', () => ({
  useBibleRepository: () => ({
    getChapter: mockGetChapter,
  }),
}));

jest.mock('../infrastructure/persistence/useUserDatabase', () => ({
  useUserDatabase: () => ({
    preferencesRepository: {
      getReaderPreferences: mockGetReaderPreferences as any,
    },
    bookmarkRepository: {
      isBookmarked: jest.fn(() => Promise.resolve(false)),
    },
    highlightRepository: {
      getHighlight: jest.fn(() => Promise.resolve(null)),
    },
  }),
}));

const mockUseDailyPath = jest.fn();
jest.mock('../features/dailyPath/useDailyPath', () => ({
  useDailyPath: () => mockUseDailyPath(),
}));

/**
 * Tests for DailyPathScreen home states
 *
 * Verifies:
 * - Before practice: "Begin today's path" action
 * - Partially completed: "Continue today's path" action
 * - After completion: "Continue reading" action
 */
describe('DailyPathScreen States', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
    mockGetReaderPreferences.mockClear();
    mockGetChapter.mockClear();
  });

  it('should show loading state initially', () => {
    mockUseDailyPath.mockReturnValue({
      loading: true,
      session: null,
      currentModule: 'arrive',
      draft: '',
      updateDraft: jest.fn(),
      completeModule: jest.fn(),
      isComplete: false,
      isLocked: false,
      timeUntilUnlock: null,
      startFromBeginning: jest.fn(),
    });

    const { getByText } = render(<DailyPathScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('should show "Continue" for in-progress session', async () => {
    mockUseDailyPath.mockReturnValue({
      loading: false,
      session: { lastModule: 'read', completedModules: ['arrive'] },
      currentModule: 'read',
      draft: '',
      updateDraft: jest.fn(),
      completeModule: jest.fn(),
      isComplete: false,
      isLocked: false,
      timeUntilUnlock: null,
      startFromBeginning: jest.fn(),
    });

    const { getByText } = render(<DailyPathScreen />);

    await waitFor(() => {
      expect(getByText('Welcome back')).toBeTruthy();
      expect(getByText('Continue')).toBeTruthy();
      expect(getByText('Start from beginning')).toBeTruthy();
    });
  });

  it('should show "Begin today\'s path" for new session', () => {
    mockUseDailyPath.mockReturnValue({
      loading: false,
      session: { lastModule: null, completedModules: [] },
      currentModule: 'arrive',
      draft: '',
      updateDraft: jest.fn(),
      completeModule: jest.fn(),
      isComplete: false,
      isLocked: false,
      timeUntilUnlock: null,
      startFromBeginning: jest.fn(),
    });

    const { getByText } = render(<DailyPathScreen />);

    expect(getByText("Today's path")).toBeTruthy();
    expect(getByText(/15-minute guided journey/)).toBeTruthy();
    expect(getByText("Begin today's path")).toBeTruthy();
  });

  it('should show "Continue reading" after completion with last read position', async () => {
    mockUseDailyPath.mockReturnValue({
      loading: false,
      session: { lastModule: 'respond', completedModules: ['arrive', 'read', 'respond'] },
      currentModule: 'respond',
      draft: '',
      updateDraft: jest.fn(),
      completeModule: jest.fn(),
      isComplete: true,
      isLocked: false,
      timeUntilUnlock: null,
      startFromBeginning: jest.fn(),
    });

    mockGetReaderPreferences.mockResolvedValue({
      fontSize: 'medium' as const,
      fontFamily: 'system' as const,
      lineSpacing: 'normal' as const,
      lastReadRef: 'John 3',
    });

    const { getByText } = render(<DailyPathScreen />);

    await waitFor(() => {
      expect(getByText('Path complete')).toBeTruthy();
      expect(getByText(/completed today's practice/)).toBeTruthy();
      expect(getByText('Continue reading')).toBeTruthy();
    });
  });

  it('should navigate to reader when "Continue reading" pressed with position', async () => {
    mockUseDailyPath.mockReturnValue({
      loading: false,
      session: { lastModule: 'respond', completedModules: ['arrive', 'read', 'respond'] },
      currentModule: 'respond',
      draft: '',
      updateDraft: jest.fn(),
      completeModule: jest.fn(),
      isComplete: true,
      isLocked: false,
      timeUntilUnlock: null,
      startFromBeginning: jest.fn(),
    });

    mockGetReaderPreferences.mockResolvedValue({
      fontSize: 'medium' as const,
      fontFamily: 'system' as const,
      lineSpacing: 'normal' as const,
      lastReadRef: 'Genesis 1',
    });

    const { getByText } = render(<DailyPathScreen />);

    // Wait for lastReadRef to load
    await waitFor(() => {
      expect(mockGetReaderPreferences).toHaveBeenCalled();
    });

    const continueButton = getByText('Continue reading');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/reader?book=Genesis&chapter=1');
    });
  });

  it('should navigate to browser when "Continue reading" pressed without position', async () => {
    mockUseDailyPath.mockReturnValue({
      loading: false,
      session: { lastModule: 'respond', completedModules: ['arrive', 'read', 'respond'] },
      currentModule: 'respond',
      draft: '',
      updateDraft: jest.fn(),
      completeModule: jest.fn(),
      isComplete: true,
      isLocked: false,
      timeUntilUnlock: null,
      startFromBeginning: jest.fn(),
    });

    mockGetReaderPreferences.mockResolvedValue({
      fontSize: 'medium' as const,
      fontFamily: 'system' as const,
      lineSpacing: 'normal' as const,
      lastReadRef: null,
    });

    const { getByText } = render(<DailyPathScreen />);

    await waitFor(() => {
      const continueButton = getByText('Continue reading');
      fireEvent.press(continueButton);
    });

    expect(mockPush).toHaveBeenCalledWith('/browse');
  });

  it('should not show "View saved items" or "Manage data" buttons after completion', async () => {
    mockUseDailyPath.mockReturnValue({
      loading: false,
      session: { lastModule: 'respond', completedModules: ['arrive', 'read', 'respond'] },
      currentModule: 'respond',
      draft: '',
      updateDraft: jest.fn(),
      completeModule: jest.fn(),
      isComplete: true,
      isLocked: false,
      timeUntilUnlock: null,
      startFromBeginning: jest.fn(),
    });

    mockGetReaderPreferences.mockResolvedValue({
      fontSize: 'medium' as const,
      fontFamily: 'system' as const,
      lineSpacing: 'normal' as const,
      lastReadRef: null,
    });

    const { queryByText } = render(<DailyPathScreen />);

    await waitFor(() => {
      expect(queryByText('View saved items')).toBeNull();
      expect(queryByText('Manage data')).toBeNull();
    });
  });
});
