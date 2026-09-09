import { Stack } from 'expo-router';
export { ErrorBoundary } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';
import {
  initUserDatabase,
  runLegacyMigrations,
  verifyUserDatabase,
} from '@/infrastructure/persistence';
import { BibleDatabaseProvider } from '@/infrastructure/scripture/BibleContext';
import { ThemeProvider, useTheme } from '@/features/preferences/ThemeContext';
import { AuthProvider } from '@/features/auth/AuthContext';

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
            console.warn('User database verification warning');
          }

          await runLegacyMigrations(db);

          console.log('User database ready');
        } catch (error) {
          console.error('User database initialization error:', error);
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

function NavigationStack() {
  const { resolvedScheme, theme } = useTheme();

  return (
    <>
      <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.background,
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
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SQLiteProvider
          databaseName="bible.db"
          assetSource={{ assetId: require('../assets/bible.db') }}
        >
          <BibleDatabaseWrapper>
            <UserDataProvider>
              <NavigationStack />
            </UserDataProvider>
          </BibleDatabaseWrapper>
        </SQLiteProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
