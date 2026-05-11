// Root Stack Navigator — wraps the entire app and controls top-level routing between Login and the Customer area.
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="customer" />
    </Stack>
  );
}
