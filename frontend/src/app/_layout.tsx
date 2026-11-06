import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/context';
import { useApp } from '@/context';
import { Button } from '@/components/ui/Button';
import { colors, typography } from '@/theme';
import { decideRouteAccess } from '@/utils/routeAccess';
import { pageTitleFromSegments } from '@/utils/pageTitle';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProvider>
  );
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { user, sessionLoading, sessionError, onboardingPending, landingScreen, refreshSession, dismissSessionError } = useApp();
  const route = segments.filter(segment => !segment.startsWith('(') && segment !== 'index').join('/');
  const pageTitle = pageTitleFromSegments(segments);
  const decision = decideRouteAccess(route, !!user, onboardingPending, landingScreen);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = pageTitle;
    }
  }, [pageTitle]);

  useEffect(() => {
    if (!sessionLoading && !sessionError && decision.action === 'redirect') {
      router.replace(decision.destination as any);
    }
  }, [sessionLoading, sessionError, route, user?.id, onboardingPending, landingScreen, decision.action, decision.action === 'redirect' ? decision.destination : '']);

  const showGate = sessionLoading || !!sessionError || decision.action === 'redirect';
  const gateMessage = sessionLoading ? 'Verificando sua sessão...'
    : user ? 'Preparando sua área...' : 'Abrindo o login...';

  return (
    <View style={styles.navigator}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Protected guard={!user || sessionLoading || !!sessionError}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="cadastro" />
          <Stack.Screen name="recuperar-acesso" />
        </Stack.Protected>

        <Stack.Protected guard={!!user && !sessionLoading && !sessionError && !onboardingPending}>
          <Stack.Screen name="(app)" />
          <Stack.Screen name="atividade/[id]" />
          <Stack.Screen name="atividade/concluir" />
          <Stack.Screen name="atividade/editar" />
          <Stack.Screen name="atividade/nova" />
          <Stack.Screen name="conta/[page]" />
          <Stack.Screen name="lixeira" />
          <Stack.Screen name="mes/[mes]" />
          <Stack.Screen name="meta/atual" />
          <Stack.Screen name="meta/gerenciar" />
        </Stack.Protected>

        <Stack.Protected guard={!!user && !sessionLoading && !sessionError && onboardingPending}>
          <Stack.Screen name="onboarding/[step]" />
          <Stack.Screen name="meta/index" />
          <Stack.Screen name="confirmacao" />
        </Stack.Protected>
      </Stack>

      {sessionError ? (
        <View style={[styles.state, styles.gateOverlay]}>
          <Text style={styles.title}>Não foi possível abrir sua sessão</Text>
          <Text style={styles.message}>{sessionError}</Text>
          <Button title="Tentar novamente" onPress={() => void refreshSession()} />
          <Button title="Ir para o login" variant="secondary" onPress={() => { dismissSessionError(); router.replace('/login' as any); }} />
        </View>
      ) : showGate ? <View style={styles.gateOverlay}><StatusMessage message={gateMessage} /></View> : null}
    </View>
  );
}

function StatusMessage({ message }: { message: string }) {
  return <View style={styles.state}><ActivityIndicator color={colors.blue} /><Text style={styles.message}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  navigator: { flex: 1, backgroundColor: colors.white },
  gateOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 10 },
  state: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  title: { ...typography.h2, color: colors.navy, textAlign: 'center' },
  message: { ...typography.body2, color: colors.gray700, textAlign: 'center', maxWidth: 420 },
});
