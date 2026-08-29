import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <SQLiteProvider
      databaseName="bible.db"
      assetSource={{ assetId: require('../assets/bible.db') }}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: scheme === 'dark' ? '#000000' : '#FFFFFF',
          },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </SQLiteProvider>
  );
}
