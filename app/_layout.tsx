import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';
import {
  initUserDatabase,
  runLegacyMigrations,
  verifyUserDatabase,
} from '@/infrastructure/persistence';
import { BibleDatabaseProvider } from '@/infrastructure/scripture/BibleContext';

/**
 * Initialize user data database
 *
 * Separate database from Bible content for privacy and data management.
 * Runs migrations on first launch if legacy data exists.
 */
function UserDataProvider({ children }: { children: React.ReactNode }) {
  return (
    <SQLiteProvider
      databaseName="userdata.db"
      options={{
        enableChangeListener: false,
      }}
      onInit={async (db: SQLite.SQLiteDatabase) => {
        try {
          initUserDatabase(db);

          const isValid = verifyUserDatabase(db);
          if (!isValid) {
            throw new Error('User database verification failed');
          }

          await runLegacyMigrations(db);

          console.log('User database ready');
        } catch (error) {
          console.error('User database initialization failed:', error);
          throw error;
        }
      }}
    >
      {children}
    </SQLiteProvider>
  );
}

/**
 * Bible database wrapper
 *
 * Captures the Bible database from SQLiteProvider and makes it available
 * through BibleDatabaseProvider context.
 */
function BibleDatabaseWrapper({ children }: { children: React.ReactNode }) {
  const bibleDb = SQLite.useSQLiteContext();
  return <BibleDatabaseProvider database={bibleDb}>{children}</BibleDatabaseProvider>;
}

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <SQLiteProvider
      databaseName="bible.db"
      assetSource={{ assetId: require('../assets/bible.db') }}
    >
      <BibleDatabaseWrapper>
        <UserDataProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: scheme === 'dark' ? '#000000' : '#FFFFFF',
              },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="data" />
            <Stack.Screen name="passage" />
            <Stack.Screen name="reader" />
            <Stack.Screen name="browse" />
            <Stack.Screen name="settings" />
          </Stack>
        </UserDataProvider>
      </BibleDatabaseWrapper>
    </SQLiteProvider>
  );
}
