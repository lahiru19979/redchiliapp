import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import LoadingScreen from '../src/components/LoadingScreen';

export const unstable_settings = {
  anchor: '(tabs)',
};
function RootStack() {
  // Use the useAuth hook to get the initial loading state
  const { isLoading } = useAuth();
  
  // Show the dedicated LoadingScreen while the auth state is being checked
  if (isLoading) {
      return <LoadingScreen />; 
  }

  return (
    <Stack>
      {/* This screen group is for unauthenticated routes (login, register) */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      
      {/* This screen group is for authenticated routes (home, profile, etc.) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
export default function RootLayout() {
  return (
    // The entire application is wrapped in AuthProvider
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}
