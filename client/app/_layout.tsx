// Root Stack Navigator — wraps the entire app and controls top-level routing between Login and the Customer area.
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts, Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';
import * as SplashScreen from 'expo-splash-screen';

// Must be called at module level so the splash screen is held before the component mounts.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Oswald_400Regular, Oswald_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="customer" />
      <Stack.Screen name="selection" />
      <Stack.Screen name="courier" />
    </Stack>
  );
}
