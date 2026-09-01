import React, { createContext, useContext } from 'react';
import * as SQLite from 'expo-sqlite';

/**
 * Context for providing Bible database to the app
 *
 * Separate from user data database context to avoid conflicts
 * when using nested SQLiteProviders.
 */
const BibleDatabaseContext = createContext<SQLite.SQLiteDatabase | null>(null);

export function useBibleDatabase(): SQLite.SQLiteDatabase {
  const db = useContext(BibleDatabaseContext);
  if (!db) {
    throw new Error('useBibleDatabase must be used within BibleDatabaseProvider');
  }
  return db;
}

interface BibleDatabaseProviderProps {
  database: SQLite.SQLiteDatabase;
  children: React.ReactNode;
}

export function BibleDatabaseProvider({ database, children }: BibleDatabaseProviderProps) {
  return <BibleDatabaseContext.Provider value={database}>{children}</BibleDatabaseContext.Provider>;
}
