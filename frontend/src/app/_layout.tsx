import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Mantém a splash screen nativa visível até que a primeira tela esteja pronta
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Oculta a splash screen nativa assim que o layout é montado
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* headerShown: false remove a barra superior padrão para termos controle total do layout */}
      <Stack.Screen name="index" />
    </Stack>
  );
}