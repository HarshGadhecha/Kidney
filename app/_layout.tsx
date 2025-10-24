import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import database from '@/lib/database';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, loadStoredAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  // Initialize database and load auth
  useEffect(() => {
    async function initialize() {
      try {
        await database.initDatabase();
        await loadStoredAuth();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsReady(true);
      }
    }
    initialize();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated, redirect to auth
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated but in auth screens, redirect to app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isReady]);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
