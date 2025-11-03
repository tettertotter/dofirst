/**
 * Root Layout for Mobile App
 * Initializes notifications and sets up navigation
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initializeNotifications } from '@todaypool/notifications';

export default function RootLayout() {
  useEffect(() => {
    // Initialize platform-specific notifications
    // This sets up action categories (iOS) and notification channels (Android)
    initializeNotifications();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
