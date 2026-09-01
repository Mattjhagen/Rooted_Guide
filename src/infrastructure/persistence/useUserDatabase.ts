import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';
import { SQLiteBookmarkRepository } from './SQLiteBookmarkRepository';
import { SQLiteHighlightRepository } from './SQLiteHighlightRepository';
import { SQLiteNotesRepository } from './SQLiteNotesRepository';
import { SQLiteGuideThreadRepository } from './SQLiteGuideThreadRepository';
import { SQLitePreferencesRepository } from './SQLitePreferencesRepository';
import { SQLiteDailyPracticeRepository } from './SQLiteDailyPracticeRepository';
import { SQLiteReflectionRepository } from './SQLiteReflectionRepository';
import { LocalDataManager } from './LocalDataManager';

/**
 * Hook to access user database repositories
 *
 * Provides typed access to all repository implementations.
 * Must be used within a SQLiteProvider context.
 */
export function useUserDatabase() {
  const db = useSQLiteContext();

  const bookmarkRepository = useMemo(() => new SQLiteBookmarkRepository(db), [db]);
  const highlightRepository = useMemo(() => new SQLiteHighlightRepository(db), [db]);
  const notesRepository = useMemo(() => new SQLiteNotesRepository(db), [db]);
  const guideThreadRepository = useMemo(() => new SQLiteGuideThreadRepository(db), [db]);
  const preferencesRepository = useMemo(() => new SQLitePreferencesRepository(db), [db]);
  const dailyPracticeRepository = useMemo(() => new SQLiteDailyPracticeRepository(db), [db]);
  const reflectionRepository = useMemo(() => new SQLiteReflectionRepository(db), [db]);
  const dataManager = useMemo(() => new LocalDataManager(db), [db]);

  return {
    bookmarkRepository,
    highlightRepository,
    notesRepository,
    guideThreadRepository,
    preferencesRepository,
    dailyPracticeRepository,
    reflectionRepository,
    dataManager,
  };
}
