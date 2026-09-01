import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { HomeIcon, BookIcon, BookmarkIcon } from '@/ui/components/FallbackIcons';
import { getTheme } from '@/ui/theme';

/**
 * Tab Navigation Layout
 *
 * Three primary tabs:
 * - Home: Daily path and verse of the day
 * - Bible: Browse and read Scripture
 * - Saved: Bookmarks, highlights, notes, and reflections
 */
export default function TabLayout() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bible',
          tabBarIcon: ({ color, size }) => <BookIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size }) => <BookmarkIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
