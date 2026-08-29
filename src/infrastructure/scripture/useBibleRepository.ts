import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { SQLiteBibleRepository } from './SQLiteBibleRepository';

/**
 * Hook to access the SQLiteBibleRepository
 *
 * Uses the SQLite database provided by SQLiteProvider in the app root.
 * The database is pre-populated with the World English Bible and bundled with the app.
 */
export function useBibleRepository(): SQLiteBibleRepository {
  const db = useSQLiteContext();

  return useMemo(() => new SQLiteBibleRepository(db), [db]);
}
