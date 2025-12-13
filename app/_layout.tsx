import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cyberpunk } from '../lib/theme/colors';
import Constants from 'expo-constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000,
    },
  },
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Initialize notifications and background task (skip in Expo Go)
  useEffect(() => {
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
      // Notifications not supported in Expo Go for SDK 53+
      return;
    }

    const initNotifications = async () => {
      try {
        // Dynamic import to avoid loading expo-notifications in Expo Go
        const notifications = await import('../lib/notifications');
        notifications.configureNotifications();
        await notifications.setupNotificationChannel();
        await notifications.registerBackgroundAlertTask();
      } catch (error) {
        // Log for diagnostics in development builds
        console.warn('[Notifications] Setup failed:', error);
      }
    };
    initNotifications();
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1, backgroundColor: cyberpunk.bgPrimary }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: cyberpunk.bgPrimary },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
