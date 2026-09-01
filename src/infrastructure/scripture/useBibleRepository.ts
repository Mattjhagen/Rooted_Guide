import { useMemo } from 'react';
import { SQLiteBibleRepository } from './SQLiteBibleRepository';
import { useBibleDatabase } from './BibleContext';

/**
 * Hook to access the SQLiteBibleRepository
 *
 * Uses the Bible database provided by BibleDatabaseProvider in the app root.
 * The database is pre-populated with the World English Bible and bundled with the app.
 */
export function useBibleRepository(): SQLiteBibleRepository {
  const db = useBibleDatabase();

  return useMemo(() => new SQLiteBibleRepository(db), [db]);
}
